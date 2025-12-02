import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LogOut, BookOpen, TrendingUp, Globe, Award } from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, language, setLanguage } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      welcome: 'Welcome back',
      dashboard: 'My Dashboard',
      logout: 'Logout',
      availableExercises: 'Available Exercises',
      myStats: 'My Statistics',
      totalCompleted: 'Exercises Completed',
      avgScore: 'Average Score',
      avgPronunciation: 'Pronunciation',
      recentActivity: 'Recent Activity',
      score: 'Score',
      pronunciation: 'Pronunciation',
      startExercise: 'Start',
      noExercises: 'No exercises available yet',
    },
    es: {
      welcome: 'Bienvenido de nuevo',
      dashboard: 'Mi Panel',
      logout: 'Cerrar Sesión',
      availableExercises: 'Ejercicios Disponibles',
      myStats: 'Mis Estadísticas',
      totalCompleted: 'Ejercicios Completados',
      avgScore: 'Puntuación Promedio',
      avgPronunciation: 'Pronunciación',
      recentActivity: 'Actividad Reciente',
      score: 'Puntuación',
      pronunciation: 'Pronunciación',
      startExercise: 'Comenzar',
      noExercises: 'No hay ejercicios disponibles aún',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, exercisesRes] = await Promise.all([
        axios.get(`${API}/dashboard/student`),
        axios.get(`${API}/exercises`),
      ]);
      setDashboard(dashboardRes.data);
      setExercises(exercisesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
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
    <div data-testid="student-dashboard" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">\n      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {t.welcome}, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">{t.dashboard}</p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="student-language-toggle-btn"
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'ES' : 'EN'}
          </Button>
          <Button
            data-testid="student-logout-btn"
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-blue-500" />}
          title={t.totalCompleted}
          value={dashboard?.total_exercises_completed || 0}
          color="bg-blue-100"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          title={t.avgScore}
          value={`${dashboard?.average_score || 0}%`}
          progress={dashboard?.average_score || 0}
          color="bg-green-100"
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-purple-500" />}
          title={t.avgPronunciation}
          value={`${dashboard?.average_pronunciation || 0}%`}
          progress={dashboard?.average_pronunciation || 0}
          color="bg-purple-100"
        />
      </div>

      {/* Available Exercises */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{t.availableExercises}</CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <p data-testid="no-exercises-msg" className="text-gray-500 text-center py-8">{t.noExercises}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onClick={() => navigate(`/exercise/${exercise.id}`)}
                  t={t}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {dashboard?.recent_progress && dashboard.recent_progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.recent_progress.map((progress, idx) => (
                <div key={idx} data-testid={`recent-activity-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Exercise {progress.exercise_id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">{new Date(progress.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{t.score}: <span className="font-semibold text-green-600">{progress.score}%</span></p>
                    <p className="text-sm text-gray-600">{t.pronunciation}: <span className="font-semibold text-purple-600">{progress.pronunciation_accuracy}%</span></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, progress, color }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
      </div>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      {progress !== undefined && <Progress value={progress} className="h-2" />}
    </CardContent>
  </Card>
);

const ExerciseCard = ({ exercise, onClick, t }) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  const typeIcons = {
    word: '📖',
    phrase: '💬',
    listening: '🎧',
  };

  return (
    <Card data-testid={`exercise-card-${exercise.id}`} className="hover:shadow-lg cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{typeIcons[exercise.exercise_type]}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
        </div>
        <CardTitle className="text-lg">{exercise.title}</CardTitle>
        <CardDescription className="text-sm">{exercise.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button data-testid={`start-exercise-btn-${exercise.id}`} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {t.startExercise}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentDashboard;