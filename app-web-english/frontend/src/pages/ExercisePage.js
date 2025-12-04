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
  const [highlightedText, setHighlightedText] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [pronunciationAccuracy, setPronunciationAccuracy] = useState(null);
  const recognitionRef = useRef(null);

  const translations = {
    en: { back: 'Back', targetText: 'Say this', yourSpeech: 'You said', startRecording: 'Start Recording', stopRecording: 'Stop Recording', recording: 'Recording...', submit: 'Submit Result', excellent: 'Excellent!', good: 'Good job!', needsImprovement: 'Keep practicing!', listenCorrect: 'Listen', tryAgain: 'Try Again', score: 'Score', pronunciation: 'Pronunciation' },
    es: { back: 'Volver', targetText: 'Di esto', yourSpeech: 'Dijiste', startRecording: 'Comenzar Grabación', stopRecording: 'Detener Grabación', recording: 'Grabando...', submit: 'Enviar Resultado', excellent: '¡Excelente!', good: '¡Buen trabajo!', needsImprovement: '¡Sigue practicando!', listenCorrect: 'Escuchar', tryAgain: 'Intentar de Nuevo', score: 'Puntuación', pronunciation: 'Pronunciación' },
  };

  const t = translations[language];

  // Cargar ejercicio
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await axios.get(`${API}/exercises/${id}`);
        setExercise(res.data);
      } catch (err) {
        toast.error('Failed to load exercise');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [id]);

  // Inicializar reconocimiento solo después de cargar el ejercicio
  useEffect(() => {
    if (!exercise) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported');
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
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [exercise]);

  // Funciones de cálculo
  const normalizeText = (text) => text.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  
  const levenshteinDistance = (a, b) => {
    const dp = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[0][i] = i;
    for (let j = 0; j <= b.length; j++) dp[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        dp[j][i] = a[i-1] === b[j-1] ? dp[j-1][i-1] : Math.min(dp[j-1][i-1]+1, dp[j][i-1]+1, dp[j-1][i]+1);
      }
    }
    return dp[b.length][a.length];
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    if (longer.length === 0) return 1;
    return (longer.length - levenshteinDistance(str1, str2)) / longer.length;
  };

  const calculateWordAccuracy = (targetWords, spokenWords) => {
    return targetWords.map((word, i) => {
      const spoken = spokenWords[i] || '';
      const sim = calculateSimilarity(word, spoken);
      if (sim >= 0.8) return { word, correct: true, partial: false };
      if (sim >= 0.5) return { word, correct: false, partial: true };
      return { word, correct: false, partial: false };
    });
  };

  const calculateAccuracy = (spokenText) => {
    if (!exercise) return;

    const target = normalizeText(exercise.content);
    const spoken = normalizeText(spokenText);
    const similarity = calculateSimilarity(target, spoken);
    const targetWords = target.split(' ');
    const spokenWords = spoken.split(' ');
    const highlights = calculateWordAccuracy(targetWords, spokenWords);
    setHighlightedText(highlights);

    const pronunciationScore = Math.round(similarity * 100);
    setPronunciationAccuracy(pronunciationScore);
    setScore(pronunciationScore);

    const correctWords = highlights.filter(h => h.correct).length;
    const accuracyByWords = (correctWords / targetWords.length) * 100;

    if (similarity >= 0.8 || accuracyByWords >= 80) setFeedback({ type: 'success', message: t.excellent });
    else if (similarity >= 0.6 || accuracyByWords >= 60) setFeedback({ type: 'warning', message: t.good });
    else setFeedback({ type: 'error', message: t.needsImprovement });
  };

  // Botones
  const handleStartRecording = () => {
    if (!recognitionRef.current) return;
    setRecognizedText(''); setFeedback(null); setScore(null); setPronunciationAccuracy(null);
    setIsRecording(true); recognitionRef.current.start();
  };
  const handleStopRecording = () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  const handlePlayAudio = () => { if (!exercise) return; const utter = new SpeechSynthesisUtterance(exercise.content); utter.lang='en-US'; utter.rate=0.8; window.speechSynthesis.speak(utter); };
  const handleTryAgain = () => { setRecognizedText(''); setHighlightedText([]); setFeedback(null); setScore(null); setPronunciationAccuracy(null); };
  const handleSubmit = async () => {
    if (score === null || pronunciationAccuracy === null) return toast.error('Complete recording first');
    try { await axios.post(`${API}/progress`, { exercise_id: exercise.id, score, pronunciation_accuracy: pronunciationAccuracy, feedback: feedback?.message || '' }); toast.success('Progress saved!'); navigate('/student'); }
    catch (err) { toast.error('Failed to save progress'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-semibold text-purple-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <Button variant="outline" onClick={() => navigate('/student')} className="mb-4"><ArrowLeft /> {t.back}</Button>

      <h1 className="text-3xl sm:text-4xl font-bold">{exercise.title}</h1>
      <p className="text-gray-600 mb-6">{exercise.description}</p>

      <Card><CardHeader><CardTitle>{t.targetText}</CardTitle></CardHeader>
        <CardContent className="text-center text-4xl font-bold text-purple-600">
          {highlightedText.length ? highlightedText.map((w,i)=>(
            <span key={i} className={w.correct?'text-green-600 font-bold':w.partial?'text-orange-500 font-semibold':'text-red-600 font-bold'}>{w.word} </span>
          )) : exercise.content}
        </CardContent>
        <CardContent className="text-center"><Button onClick={handlePlayAudio}>{t.listenCorrect}</Button></CardContent>
      </Card>

      <Card className="mt-4 text-center">
        <CardContent>
          <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`w-24 h-24 rounded-full ${isRecording?'bg-red-500':'bg-purple-500'}`}><Mic className="w-12 h-12 m-auto text-white"/></button>
          <p>{isRecording ? t.recording : t.startRecording}</p>
        </CardContent>
      </Card>

      {recognizedText && <Card className="mt-4"><CardHeader><CardTitle>{t.yourSpeech}</CardTitle></CardHeader><CardContent className="text-2xl text-center">{recognizedText}</CardContent></Card>}

      {feedback && <Card className={`mt-4 border-2 ${feedback.type==='success'?'border-green-500 bg-green-50':feedback.type==='warning'?'border-yellow-500 bg-yellow-50':'border-red-500 bg-red-50'}`}>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {feedback.type==='success'?<CheckCircle className="w-8 h-8 text-green-500"/>:feedback.type==='warning'?<CheckCircle className="w-8 h-8 text-yellow-500"/>:<XCircle className="w-8 h-8 text-red-500"/>}
            <p className="text-lg font-semibold">{feedback.message}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span>{t.score}</span><span>{score}%</span></div><Progress value={score}/>
            <div className="flex justify-between"><span>{t.pronunciation}</span><span>{pronunciationAccuracy}%</span></div><Progress value={pronunciationAccuracy}/>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} className="flex-1 bg-green-500"> {t.submit} </Button>
            <Button onClick={handleTryAgain} variant="outline" className="flex-1">{t.tryAgain}</Button>
          </div>
        </CardContent>
      </Card>}
    </div>
  );
};

export default ExercisePage;
