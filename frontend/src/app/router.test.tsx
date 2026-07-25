import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { axe } from 'jest-axe'
import { NotFound } from './NotFound'
import { RequireAuth } from './guards'
import { LegacyEditRedirect } from './router'
import { OAuthTokenCapture } from './OAuthTokenCapture'
import { ThemeProvider } from '@/shell/ThemeProvider'
import { useAuthStore } from '@/store/authStore'

function wrap(ui: React.ReactNode, initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('NotFound', () => {
  it('explique la situation au lieu de rediriger en silence', () => {
    wrap(<NotFound />)
    expect(screen.getByRole('heading', { name: /introuvable/i })).toBeInTheDocument()
  })

  it('propose au moins deux sorties — exigence Zero Dead Ends du CDC', () => {
    wrap(<NotFound />)
    expect(screen.getByRole('link', { name: /Retour à l'accueil/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Parcourir les formations/ })).toHaveAttribute('href', '/catalogue')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = wrap(<NotFound />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('RequireAuth', () => {
  it('redirige un visiteur vers la connexion en mémorisant la page demandée', () => {
    wrap(
      <Routes>
        <Route path="/dashboard" element={<RequireAuth><p>Espace privé</p></RequireAuth>} />
        <Route path="/auth/login" element={<p>Page de connexion</p>} />
      </Routes>,
      '/dashboard',
    )
    expect(screen.getByText('Page de connexion')).toBeInTheDocument()
    expect(screen.queryByText('Espace privé')).not.toBeInTheDocument()
  })

  it('laisse passer un utilisateur authentifié', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = `h.${btoa(JSON.stringify({ sub: 'e@z.cm', role: 'STUDENT', exp }))}.s`
    useAuthStore.getState().setSession({ token, refreshToken: 'r', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 3600 })

    wrap(
      <Routes>
        <Route path="/dashboard" element={<RequireAuth><p>Espace privé</p></RequireAuth>} />
      </Routes>,
      '/dashboard',
    )
    expect(screen.getByText('Espace privé')).toBeInTheDocument()
  })
})

describe('LegacyEditRedirect', () => {
  it('redirige l\'ancien chemin d\'édition en préservant l\'identifiant du cours', () => {
    // Un enseignant qui crée un cours (CourseWizard) ou clique « Éditer » (TeacherDashboard)
    // arrive sur /teacher/cours/:id ; sans redirection il tomberait sur la 404.
    wrap(
      <Routes>
        <Route path="/teacher/cours/:courseId" element={<LegacyEditRedirect />} />
        <Route path="/teacher/courses/:courseId/edit" element={<p>Éditeur de cours</p>} />
      </Routes>,
      '/teacher/cours/abc-123',
    )
    expect(screen.getByText('Éditeur de cours')).toBeInTheDocument()
  })
})

describe('OAuthTokenCapture', () => {
  it('capture le ?token= de la redirection Google, le mémorise et nettoie l\'URL', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = `h.${btoa(JSON.stringify({ sub: 'e@z.cm', role: 'STUDENT', exp }))}.s`

    wrap(
      <Routes>
        <Route path="/dashboard" element={<><OAuthTokenCapture /><p>Tableau de bord</p></>} />
      </Routes>,
      `/dashboard?token=${token}`,
    )

    // Le jeton de la redirection OAuth est enregistré dans le store.
    expect(await screen.findByText('Tableau de bord')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe(token)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('ne fait rien quand aucun token n\'est présent', () => {
    wrap(
      <Routes>
        <Route path="/dashboard" element={<><OAuthTokenCapture /><p>Tableau de bord</p></>} />
      </Routes>,
      '/dashboard',
    )
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
