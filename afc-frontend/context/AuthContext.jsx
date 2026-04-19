'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('afc_token');
    const storedUser  = localStorage.getItem('afc_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const storeAuth = (userData, tokenValue) => {
    localStorage.setItem('afc_token', tokenValue);
    localStorage.setItem('afc_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const loginUser = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    storeAuth(res.data.user, res.data.token);
    router.push('/dashboard');
    return res;
  }, [router]);

  const signupUser = useCallback(async (name, email, password, rfidUID) => {
    const res = await api.signup(name, email, password, rfidUID);
    storeAuth(res.data.user, res.data.token);
    router.push('/dashboard');
    return res;
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('afc_token');
    localStorage.removeItem('afc_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('afc_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, signupUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
