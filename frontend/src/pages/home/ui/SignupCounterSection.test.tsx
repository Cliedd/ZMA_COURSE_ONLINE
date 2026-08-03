import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { SignupCounterSection } from './SignupCounterSection'

const API = 'http://localhost/api/v1'

describe('SignupCounterSection', () => {
  it('affiche le nombre réel d\'inscrits renvoyé par l\'API', async () => {
    mswServer.use(http.get(`${API}/auth/users/count`, () => HttpResponse.json({ count: 342 })))

    renderWithProviders(<SignupCounterSection />)

    await waitFor(() => expect(screen.getByText('342')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('affiche un squelette de chargement plutôt que 0 pendant la requête', async () => {
    mswServer.use(http.get(`${API}/auth/users/count`, async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      return HttpResponse.json({ count: 10 })
    }))

    renderWithProviders(<SignupCounterSection />)

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('0')).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument(), { timeout: 3000 })
  })

  it('affiche un message d\'erreur si la requête échoue', async () => {
    mswServer.use(http.get(`${API}/auth/users/count`, () => HttpResponse.error()))

    renderWithProviders(<SignupCounterSection />)

    await waitFor(() => expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument())
  })
})
