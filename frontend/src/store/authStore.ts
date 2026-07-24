import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../types';

interface AuthState {
  token: string | null;
  email: string | null;
  role: UserRole | null;

  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

function decodeToken(token: string): { email: string; role: UserRole } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    return { email: payload.sub, role: payload.role ?? 'STUDENT' };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      role: null,

      setToken: (token: string) => {
        const decoded = decodeToken(token);
        set({
          token,
          email: decoded?.email ?? null,
          role: decoded?.role ?? 'STUDENT',
        });
      },

      logout: () => {
        set({ token: null, email: null, role: null });
      },

      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        try {
          const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'zma-auth',
      partialize: (state) => ({ token: state.token, email: state.email, role: state.role }),
    }
  )
);
