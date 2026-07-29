import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/entities/session'

/**
 * OAuth2SuccessHandler.java redirige vers /auth/callback?token=&refreshToken=.
 * Route dédiée, PAS enveloppée dans RequireAuth : si on retombait sur
 * /dashboard?token=... directement, RequireAuth évalue isAuthenticated()
 * au tout premier rendu — avant que le token n'ait eu la chance d'être posé
 * — et redirige vers /auth/login avant de rebondir sur /dashboard une fois
 * le state à jour. C'est le détour que l'utilisateur perçoit comme
 * « la redirection n'est pas directe ».
 *
 * Le composant ne rend <Navigate> qu'une fois le token réellement posé dans
 * le store (via un état local `ready`, mis à jour APRÈS setOAuthTokens dans
 * le même effet) — jamais dans le même rendu que la lecture de l'URL, sinon
 * l'effet interne de <Navigate> (enfant, donc exécuté avant l'effet du
 * parent) déclencherait la navigation avant que le token soit posé.
 */
export function OAuthCallbackPage() {
  const [params] = useSearchParams()
  const setOAuthTokens = useAuthStore((s) => s.setOAuthTokens)
  const [ready, setReady] = useState(false)

  const token = params.get('token')
  const refreshToken = params.get('refreshToken')

  useEffect(() => {
    if (token && refreshToken) {
      setOAuthTokens(token, refreshToken)
    }
    setReady(true)
    // setOAuthTokens exclu volontairement : identité stable de Zustand,
    // le réinclure re-déclencherait cet effet sans raison.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshToken])

  if (!ready) return null
  if (!token || !refreshToken) return <Navigate to="/auth/login" replace />
  return <Navigate to="/dashboard" replace />
}
