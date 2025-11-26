"use client";
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE } from './config';
import { clearTokens, getTokens, setTokens } from './auth';

/**
 * Cliente Axios centralizado con:
 * - baseURL
 * - cabecera Authorization dinámica
 * - auto-refresh en 401 (una sola vez) y reintento
 *
 * Nota: Se basa en localStorage para tokens; adecuado para cliente.
 */
export const api = axios.create({ baseURL: API_BASE });

// Inserta Authorization si hay accessToken
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Control de reintentos para evitar bucles
const RETRY_FLAG = 'x-retried';

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original: any = (error as any)?.config || {};
    if (status === 401 && !original[RETRY_FLAG]) {
      original[RETRY_FLAG] = true;
      try {
        const { refreshToken } = getTokens();
        if (!refreshToken) throw new Error('No refresh token');
        const refreshRes = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = refreshRes.data || {};
        if (!newAccess || !newRefresh) throw new Error('Refresh inválido');
        setTokens(newAccess, newRefresh);
        // Re-emitir request con nueva cabecera
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api.request(original);
      } catch (e) {
        clearTokens();
        if (typeof window !== 'undefined') {
          // Redirigir a login y preservar destino
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth/login?next=${next}`;
        }
      }
    }
    return Promise.reject(error);
  }
);
