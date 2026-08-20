import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { useAuthStore } from '@/entities/session'
import { CourseDetailPage } from './CourseDetailPage'

const API = 'http://localhost/api/v1'

const COURSE_FIXTURE = {
  id: 'c1', slug: 'piano', title: 'Piano classique & harmonie', price: 18, rating: 4.9,
  teacherName: 'Amara Diallo', level: "Bachelor's",
  skillsJson: '["Lire une partition","Jouer à deux mains"]',
  curriculumJson: '[{"id":"s1","title":"Fondations","lessons":["Posture","Clé de sol"]}]',
}

function renderAt(slug: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/course/:slug" element={<CourseDetailPage />} />
    </Routes>,
    { route: `/course/${slug}` },
  )
}

describe('CourseDetailPage', () => {
  beforeEach(() => {
    // Reset auth state so each test starts unauthenticated by default
    useAuthStore.setState({ token: null, refreshToken: null, email: null, role: null })
  })

  it('affiche le cours, ses compétences et le bouton d\'achat (utilisateur non connecté)', async () => {
    mswServer.use(http.get(`${API}/courses/slug/piano`, () => HttpResponse.json(COURSE_FIXTURE)))
    renderAt('piano')

    expect(await screen.findByRole('heading', { name: /Piano classique/ })).toBeInTheDocument()
    expect(screen.getByText('Lire une partition')).toBeInTheDocument()
    expect(screen.getByText('Fondations')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buy this course' })).toHaveAttribute('href', '/checkout/c1')
  })

  it('affiche "Continuer l\'apprentissage" quand l\'étudiant est déjà inscrit', async () => {
    // Simulate a logged-in student with a valid (future-expiring) token
    const fakePayload = btoa(JSON.stringify({ sub: 'test@example.com', role: 'STUDENT', exp: Math.floor(Date.now() / 1000) + 3600 }))
    useAuthStore.setState({ token: `header.${fakePayload}.sig`, refreshToken: null, email: 'test@example.com', role: 'STUDENT' })

    mswServer.use(
      http.get(`${API}/courses/slug/piano`, () => HttpResponse.json(COURSE_FIXTURE)),
      http.get(`${API}/enrollments/check`, () => HttpResponse.json({ enrolled: true, enrollmentId: 'e1' })),
    )
    renderAt('piano')

    expect(await screen.findByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '/learning/c1')
    expect(screen.queryByRole('link', { name: 'Buy this course' })).not.toBeInTheDocument()
  })

  it('affiche le bouton d\'achat quand l\'étudiant n\'est pas inscrit', async () => {
    const fakePayload = btoa(JSON.stringify({ sub: 'test@example.com', role: 'STUDENT', exp: Math.floor(Date.now() / 1000) + 3600 }))
    useAuthStore.setState({ token: `header.${fakePayload}.sig`, refreshToken: null, email: 'test@example.com', role: 'STUDENT' })

    mswServer.use(
      http.get(`${API}/courses/slug/piano`, () => HttpResponse.json(COURSE_FIXTURE)),
      http.get(`${API}/enrollments/check`, () => HttpResponse.json({ enrolled: false, enrollmentId: null })),
    )
    renderAt('piano')

    expect(await screen.findByRole('link', { name: 'Buy this course' })).toHaveAttribute('href', '/checkout/c1')
    expect(screen.queryByRole('link', { name: 'Continue learning' })).not.toBeInTheDocument()
  })

  it('affiche un état introuvable en cas d\'erreur', async () => {
    mswServer.use(http.get(`${API}/courses/slug/inconnu`, () => HttpResponse.json({ message: 'x' }, { status: 404 })))
    renderAt('inconnu')
    expect(await screen.findByText(/can't be found/)).toBeInTheDocument()
  })
})
