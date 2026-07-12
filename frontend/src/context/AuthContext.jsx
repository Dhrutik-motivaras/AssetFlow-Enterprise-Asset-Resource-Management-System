import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuth() {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const res = await api.get('accounts/me/');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (error) {
          console.error('Session validation failed:', error);
          // If profile check fails, clear token states
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('accounts/login/', {
        username: email,
        password: password,
      });
      const { access, refresh, user: userData } = res.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Invalid email or password.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('accounts/register/', formData);
      return { success: true, message: res.data.detail };
    } catch (error) {
      let errorMsg = 'Failed to register employee.';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          // Flatten dictionary errors (e.g. {email: ["Email already exists"]})
          errorMsg = Object.values(data).flat().join(' ');
        } else {
          errorMsg = data;
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
