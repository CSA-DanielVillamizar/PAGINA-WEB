"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { getTokens, setTokens, clearTokens } from '../../lib/auth';
import { API_BASE } from '../../lib/config';

interface AuthContextType {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL importada desde lib/config

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Cargar tokens almacenados
    const { accessToken: storedAccess, refreshToken: storedRefresh } = getTokens();
    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
  }, []);

  useEffect(() => {
    // Sincronizar cabecera Authorization y recuperar usuario si hace falta
    if (accessToken) {
      (api.defaults.headers as any).Authorization = `Bearer ${accessToken}`;
      if (!user) {
        api.get(`${API_BASE}/auth/me`).then((res: any) => setUser(res.data)).catch(() => {});
      }
    } else {
      delete (api.defaults.headers as any).Authorization;
    }
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    const res = await api.post(`${API_BASE}/auth/login`, { email, password });
    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    setUser(res.data.user);
    setTokens(res.data.accessToken, res.data.refreshToken);
  };

  const refresh = async () => {
    if (!refreshToken) return;
    const res = await api.post(`${API_BASE}/auth/refresh`, { refreshToken });
    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    setTokens(res.data.accessToken, res.data.refreshToken);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    clearTokens();
    queryClient.clear();
  };

  const value: AuthContextType = { user, accessToken, refreshToken, login, logout, refresh };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
