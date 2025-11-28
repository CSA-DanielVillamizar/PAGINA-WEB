import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => {
        // Limpiar tokens y usuario del estado
        set({ accessToken: null, refreshToken: null, user: null });
        // Eliminar cookies de autenticación
        document.cookie = 'auth_token=; Max-Age=0; path=/;';
        document.cookie = 'refresh_token=; Max-Age=0; path=/;';
      },
    }),
    { name: 'lama-auth' }
  )
);
