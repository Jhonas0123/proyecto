import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Users, BookOpen, Globe, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, language, setLanguage } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [vocabularyLists, setVocabularyLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [vocabDialogOpen, setVocabDialogOpen] = useState(false);

  const translations = {
    en: {
      welcome: 'Welcome',
      dashboard: 'Teacher Dashboard',
      logout: 'Logout',
      myExercises: 'My Exercises',
      students: 'Students',
      vocabulary: 'Vocabulary Lists',
      createExercise: 'Create Exercise',
      createVocabList: 'Create Vocabulary List',
      totalStudents: 'Total Students',
      exercisesCreated: 'Exercises Created',
      studentName: 'Student Name',
      exercisesCompleted: 'Completed',
      avgScore: 'Avg Score',
      avgPronunciation: 'Avg Pronunciation',
      title: 'Title',
      description: 'Description',
      type: 'Type',
      difficulty: 'Difficulty',
      content: 'Content',
      create: 'Create',
      cancel: 'Cancel',
      delete: 'Delete',
      name: 'Name',
      words: 'Words (comma separated)',
      noExercises: 'No exercises created yet',
      noStudents: 'No students registered yet',
    },
    es: {
      welcome: 'Bienvenido',
      dashboard: 'Panel del Maestro',
      logout: 'Cerrar Sesión',
      myExercises: 'Mis Ejercicios',
      students: 'Estudiantes',
      vocabulary: 'Listas de Vocabulario',
      createExercise: 'Crear Ejercicio',
      createVocabList: 'Crear Lista de Vocabulario',
      totalStudents: 'Total de Estudiantes',
      exercisesCreated: 'Ejercicios Creados',
      studentName: 'Nombre del Estudiante',
      exercisesCompleted: 'Completados',
      avgScore: 'Puntuación Promedio',
      avgPronunciation: 'Pronunciación Promedio',
      title: 'Título',
      description: 'Descripción',
      type: 'Tipo',
      difficulty: 'Dificultad',
      content: 'Contenido',
      create: 'Crear',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      name: 'Nombre',
      words: 'Palabras (separadas por comas)',
      noExercises: 'No hay ejercicios creados aún',
      noStudents: 'No hay estudiantes registrados aún',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, exercisesRes, vocabRes] = await Promise.all([
        axios.get(`${API}/dashboard/teacher`),
        axios.get(`${API}/exercises`),
        axios.get(`${API}/vocabulary-lists`),
      ]);
      setDashboard(dashboardRes.data);
      setExercises(exercisesRes.data.filter(ex => ex.teacher_id === user.id));
      setVocabularyLists(vocabRes.data.filter(vl => vl.teacher_id === user.id));
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      exercise_type: formData.get('exercise_type'),
      content: formData.get('content'),
      difficulty: formData.get('difficulty'),
    };

    try {
      await axios.post(`${API}/exercises`, data);
      toast.success('Exercise created successfully!');
      setCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create exercise');
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await axios.delete(`${API}/exercises/${exerciseId}`);
      toast.success('Exercise deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete exercise');
    }
  };

  const handleCreateVocabList = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const wordsString = formData.get('words');
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      words: wordsString.split(',').map(w => w.trim()).filter(w => w),
    };

    try {
      await axios.post(`${API}/vocabulary-lists`, data);
      toast.success('Vocabulary list created!');
      setVocabDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create vocabulary list');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-2xl font-semibold text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {t.welcome}, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">{t.dashboard}</p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="teacher-language-toggle-btn"
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'ES' : 'EN'}
          </Button>
          <Button
            data-testid="teacher-logout-btn"
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.totalStudents}</p>
                <p className="text-3xl font-bold text-gray-800">{dashboard?.total_students || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.exercisesCreated}</p>
                <p className="text-3xl font-bold text-gray-800">{dashboard?.total_exercises_created || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger data-testid="exercises-tab" value="exercises">{t.myExercises}</TabsTrigger>
          <TabsTrigger data-testid="students-tab" value="students">{t.students}</TabsTrigger>
          <TabsTrigger data-testid="vocabulary-tab" value="vocabulary">{t.vocabulary}</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.myExercises}</CardTitle>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="create-exercise-btn" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createExercise}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.createExercise}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateExercise} className="space-y-4">
                    <div>
                      <Label htmlFor="title">{t.title}</Label>
                      <Input data-testid="exercise-title-input" id="title" name="title" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="description">{t.description}</Label>
                      <Textarea data-testid="exercise-description-input" id="description" name="description" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="exercise_type">{t.type}</Label>
                      <Select name="exercise_type" required>
                        <SelectTrigger data-testid="exercise-type-select" className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="word">Word</SelectItem>
                          <SelectItem value="phrase">Phrase</SelectItem>
                          <SelectItem value="listening">Listening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content">{t.content}</Label>
                      <Input data-testid="exercise-content-input" id="content" name="content" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">{t.difficulty}</Label>
                      <Select name="difficulty" required>
                        <SelectTrigger data-testid="exercise-difficulty-select" className="mt-1">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button data-testid="create-exercise-submit-btn" type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">{t.create}</Button>
                      <Button data-testid="create-exercise-cancel-btn" type="button" variant="outline" className="flex-1" onClick={() => setCreateDialogOpen(false)}>{t.cancel}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {exercises.length === 0 ? (
                <p data-testid="no-exercises-teacher-msg" className="text-gray-500 text-center py-8">{t.noExercises}</p>
              ) : (
                <div className="space-y-3">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} data-testid={`teacher-exercise-${exercise.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">{exercise.title}</h3>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{exercise.exercise_type}</span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">{exercise.difficulty}</span>
                        </div>
                      </div>
                      <Button
                        data-testid={`delete-exercise-btn-${exercise.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>{t.students}</CardTitle>
            </CardHeader>
            <CardContent>
              {!dashboard?.student_performance || dashboard.student_performance.length === 0 ? (
                <p data-testid="no-students-msg" className="text-gray-500 text-center py-8">{t.noStudents}</p>
              ) : (
                <div className="space-y-3">
                  {dashboard.student_performance.map((student, idx) => (
                    <div key={student.student_id} data-testid={`student-performance-${idx}`} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{student.student_name}</h3>
                          <p className="text-sm text-gray-600">{student.student_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{t.exercisesCompleted}: <span className="font-semibold">{student.total_exercises}</span></p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm">
                          <span className="text-gray-600">{t.avgScore}: </span>
                          <span className="font-semibold text-green-600">{student.average_score}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">{t.avgPronunciation}: </span>
                          <span className="font-semibold text-purple-600">{student.average_pronunciation}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.vocabulary}</CardTitle>
              <Dialog open={vocabDialogOpen} onOpenChange={setVocabDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="create-vocab-btn" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createVocabList}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.createVocabList}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateVocabList} className="space-y-4">
                    <div>
                      <Label htmlFor="vocab-name">{t.name}</Label>
                      <Input data-testid="vocab-name-input" id="vocab-name" name="name" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="vocab-description">{t.description}</Label>
                      <Textarea data-testid="vocab-description-input" id="vocab-description" name="description" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="vocab-words">{t.words}</Label>
                      <Textarea data-testid="vocab-words-input" id="vocab-words" name="words" placeholder="apple, banana, orange" required className="mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <Button data-testid="create-vocab-submit-btn" type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">{t.create}</Button>
                      <Button data-testid="create-vocab-cancel-btn" type="button" variant="outline" className="flex-1" onClick={() => setVocabDialogOpen(false)}>{t.cancel}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {vocabularyLists.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No vocabulary lists created yet</p>
              ) : (
                <div className="space-y-3">
                  {vocabularyLists.map((list) => (
                    <div key={list.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-1">{list.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{list.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {list.words.map((word, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{word}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;