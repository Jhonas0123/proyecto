import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Globe, UserCircle, GraduationCap } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, language, setLanguage } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      role: 'I am a...',
      student: 'Student',
      teacher: 'Teacher',
      loginBtn: 'Sign In',
      registerBtn: 'Sign Up',
      loginSuccess: 'Welcome back!',
      registerSuccess: 'Account created successfully!',
      error: 'Something went wrong',
    },
    es: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      name: 'Nombre Completo',
      role: 'Soy un...',
      student: 'Estudiante',
      teacher: 'Maestro',
      loginBtn: 'Iniciar Sesión',
      registerBtn: 'Registrarse',
      loginSuccess: '¡Bienvenido de nuevo!',
      registerSuccess: '¡Cuenta creada exitosamente!',
      error: 'Algo salió mal',
    },
  };

  const t = translations[language];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await axios.post(`${API}/auth/login`, data);
      login(response.data.access_token, response.data.user);
      toast.success(t.loginSuccess);
      navigate(response.data.user.role === 'student' ? '/student' : '/teacher');
    } catch (error) {
      toast.error(error.response?.data?.detail || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: formData.get('role'),
    };

    try {
      const response = await axios.post(`${API}/auth/register`, data);
      login(response.data.access_token, response.data.user);
      toast.success(t.registerSuccess);
      navigate(response.data.user.role === 'student' ? '/student' : '/teacher');
    } catch (error) {
      toast.error(error.response?.data?.detail || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          data-testid="auth-language-toggle-btn"
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm"
        >
          <Globe className="w-4 h-4" />
          {language === 'en' ? 'ES' : 'EN'}
        </Button>
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EnglishFun
          </h1>
          <p className="text-gray-600 text-sm">Learn English with joy!</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger data-testid="login-tab" value="login">{t.login}</TabsTrigger>
            <TabsTrigger data-testid="register-tab" value="register">{t.register}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">{t.email}</Label>
                <Input
                  data-testid="login-email-input"
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="login-password">{t.password}</Label>
                <Input
                  data-testid="login-password-input"
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className="mt-1"
                />
              </div>
              <Button
                data-testid="login-submit-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? 'Loading...' : t.loginBtn}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-name">{t.name}</Label>
                <Input
                  data-testid="register-name-input"
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="register-email">{t.email}</Label>
                <Input
                  data-testid="register-email-input"
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="register-password">{t.password}</Label>
                <Input
                  data-testid="register-password-input"
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="register-role">{t.role}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:border-purple-500 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <input data-testid="register-role-student" type="radio" name="role" value="student" required className="sr-only" />
                    <UserCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{t.student}</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:border-purple-500 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <input data-testid="register-role-teacher" type="radio" name="role" value="teacher" required className="sr-only" />
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-sm font-medium">{t.teacher}</span>
                  </label>
                </div>
              </div>
              <Button
                data-testid="register-submit-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? 'Loading...' : t.registerBtn}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;