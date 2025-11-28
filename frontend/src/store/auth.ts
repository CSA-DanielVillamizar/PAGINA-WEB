import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  nombreCompleto: string
  correo: string
  rol?: string
  roles: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        localStorage.setItem('auth_token', token)
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      hasRole: (role) => {
        const { user } = get()
        return user?.roles.includes(role) ?? false
      },
      
      hasAnyRole: (roles) => {
        const { user } = get()
        return roles.some(role => user?.roles.includes(role)) ?? false
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
