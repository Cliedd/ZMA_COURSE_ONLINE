import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/entities/session'

/**
 * OAuth2SuccessHandler.java:66 redirige vers /dashboard?token=<jwt>.
 * Ce composant enregistre le jeton puis nettoie l'URL, pour qu'un JWT ne
 * traîne pas dans l'historique du navigateur ni dans un lien partagé.
 */
export function OAuthTokenCapture() {
  const [params, setParams] = useSearchParams()
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) return
    setToken(token)
    const next = new URLSearchParams(params)
    next.delete('token')
    setParams(next, { replace: true })
    navigate('/dashboard', { replace: true })
  }, [params, setParams, setToken, navigate])

  return null
}
