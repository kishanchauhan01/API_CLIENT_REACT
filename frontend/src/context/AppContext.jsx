import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [environments, setEnvironments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeEnvId, setActiveEnvId] = useState(null);
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'dark');
  const [interceptor, setInterceptorState] = useState(() => localStorage.getItem('interceptor') || 'browser');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  // ─── Auth helpers ────────────────────────────────────────────
  const login = (tokenVal, userObj) => {
    setToken(tokenVal);
    setUser(userObj);
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCollections([]);
    setEnvironments([]);
    setActiveEnvId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ─── Theme ───────────────────────────────────────────────────
  const setTheme = (value) => {
    setThemeState(value);
    localStorage.setItem('theme', value);
  };

  const setInterceptor = (value) => {
    setInterceptorState(value);
    localStorage.setItem('interceptor', value);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('system-theme');
    } else if (theme === 'system') {
      root.classList.add('system-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.remove('light-theme', 'system-theme');
    }
  }, [theme]);

  // ─── Load data on auth ──────────────────────────────────────
  const fetchCollections = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/collections');
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    }
  }, [token]);

  const fetchEnvironments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/environments');
      setEnvironments(res.data);
      const active = res.data.find(e => e.active);
      setActiveEnvId(active?.id || null);
    } catch (err) {
      console.error('Failed to fetch environments:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
      fetchEnvironments();
    }
  }, [isAuthenticated, fetchCollections, fetchEnvironments]);

  // ─── Collection actions ─────────────────────────────────────
  const addCollection = async (name, description) => {
    try {
      const res = await api.post('/collections', { name, description });
      setCollections(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error('Failed to create collection:', err);
      throw err;
    }
  };

  const deleteCollection = async (id) => {
    try {
      await api.delete(`/collections/${id}`);
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete collection:', err);
    }
  };

  const addRequestToCollection = async (collectionId, request) => {
    try {
      const res = await api.post(`/collections/${collectionId}/requests`, request);
      setCollections(prev => prev.map(c => c.id === collectionId ? res.data : c));
    } catch (err) {
      console.error('Failed to add request:', err);
    }
  };

  // ─── Environment actions ────────────────────────────────────
  const addEnvironment = async (name, variables) => {
    try {
      const res = await api.post('/environments', { name, variables });
      setEnvironments(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Failed to create environment:', err);
    }
  };

  const updateEnvironment = async (id, name, variables) => {
    try {
      const res = await api.put(`/environments/${id}`, { name, variables });
      setEnvironments(prev => prev.map(e => e.id === id ? res.data : e));
    } catch (err) {
      console.error('Failed to update environment:', err);
    }
  };

  const deleteEnvironment = async (id) => {
    try {
      await api.delete(`/environments/${id}`);
      setEnvironments(prev => prev.filter(e => e.id !== id));
      if (activeEnvId === id) setActiveEnvId(null);
    } catch (err) {
      console.error('Failed to delete environment:', err);
    }
  };

  const setActiveEnvironment = async (id) => {
    if (!id) {
      // Deactivate all locally
      setActiveEnvId(null);
      setEnvironments(prev => prev.map(e => ({ ...e, active: false })));
      return;
    }
    try {
      const res = await api.put(`/environments/${id}/activate`);
      setEnvironments(res.data);
      setActiveEnvId(id);
    } catch (err) {
      console.error('Failed to activate environment:', err);
    }
  };

  const activeEnv = environments.find(e => e.id === activeEnvId) || null;

  return (
    <AppContext.Provider value={{
      // Auth
      user, token, isAuthenticated, login, logout, setUser,
      // Collections
      collections, setCollections,
      addCollection, deleteCollection, addRequestToCollection,
      fetchCollections,
      // Environments
      environments, setEnvironments,
      activeEnvId, activeEnv,
      setActiveEnvironment,
      addEnvironment, updateEnvironment, deleteEnvironment,
      fetchEnvironments,
      // Settings
      theme, setTheme,
      interceptor, setInterceptor,
      // Loading
      loading, setLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
