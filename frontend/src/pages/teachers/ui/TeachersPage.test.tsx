import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { TeachersPage } from './TeachersPage'

const API = 'http://localhost/api/v1'

describe('TeachersPage', () => {
  it('dérive et affiche les enseignants depuis le catalogue', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json({
      content: [
        { id: '1', slug: 'a', title: 'Cours A', teacherName: 'Amara Diallo', teacherEmail: 'a@z.cm', rating: 4.8, department: 'Interprétation' },
        { id: '2', slug: 'b', title: 'Cours B', teacherName: 'Amara Diallo', teacherEmail: 'a@z.cm', rating: 5.0, department: 'Composition' },
        { id: '3', slug: 'c', title: 'Cours C', teacherName: 'Kofi Mensah', teacherEmail: 'k@z.cm', department: 'Technologies' },
      ],
      totalElements: 3, number: 0, totalPages: 1,
    })))
    renderWithProviders(<TeachersPage />, { route: '/teachers' })

    expect(await screen.findByRole('link', { name: /Amara Diallo/ })).toHaveAttribute('href', '/teachers/amara-diallo')
    expect(screen.getByRole('link', { name: /Kofi Mensah/ })).toBeInTheDocument()
  })
})
