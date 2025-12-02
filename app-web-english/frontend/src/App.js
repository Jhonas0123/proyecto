import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import ExercisePage from '@/pages/ExercisePage';
import { Toaster } from '@/components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-2xl font-semibold text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, language, setLanguage }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/teacher'} /> : <LandingPage />} />
          <Route path="/auth" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/teacher'} /> : <AuthPage />} />
          <Route path="/student" element={user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
          <Route path="/teacher" element={user && user.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
          <Route path="/exercise/:id" element={user && user.role === 'student' ? <ExercisePage /> : <Navigate to="/" />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;