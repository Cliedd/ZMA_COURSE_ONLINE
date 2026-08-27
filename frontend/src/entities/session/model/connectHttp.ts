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

// Mutex : garantit qu'un seul appel refresh est en vol à la fois.
// Sans ça, quand le token expire et que plusieurs requêtes simultanées
// reçoivent un 401, chacune tente un refresh avec le MÊME refreshToken.
// Si le backend utilise la rotation de token (le refresh token est à usage
// unique), seul le premier réussit — les suivants invalident le nouveau token
// et déclenchent un clearSession() intempestif qui déconnecte l'utilisateur.
let refreshPromise: Promise<boolean> | null = null

export function connectSessionToHttp(): void {
  configureHttpSession({
    getToken: () => useAuthStore.getState().token,
    clearSession: () => useAuthStore.getState().logout(),
    refresh: async () => {
      // Si un refresh est déjà en cours, on attend sa résolution plutôt que
      // d'en lancer un second concurrent.
      if (refreshPromise) return refreshPromise

      refreshPromise = (async () => {
        const { refreshToken, role: previousRole, setSession } = useAuthStore.getState()
        if (!refreshToken) return false
        try {
          // Appel direct (axios brut) : ne doit pas repasser par l'intercepteur,
          // sinon un 401 sur le rafraîchissement déclencherait une récursion.
          const { data } = await axios.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken })
          setSession(data)

          // Si l'admin a changé le rôle de cet utilisateur, le nouveau JWT porte
          // un rôle différent. On force un rechargement complet pour que toute
          // l'interface (menus, guards, contextes) reflète le nouveau rôle sans
          // qu'il reste de state périmé en mémoire.
          if (previousRole !== null && data.role !== previousRole) {
            window.location.reload()
          }

          return true
        } catch {
          return false
        }
      })()

      try {
        return await refreshPromise
      } finally {
        refreshPromise = null
      }
    },
  })
}
