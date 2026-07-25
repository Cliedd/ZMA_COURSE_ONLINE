import axios from 'axios'
import { configureHttpSession } from '@/shared/api/http'
import { useAuthStore } from './authStore'
import type { AuthResponse } from './authStore'

/**
 * Branche l'entité session au client HTTP partagé (injection de dépendance).
 * FSD : `shared/api/http` ne connaît pas la session ; c'est ici que la session
 * lui fournit son jeton, sa logique de rafraîchissement et sa déconnexion.
 * À appeler une fois au démarrage de l'application.
 */
export function connectSessionToHttp(): void {
  configureHttpSession({
    getToken: () => useAuthStore.getState().token,
    clearSession: () => useAuthStore.getState().logout(),
    refresh: async () => {
      const { refreshToken, setSession } = useAuthStore.getState()
      if (!refreshToken) return false
      try {
        // Appel direct (axios brut) : ne doit pas repasser par l'intercepteur,
        // sinon un 401 sur le rafraîchissement déclencherait une récursion.
        const { data } = await axios.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken })
        setSession(data)
        return true
      } catch {
        return false
      }
    },
  })
}
