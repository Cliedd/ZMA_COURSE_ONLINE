import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

export function RequireAuth({ children }: { children: ReactNode }) {
  const authenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!authenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />
  }
  return <>{children}</>
}

export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const authenticated = useAuthStore((s) => s.isAuthenticated())
  const current = useAuthStore((s) => s.role)
  const location = useLocation()

  if (!authenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />
  }
  if (current !== role) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
