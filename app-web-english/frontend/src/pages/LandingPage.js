import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Mic, BookOpen, TrendingUp, Users, Globe } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(AuthContext);

  const translations = {
    en: {
      title: 'Learn English with Fun!',
      subtitle: 'Practice pronunciation and listening comprehension',
      getStarted: 'Get Started',
      feature1Title: 'Voice Recognition',
      feature1Desc: 'Real-time pronunciation feedback',
      feature2Title: 'Interactive Lessons',
      feature2Desc: 'Fun exercises for vocabulary and phrases',
      feature3Title: 'Track Progress',
      feature3Desc: 'See your improvement over time',
      feature4Title: 'Teacher Dashboard',
      feature4Desc: 'Create exercises and monitor students',
    },
    es: {
      title: '¡Aprende Inglés Divirtiéndote!',
      subtitle: 'Practica pronunciación y comprensión auditiva',
      getStarted: 'Comenzar',
      feature1Title: 'Reconocimiento de Voz',
      feature1Desc: 'Retroalimentación de pronunciación en tiempo real',
      feature2Title: 'Lecciones Interactivas',
      feature2Desc: 'Ejercicios divertidos de vocabulario y frases',
      feature3Title: 'Seguimiento de Progreso',
      feature3Desc: 'Ve tu mejora con el tiempo',
      feature4Title: 'Panel de Maestro',
      feature4Desc: 'Crea ejercicios y monitorea estudiantes',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          data-testid="language-toggle-btn"
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm"
        >
          <Globe className="w-4 h-4" />
          {language === 'en' ? 'ES' : 'EN'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.subtitle}
          </p>
          <Button
            data-testid="get-started-btn"
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {t.getStarted}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard
            icon={<Mic className="w-8 h-8 text-purple-500" />}
            title={t.feature1Title}
            description={t.feature1Desc}
            delay="0s"
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-blue-500" />}
            title={t.feature2Title}
            description={t.feature2Desc}
            delay="0.1s"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-pink-500" />}
            title={t.feature3Title}
            description={t.feature3Desc}
            delay="0.2s"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-indigo-500" />}
            title={t.feature4Title}
            description={t.feature4Desc}
            delay="0.3s"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <div
    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default LandingPage;