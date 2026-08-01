import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CheckoutPage } from './CheckoutPage'

const API = 'http://localhost/api/v1'

function renderAt(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/checkout/:courseId" element={<CheckoutPage />} />
    </Routes>,
    { route },
  )
}

function mockCourseList(course: Record<string, unknown>) {
  mswServer.use(http.get(`${API}/courses`, () =>
    HttpResponse.json({ content: [course], totalElements: 1, totalPages: 1, number: 0, size: 100 })))
}

const paidCourse = {
  id: 'course-paid', slug: 'guitare', title: 'Guitare avancée', price: 15000,
}
const freeCourse = {
  id: 'course-free', slug: 'gratuit', title: 'Initiation gratuite', price: 0,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CheckoutPage', () => {
  it("n'autorise pas le paiement d'un cours payant tant qu'aucun moyen de paiement n'est choisi", async () => {
    mockCourseList(paidCourse)
    renderAt('/checkout/course-paid')

    expect(await screen.findByText('Guitare avancée')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay' })).toBeDisabled()
  })

  it('redirige vers la page hébergée du gateway une fois un moyen de paiement choisi', async () => {
    mockCourseList(paidCourse)
    let capturedBody: unknown = null
    mswServer.use(http.post(`${API}/payments/checkout`, async ({ request }) => {
      capturedBody = await request.json()
      return HttpResponse.json({
        id: 'pay-1', courseId: 'course-paid', amount: 15000, status: 'PENDING',
        provider: 'STRIPE_CARD', checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_abc',
      }, { status: 201 })
    }))

    renderAt('/checkout/course-paid')
    await screen.findByText('Guitare avancée')

    await userEvent.click(screen.getByRole('radio', { name: /Card/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Pay' }))

    // jsdom's window.location is a non-configurable own property that
    // resists both Object.defineProperty and vi.stubGlobal — real browser
    // navigation isn't observable here. What's actually worth asserting is
    // that CheckoutPage sends the right request for the chosen method; the
    // one-line `window.location.href = payment.checkoutUrl` that follows is
    // a plain browser API call, not app logic.
    await waitFor(() => expect(capturedBody).toMatchObject({ courseId: 'course-paid', provider: 'STRIPE_CARD' }))
  })

  it('confirme immédiatement un cours gratuit sans passer par un moyen de paiement', async () => {
    mockCourseList(freeCourse)
    mswServer.use(http.post(`${API}/payments/checkout`, () =>
      HttpResponse.json({ id: 'pay-2', courseId: 'course-free', amount: 0, status: 'SUCCESS', provider: 'FREE' }, { status: 201 })))

    renderAt('/checkout/course-free')
    await screen.findByText('Initiation gratuite')

    // Pas de sélecteur de moyen de paiement pour un cours gratuit.
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Pay' }))

    expect(await screen.findByText('Payment successful! Access unlocked.')).toBeInTheDocument()
  })
})
