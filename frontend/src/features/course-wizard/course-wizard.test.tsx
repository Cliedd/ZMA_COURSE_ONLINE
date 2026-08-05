import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { mswServer } from '@/test/msw'
import { CourseWizard } from './ui/CourseWizard'

const API = 'http://localhost/api/v1'

function renderWizard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/teacher/courses/new']}>
        <Routes>
          <Route path="/teacher/courses/new" element={<CourseWizard />} />
          <Route path="/teacher/courses/:courseId/edit" element={<div>Course Editor Target Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CourseWizard Component', () => {
  it('affiche la première étape par défaut et bloque le passage si le titre est vide', async () => {
    renderWizard()

    expect(screen.getByText(/étape 1\/2/i)).toBeInTheDocument()

    const btnNext = screen.getByRole('button', { name: /suivant/i })
    await userEvent.click(btnNext)

    expect(await screen.findByText(/le titre est obligatoire/i)).toBeInTheDocument()
    expect(screen.getByText(/étape 1\/2/i)).toBeInTheDocument()
  })

  it('permet de naviguer sur les 2 étapes et de créer le cours avec succès', async () => {
    mswServer.use(
      http.post(`${API}/courses`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            id: 'course-123',
            slug: 'jazz-harmony',
            title: body.title,
            price: body.price,
            status: 'DRAFT',
            published: false,
          },
          { status: 201 },
        )
      }),
    )

    renderWizard()

    // Étape 1 : Remplir informations de base
    await userEvent.type(screen.getByLabelText(/titre/i), 'Jazz Harmony')
    await userEvent.type(screen.getByLabelText(/prix/i), '50')
    await userEvent.click(screen.getByRole('button', { name: /suivant/i }))

    // Étape 2 : Description
    expect(await screen.findByText(/étape 2\/2/i)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/résumé|description courte/i), "Apprenez les bases de l'harmonie jazz.")

    // Soumission
    const btnSubmit = screen.getByRole('button', { name: /créer le cours/i })
    await userEvent.click(btnSubmit)

    // Redirection vers le course editor
    await waitFor(() => {
      expect(screen.getByText('Course Editor Target Page')).toBeInTheDocument()
    })
  })

  it("maintient l'utilisateur sur l'étape 2 si la description courte n'est pas renseignée", async () => {
    renderWizard()

    // Étape 1 : Remplir informations correctement
    await userEvent.type(screen.getByLabelText(/titre/i), 'Cours Test')
    await userEvent.type(screen.getByLabelText(/prix/i), '30')
    await userEvent.click(screen.getByRole('button', { name: /suivant/i }))

    // Étape 2 : Tente de valider sans remplir la description courte
    expect(await screen.findByText(/étape 2\/2/i)).toBeInTheDocument()
    const btnSubmit = screen.getByRole('button', { name: /créer le cours/i })
    await userEvent.click(btnSubmit)

    // L'utilisateur reste à l'étape 2 avec un message d'erreur
    expect(screen.getByText(/étape 2\/2/i)).toBeInTheDocument()
    expect(await screen.findByText(/la description courte est obligatoire/i)).toBeInTheDocument()
  })
})
