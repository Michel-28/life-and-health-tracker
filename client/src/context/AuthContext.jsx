import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setSettings(res.data.settings);
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    const meRes = await api.get('/auth/me');
    setSettings(meRes.data.settings);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    const meRes = await api.get('/auth/me');
    setSettings(meRes.data.settings);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSettings(null);
  };

  const updateSettings = async (updatedSettings) => {
    const res = await api.put('/auth/settings', updatedSettings);
    setSettings(res.data.settings);
    return res.data.settings;
  };

  const refreshUser = async () => {
    if (token) {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setSettings(res.data.settings);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        token,
        loading,
        login,
        register,
        logout,
        updateSettings,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

