import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CataloguePage } from './CataloguePage'

const API = 'http://localhost/api/v1'

function coursePage(courses: unknown[]) {
  return { content: courses, totalElements: courses.length, number: 0, totalPages: 1 }
}

describe('CataloguePage', () => {
  it('affiche le titre « Boutique de cours » et les cours chargés', async () => {
    mswServer.use(http.get(`${API}/courses`, () =>
      HttpResponse.json(coursePage([{ id: '1', slug: 'piano', title: 'Piano classique', price: 18, rating: 4.9 }])),
    ))
    renderWithProviders(<CataloguePage />, { route: '/catalogue' })

    expect(screen.getByRole('heading', { name: 'Course shop' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Piano classique' })).toBeInTheDocument()
  })

  it('affiche un état vide avec réinitialisation quand un filtre ne donne rien', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json(coursePage([]))))
    renderWithProviders(<CataloguePage />, { route: '/catalogue?level=Doctorat' })

    expect(await screen.findByText(/No course matches/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset filters/ })).toBeInTheDocument()
  })

  it('affiche un état d\'erreur avec réessai', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json({ message: 'Boom' }, { status: 500 })))
    renderWithProviders(<CataloguePage />, { route: '/catalogue' })

    await waitFor(() => expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument())
  })

  it('débounce la recherche et interroge l\'API avec le paramètre q', async () => {
    const receivedQueries: Array<string | null> = []
    mswServer.use(http.get(`${API}/courses`, ({ request }) => {
      receivedQueries.push(new URL(request.url).searchParams.get('q'))
      return HttpResponse.json(coursePage([{ id: '1', slug: 'piano', title: 'Piano classique', price: 18, rating: 4.9 }]))
    }))
    renderWithProviders(<CataloguePage />, { route: '/catalogue' })

    await screen.findByRole('heading', { name: 'Piano classique' })

    const searchInput = screen.getByRole('searchbox', { name: /Search a course/ })
    await userEvent.type(searchInput, 'piano')

    // Pas de requête supplémentaire tant que le délai de debounce (~300ms) n'est pas écoulé.
    expect(receivedQueries).not.toContain('piano')

    await waitFor(() => expect(receivedQueries).toContain('piano'), { timeout: 2000 })
  })
})
