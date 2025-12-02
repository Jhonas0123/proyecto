import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Volume2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ExercisePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useContext(AuthContext);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [pronunciationAccuracy, setPronunciationAccuracy] = useState(null);
  const recognitionRef = useRef(null);

  const translations = {
    en: {
      back: 'Back to Dashboard',
      exercise: 'Exercise',
      instructions: 'Click the microphone and speak the word/phrase shown below',
      targetText: 'Say this',
      yourSpeech: 'You said',
      listenCorrect: 'Listen to correct pronunciation',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      recording: 'Recording...',
      submit: 'Submit Result',
      excellent: 'Excellent! Perfect pronunciation!',
      good: 'Good job! Keep practicing!',
      needsImprovement: 'Keep trying! Practice makes perfect!',
      score: 'Score',
      pronunciation: 'Pronunciation Accuracy',
      tryAgain: 'Try Again',
      noSupport: 'Speech recognition is not supported in your browser',
      micPermission: 'Important: Allow microphone access when your browser asks for permission.',
    },
    es: {
      back: 'Volver al Panel',
      exercise: 'Ejercicio',
      instructions: 'Haz clic en el micrófono y di la palabra/frase que se muestra a continuación',
      targetText: 'Di esto',
      yourSpeech: 'Dijiste',
      listenCorrect: 'Escucha la pronunciación correcta',
      startRecording: 'Comenzar Grabación',
      stopRecording: 'Detener Grabación',
      recording: 'Grabando...',
      submit: 'Enviar Resultado',
      excellent: '¡Excelente! ¡Pronunciación perfecta!',
      good: '¡Buen trabajo! ¡Sigue practicando!',
      needsImprovement: '¡Sigue intentando! ¡La práctica hace al maestro!',
      score: 'Puntuación',
      pronunciation: 'Precisión de Pronunciación',
      tryAgain: 'Intentar de Nuevo',
      noSupport: 'El reconocimiento de voz no es compatible con tu navegador',
      micPermission: 'Importante: Permite el acceso al micrófono cuando tu navegador lo solicite.',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchExercise();
    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [id]);

  const fetchExercise = async () => {
    try {
      const response = await axios.get(`${API}/exercises/${id}`);
      setExercise(response.data);
    } catch (error) {
      toast.error('Failed to load exercise');
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(t.noSupport);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
      setIsRecording(false);
      calculateAccuracy(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      // Handle specific error types
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        toast.error(language === 'en' 
          ? 'Microphone permission denied. Please allow microphone access.' 
          : 'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
      } else if (event.error === 'no-speech') {
        toast.warning(language === 'en' 
          ? 'No speech detected. Please try speaking again.' 
          : 'No se detectó habla. Por favor, intenta hablar de nuevo.');
      } else if (event.error === 'network') {
        toast.error(language === 'en' 
          ? 'Network error. Please check your connection.' 
          : 'Error de red. Por favor, verifica tu conexión.');
      } else if (event.error === 'aborted') {
        // Don't show error for aborted (user stopped manually)
        return;
      } else {
        toast.error(language === 'en' 
          ? 'Speech recognition error. Please try again.' 
          : 'Error de reconocimiento de voz. Por favor, intenta de nuevo.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  };

  const calculateAccuracy = (spokenText) => {
    if (!exercise) return;

    const targetText = exercise.content.toLowerCase().trim();
    const spoken = spokenText.toLowerCase().trim();

    // Calculate similarity
    const similarity = calculateSimilarity(targetText, spoken);
    const pronunciationScore = Math.round(similarity * 100);
    const overallScore = pronunciationScore;

    setPronunciationAccuracy(pronunciationScore);
    setScore(overallScore);

    if (pronunciationScore >= 80) {
      setFeedback({ type: 'success', message: t.excellent });
    } else if (pronunciationScore >= 60) {
      setFeedback({ type: 'warning', message: t.good });
    } else {
      setFeedback({ type: 'error', message: t.needsImprovement });
    }
  };

  const calculateSimilarity = (str1, str2) => {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      toast.error(t.noSupport);
      return;
    }

    // Reset state
    setRecognizedText('');
    setFeedback(null);
    setScore(null);
    setPronunciationAccuracy(null);
    
    try {
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsRecording(false);
      
      // Handle "already started" error
      if (error.message && error.message.includes('already started')) {
        toast.warning(language === 'en' 
          ? 'Recording already in progress' 
          : 'Grabación ya en progreso');
      } else {
        toast.error(language === 'en' 
          ? 'Failed to start recording. Please try again.' 
          : 'No se pudo iniciar la grabación. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    }
  };

  const handlePlayAudio = () => {
    if (!exercise) return;

    const utterance = new SpeechSynthesisUtterance(exercise.content);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async () => {
    if (score === null || pronunciationAccuracy === null) {
      toast.error('Please complete the recording first');
      return;
    }

    try {
      await axios.post(`${API}/progress`, {
        exercise_id: exercise.id,
        score: score,
        pronunciation_accuracy: pronunciationAccuracy,
        feedback: feedback?.message || '',
      });
      toast.success('Progress saved successfully!');
      navigate('/student');
    } catch (error) {
      toast.error('Failed to save progress');
    }
  };

  const handleTryAgain = () => {
    setRecognizedText('');
    setFeedback(null);
    setScore(null);
    setPronunciationAccuracy(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-2xl font-semibold text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          data-testid="back-to-dashboard-btn"
          variant="outline"
          onClick={() => navigate('/student')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{exercise.title}</h1>
        <p className="text-gray-600 mt-2">{exercise.description}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-gray-700">{t.instructions}</p>
          </CardContent>
        </Card>

        {/* Target Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.targetText}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 mb-4">{exercise.content}</p>
              <Button
                data-testid="play-audio-btn"
                variant="outline"
                onClick={handlePlayAudio}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                {t.listenCorrect}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <button
                data-testid="record-btn"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 pulse-animation'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                } shadow-lg`}
              >
                <Mic className="w-12 h-12 text-white" />
              </button>
              <p className="text-gray-600">
                {isRecording ? t.recording : t.startRecording}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recognized Text */}
        {recognizedText && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.yourSpeech}</CardTitle>
            </CardHeader>
            <CardContent>
              <p data-testid="recognized-text" className="text-2xl font-semibold text-gray-800 text-center">{recognizedText}</p>
            </CardContent>
          </Card>
        )}

        {/* Feedback */}
        {feedback && (
          <Card className={`border-2 ${
            feedback.type === 'success' ? 'border-green-500 bg-green-50' :
            feedback.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : feedback.type === 'warning' ? (
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <p data-testid="feedback-message" className="text-lg font-semibold text-gray-800">{feedback.message}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700">{t.score}</span>
                    <span data-testid="score-value" className="text-sm font-semibold text-gray-800">{score}%</span>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700">{t.pronunciation}</span>
                    <span data-testid="pronunciation-value" className="text-sm font-semibold text-gray-800">{pronunciationAccuracy}%</span>
                  </div>
                  <Progress value={pronunciationAccuracy} className="h-3" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  data-testid="submit-result-btn"
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {t.submit}
                </Button>
                <Button
                  data-testid="try-again-btn"
                  onClick={handleTryAgain}
                  variant="outline"
                  className="flex-1"
                >
                  {t.tryAgain}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExercisePage;
