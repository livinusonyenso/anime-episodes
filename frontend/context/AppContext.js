'use client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const API = process.env.NEXT_PUBLIC_API_BASE || 'https://kazfieldisl.com/anime-episodes';

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  // Helper request wrapper
  const request = async (method, path, body = {}, auth = false) => {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(method !== 'GET' ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  // AUTH
  const login = async (email, password) => {
    const res = await request('POST', '/api/auth/login', { email, password });
    const { token: tk, user: usr } = res.data;
    setToken(tk);
    setUser(usr);
    localStorage.setItem('token', tk);
    localStorage.setItem('user', JSON.stringify(usr));
  };

  const register = async (name, email, password) => {
    const res = await request('POST', '/api/auth/register', { name, email, password });
    const { token: tk, user: usr } = res.data;
    setToken(tk);
    setUser(usr);
    localStorage.setItem('token', tk);
    localStorage.setItem('user', JSON.stringify(usr));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const requestPasswordReset = async (email) =>
    request('POST', '/api/auth/request-reset', { email });

  const resetPassword = async (email, token, newPassword) =>
    request('POST', '/api/auth/reset-password', { email, token, newPassword });

  // ANIME
  const listAllAnime = async (page = 1, limit = 50) =>
    request('GET', `/api/anime?page=${page}&limit=${limit}`);

  const searchAnime = async (query) =>
    request('GET', `/api/anime?q=${encodeURIComponent(query)}`);

  const getEpisodes = async (animeId) =>
    request('GET', `/api/anime/${animeId}/episodes`, {}, !!token);

  // WATCH TOGGLE
  const setEpisodeWatched = async (episodeId, watched) =>
    request('POST', '/api/episodes/watch', { episodeId, watched }, true);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    listAllAnime,
    searchAnime,
    getEpisodes,
    setEpisodeWatched,
  }), [user, token, loading]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
