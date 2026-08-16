import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { i18n } from '@/shared/config/i18n'
import { mswServer } from '@/test/msw'
import { useAuthStore } from '@/entities/session'
import { NotificationBell } from './NotificationBell'

const API = 'http://localhost/api/v1'

/** Génère un JWT minimal valide (exp dans 1 h) pour satisfaire isAuthenticated(). */
function fakeJwt() {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ email: 'u@test.com', role: 'STUDENT', exp: Math.floor(Date.now() / 1000) + 3600 }))
  return `${header}.${payload}.fake-sig`
}

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  render(
    <QueryClientProvider client={qc}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <NotificationBell />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  )
}

describe('NotificationBell', () => {
  beforeEach(() => {
    // Simulate an authenticated session so queries are enabled
    useAuthStore.setState({ token: fakeJwt(), email: 'u@test.com', role: 'STUDENT' })
  })

  it('affiche le badge avec le nombre de non-lues', async () => {
    mswServer.use(
      http.get(`${API}/notifications`, () =>
        HttpResponse.json([
          { id: '1', userId: 'u1', message: 'Bienvenue !', read: false, createdAt: new Date().toISOString() },
          { id: '2', userId: 'u1', message: 'Cours disponible', read: true, createdAt: new Date().toISOString() },
        ]),
      ),
      http.get(`${API}/notifications/unread-count`, () => HttpResponse.json({ count: 1 })),
    )

    setup()

    const badge = await screen.findByText('1')
    expect(badge).toBeInTheDocument()
  })

  it("ouvre le panneau et liste les notifications au clic sur la cloche", async () => {
    mswServer.use(
      http.get(`${API}/notifications`, () =>
        HttpResponse.json([
          { id: '1', userId: 'u1', message: 'Bienvenue sur ZTF !', read: false, createdAt: new Date().toISOString() },
        ]),
      ),
      http.get(`${API}/notifications/unread-count`, () => HttpResponse.json({ count: 1 })),
    )

    setup()

    const bell = await screen.findByRole('button', { name: /notifications/i })
    await userEvent.click(bell)

    expect(await screen.findByText('Bienvenue sur ZTF !')).toBeInTheDocument()
  })

  it('marque toutes les notifications comme lues', async () => {
    let patchCalled = false
    mswServer.use(
      http.get(`${API}/notifications`, () =>
        HttpResponse.json([
          { id: '1', userId: 'u1', message: 'Message', read: false, createdAt: new Date().toISOString() },
        ]),
      ),
      http.get(`${API}/notifications/unread-count`, () => HttpResponse.json({ count: 1 })),
      http.patch(`${API}/notifications/read-all`, () => {
        patchCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    setup()

    const bell = await screen.findByRole('button', { name: /notifications/i })
    await userEvent.click(bell)

    const markAll = await screen.findByRole('button', { name: /tout marquer|mark all/i })
    await userEvent.click(markAll)

    await waitFor(() => expect(patchCalled).toBe(true))
  })

  it("affiche l'état vide quand il n'y a aucune notification", async () => {
    mswServer.use(
      http.get(`${API}/notifications`, () => HttpResponse.json([])),
      http.get(`${API}/notifications/unread-count`, () => HttpResponse.json({ count: 0 })),
    )

    setup()

    const bell = await screen.findByRole('button', { name: /notifications/i })
    await userEvent.click(bell)

    expect(await screen.findByText(/aucune notification|no notifications/i)).toBeInTheDocument()
  })
})
