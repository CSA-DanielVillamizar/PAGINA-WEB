/**
 * Utilidades de autenticación (frontend) — manejo de tokens y eventos.
 * Limpio y reutilizable para evitar acoplar formularios con almacenamiento.
 */

export type Tokens = { accessToken: string | null; refreshToken: string | null };

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function getTokens(): Tokens {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  dispatchTokensEvent();
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  dispatchTokensEvent();
}

function dispatchTokensEvent() {
  if (typeof window === 'undefined') return;
  const detail = getTokens();
  window.dispatchEvent(new CustomEvent('auth:tokens', { detail }));
}

/**
 * Suscripción a cambios de tokens (e.g., para actualizar cabeceras o UI).
 */
export function onTokensChanged(cb: (tokens: Tokens) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const ev = e as CustomEvent<Tokens>;
    cb(ev.detail);
  };
  window.addEventListener('auth:tokens', handler as EventListener);
  return () => window.removeEventListener('auth:tokens', handler as EventListener);
}
