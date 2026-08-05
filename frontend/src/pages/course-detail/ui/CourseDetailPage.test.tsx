import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CourseDetailPage } from './CourseDetailPage'

const API = 'http://localhost/api/v1'

function renderAt(slug: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/course/:slug" element={<CourseDetailPage />} />
    </Routes>,
    { route: `/course/${slug}` },
  )
}

describe('CourseDetailPage', () => {
  it('affiche le cours, ses compétences et le bouton d\'achat', async () => {
    mswServer.use(http.get(`${API}/courses/slug/piano`, () => HttpResponse.json({
      id: 'c1', slug: 'piano', title: 'Piano classique & harmonie', price: 18, rating: 4.9,
      teacherName: 'Amara Diallo', level: "Bachelor's",
      skillsJson: '["Lire une partition","Jouer à deux mains"]',
      curriculumJson: '[{"id":"s1","title":"Fondations","lessons":["Posture","Clé de sol"]}]',
    })))
    renderAt('piano')

    expect(await screen.findByRole('heading', { name: /Piano classique/ })).toBeInTheDocument()
    expect(screen.getByText('Lire une partition')).toBeInTheDocument()
    expect(screen.getByText('Fondations')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buy this course' })).toHaveAttribute('href', '/checkout/c1')
  })

  it('affiche un état introuvable en cas d\'erreur', async () => {
    mswServer.use(http.get(`${API}/courses/slug/inconnu`, () => HttpResponse.json({ message: 'x' }, { status: 404 })))
    renderAt('inconnu')
    expect(await screen.findByText(/can't be found/)).toBeInTheDocument()
  })
})
