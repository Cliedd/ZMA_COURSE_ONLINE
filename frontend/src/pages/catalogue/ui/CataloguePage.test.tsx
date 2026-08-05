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
    renderWithProviders(<CataloguePage />, { route: '/catalogue?level=Doctorate' })

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

  it('combine département, niveau et recherche sans qu\'aucun filtre ne soit écrasé', async () => {
    // Timeout étendu : userEvent.type + 2 clics + le debounce de 300ms peuvent dépasser
    // les 5s par défaut quand la suite tourne en parallèle sous charge.
    // Régression : setFilter fermait auparavant sur `params` capturé au rendu, si bien que
    // l'effet debouncé de la recherche pouvait s'exécuter avec un instantané de l'URL antérieur
    // à un clic sur une puce département/niveau et effacer ce filtre en repartant de zéro.
    const receivedSearches: string[] = []
    mswServer.use(http.get(`${API}/courses`, ({ request }) => {
      receivedSearches.push(new URL(request.url).search)
      return HttpResponse.json(coursePage([]))
    }))
    renderWithProviders(<CataloguePage />, { route: '/catalogue' })

    await screen.findByText(/No course matches/)

    await userEvent.click(screen.getByRole('button', { name: 'Performance' }))
    await userEvent.click(screen.getByRole('button', { name: "Bachelor's" }))

    const searchInput = screen.getByRole('searchbox', { name: /Search a course/ })
    await userEvent.type(searchInput, 'piano')

    await waitFor(() => {
      const last = receivedSearches[receivedSearches.length - 1] ?? ''
      expect(last).toContain('department=')
      expect(last).toContain('level=Bachelor%27s')
      expect(last).toContain('q=piano')
    }, { timeout: 4000 })
  }, 10000)

  it('clique sur la page 2 de la pagination et y reste (ne revient pas silencieusement à la page 1)', async () => {
    // Régression : `setFilter` (mémoïsé sur `setParams` de react-router-dom, lui-même
    // instable — son identité change à chaque navigation) changeait d'identité à
    // chaque clic de pagination, ce qui re-déclenchait l'effet de synchro de la
    // recherche débouncée dans CataloguePage. Cet effet rappelait `setFilter('q', …)`,
    // qui supprime toujours `page` de l'URL — annulant le clic sur « page 2 » et
    // ramenant silencieusement l'utilisateur à la page 1 (perçu comme un « glitch »/
    // rafraîchissement). `setFilter`/`setPage` sont désormais des callbacks stables
    // (deps vides), donc ce recul ne doit plus se produire.
    const receivedPages: Array<string | null> = []
    mswServer.use(http.get(`${API}/courses`, ({ request }) => {
      receivedPages.push(new URL(request.url).searchParams.get('page'))
      return HttpResponse.json({
        content: [{ id: '1', slug: 'piano', title: 'Piano classique', price: 18, rating: 4.9 }],
        totalElements: 24,
        number: 0,
        totalPages: 3,
      })
    }))
    renderWithProviders(<CataloguePage />, { route: '/catalogue' })

    await screen.findByRole('heading', { name: 'Piano classique' })

    const pageTwoButton = await screen.findByRole('button', { name: '2' })
    await userEvent.click(pageTwoButton)

    // La requête pour la page 2 (index 0-based `page=1`) doit partir…
    await waitFor(() => expect(receivedPages).toContain('1'))

    // …et rester la dernière requête connue : pas de retour en douce à `page` absent
    // (page 1) après le clic, même en laissant le temps à un éventuel effet parasite
    // de se déclencher.
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(receivedPages[receivedPages.length - 1]).toBe('1')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })
})
