import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types'

/** Forme renvoyée par POST /auth/login et POST /auth/refresh (AuthResponse.java). */
export interface AuthResponse {
  token: string
  refreshToken: string
  email: string
  role: UserRole
  id: string
  expiresIn: number
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  email: string | null
  role: UserRole | null

  /** Enregistre une session complète — à privilégier sur setToken. */
  setSession: (response: AuthResponse) => void
  /** Enregistre un JWT seul. Utilisé par la redirection OAuth2, qui ne fournit que ?token=. */
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

function decodeToken(token: string): { email: string; role: UserRole } | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const payload = JSON.parse(atob(segment)) as { sub?: string; role?: UserRole }
    return { email: payload.sub ?? '', role: payload.role ?? 'STUDENT' }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      email: null,
      role: null,

      setSession: ({ token, refreshToken, email, role }) =>
        set({ token, refreshToken, email, role }),

      setToken: (token: string) => {
        const decoded = decodeToken(token)
        set({ token, email: decoded?.email ?? null, role: decoded?.role ?? 'STUDENT' })
      },

      logout: () => set({ token: null, refreshToken: null, email: null, role: null }),

      isAuthenticated: () => {
        const { token } = get()
        if (!token) return false
        try {
          const segment = token.split('.')[1]
          if (!segment) return false
          const payload = JSON.parse(atob(segment)) as { exp?: number }
          return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
        } catch {
          return false
        }
      },
    }),
    {
      name: 'zma-auth',
      // refreshToken volontairement exclu : le garder hors localStorage limite
      // la casse d'un XSS à l'access token (courte durée de vie), pas à une
      // prise de session durable. Conséquence acceptée : un rechargement de
      // page après expiration de l'access token déconnecte l'utilisateur.
      partialize: (s) => ({ token: s.token, email: s.email, role: s.role }),
    },
  ),
)
