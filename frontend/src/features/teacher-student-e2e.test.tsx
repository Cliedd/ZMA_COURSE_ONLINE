import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/shared/config/i18n'
import { mswServer } from '@/test/msw'
import { CourseWizardPage } from '@/pages/teacher-course-new'
import { CourseEditorPage } from '@/pages/teacher-course-edit'
import { CoursePlayer } from '@/pages/learning'
import { useAuthStore } from '@/entities/session'

// Mock uploadLessonVideo to avoid FormData+XHR hanging under Node 24's jsdom.
// MSW's XHR interceptor does not respond to FormData POST bodies in that environment,
// so the upload spinner blocks indefinitely.  We verify the integration at the
// component-state level (mediaId set, badge visible) while bypassing the unreliable
// HTTP layer for multipart uploads.
vi.mock('@/features/course-editor/api/mediaApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/course-editor/api/mediaApi')>()
  return { ...actual, uploadLessonVideo: vi.fn() }
})

import { uploadLessonVideo } from '@/features/course-editor/api/mediaApi'

const API = 'http://localhost/api/v1'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function renderWithProviders(ui: React.ReactNode, initialRoute = '/') {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[initialRoute]}>
          {ui}
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  )
}

describe('Teacher Course Publish & Student Learning E2E Flow', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Timeout étendu : ce scénario tape plusieurs champs caractère par caractère via
  // userEvent, ce qui peut dépasser les 5000ms par défaut sous charge CPU (CI).
  it('1. Assistant de création de cours (Course Wizard Flow) fonctionne de bout en bout', async () => {
    mswServer.use(
      http.post(`${API}/courses`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.title).toBe('Solfège et Harmonie')
        expect(body.price).toBe(50)
        return HttpResponse.json(
          {
            id: 'course-101',
            slug: 'solfege-et-harmonie',
            title: 'Solfège et Harmonie',
            shortDescription: 'Apprenez les bases du solfège',
            description: 'Description détaillée',
            price: 49.99,
            published: false,
            curriculumJson: '[]',
          },
          { status: 201 },
        )
      }),
    )

    renderWithProviders(
      <Routes>
        <Route path="/teacher/courses/new" element={<CourseWizardPage />} />
        <Route path="/teacher/courses/:courseId/edit" element={<div>Éditeur du cours créé</div>} />
      </Routes>,
      '/teacher/courses/new',
    )

    // Étape 1 : Formulaire de base
    const titleInput = screen.getByLabelText(/titre/i)
    await userEvent.type(titleInput, 'Solfège et Harmonie')

    const priceInput = screen.getByLabelText(/prix/i)
    await userEvent.type(priceInput, '50')

    // Clic sur Suivant
    const nextBtn = screen.getByRole('button', { name: /suivant/i })
    await userEvent.click(nextBtn)

    // Étape 2 : Description
    await screen.findByText(/étape 2\/2/i)
    const shortDesc = screen.getByLabelText(/résumé|description courte/i)
    await userEvent.type(shortDesc, 'Apprenez les bases du solfège')

    const fullDesc = screen.getByLabelText(/description détaillée|description complète/i)
    await userEvent.type(fullDesc, 'Description détaillée')

    // Soumission du formulaire
    const submitBtn = screen.getByRole('button', { name: /créer le cours/i })
    await userEvent.click(submitBtn)

    // Vérification de la redirection vers l'éditeur de cours
    expect(await screen.findByText('Éditeur du cours créé')).toBeInTheDocument()
  }, 15000)

  it('2 & 3. Édition du programme (sections/leçons/vidéo) et Publication du cours', async () => {
    vi.mocked(uploadLessonVideo).mockResolvedValueOnce({
      id: 'v-999',
      fileName: 'intro.mp4',
      size: 2048,
      contentType: 'video/mp4',
      status: 'READY',
    })

    let mockCourse = {
      id: 'course-101',
      slug: 'solfege-et-harmonie',
      title: 'Solfège et Harmonie',
      shortDescription: 'Apprenez les bases',
      price: 49.99,
      published: false,
      curriculumJson: JSON.stringify([
        {
          id: 'sec-1',
          title: 'Introduction',
          lessons: [{ title: 'Bienvenue', mediaId: null }],
        },
      ]),
    }

    mswServer.use(
      http.get(`${API}/courses/course-101`, () => HttpResponse.json(mockCourse)),
      http.put(`${API}/courses/course-101`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        mockCourse = { ...mockCourse, ...body }
        return HttpResponse.json(mockCourse)
      }),
      http.patch(`${API}/courses/course-101/publish`, ({ request }) => {
        // The real endpoint takes `published` as a query param, not a JSON body
        // (see CourseController#publishCourse / courseApi.publish).
        const published = new URL(request.url).searchParams.get('published') !== 'false'
        mockCourse.published = published
        return HttpResponse.json(mockCourse)
      }),
    )

    renderWithProviders(
      <Routes>
        <Route path="/teacher/courses/:courseId/edit" element={<CourseEditorPage />} />
      </Routes>,
      '/teacher/courses/course-101/edit',
    )

    // Attente du chargement des infos du cours
    expect(await screen.findByDisplayValue('Solfège et Harmonie')).toBeInTheDocument()

    // Vérification du statut initial (Brouillon)
    expect(screen.getByText('Brouillon')).toBeInTheDocument()

    // Téléversement d'une vidéo sur la première leçon
    const attachBtnInput = screen.getByLabelText(/attacher|attach/i, { selector: 'input' })
    const videoFile = new File(['test video bytes'], 'intro.mp4', { type: 'video/mp4' })
    await userEvent.upload(attachBtnInput, videoFile)

    // Confirmation que la vidéo est attachée
    expect(await screen.findByText(/vidéo attachée|video attached/i)).toBeInTheDocument()

    // Publication du cours via PublishControl
    const publishBtn = screen.getByRole('button', { name: /publier/i })
    await userEvent.click(publishBtn)

    // Vérification de la mise à jour du statut en Publié
    await waitFor(() => {
      expect(screen.getByText('Publié')).toBeInTheDocument()
    })
    expect(mockCourse.published).toBe(true)
  }, 20000)

  it('4. Lecteur de cours étudiant (CoursePlayer) : affichage du syllabus, streaming vidéo et mise à jour du progrès', async () => {
    const publishedCourse = {
      id: 'course-101',
      slug: 'solfege-et-harmonie',
      title: 'Solfège et Harmonie',
      published: true,
      lessonCount: 2,
      curriculumJson: JSON.stringify([
        {
          id: 'sec-1',
          title: 'Section 1 : Les Gammes',
          lessons: [
            { title: 'Leçon 1 : La gamme majeure', mediaId: 'video-123' },
            { title: 'Leçon 2 : La gamme mineure', mediaId: null },
          ],
        },
      ]),
    }

    let currentProgress = 0

    mswServer.use(
      http.get(`${API}/courses/course-101`, () => HttpResponse.json(publishedCourse)),
      http.get(`${API}/enrollments/me`, () =>
        HttpResponse.json([
          {
            id: 'enr-1',
            courseId: 'course-101',
            courseTitle: 'Solfège et Harmonie',
            progress: currentProgress,
            status: 'ACTIVE',
          },
        ]),
      ),
      http.get(`${API}/media/video-123/url`, () =>
        HttpResponse.json({ url: '/api/v1/media/video-123/file' }),
      ),
      http.patch(`${API}/enrollments/enr-1/progress`, async ({ request }) => {
        // The real endpoint takes the progress value as a raw JSON number body
        // (see EnrollmentController#updateProgress / enrollmentApi.updateProgress),
        // not an { progress } object.
        const body = (await request.json()) as number
        currentProgress = body
        return HttpResponse.json({
          id: 'enr-1',
          courseId: 'course-101',
          progress: currentProgress,
          status: currentProgress >= 100 ? 'COMPLETED' : 'ACTIVE',
        })
      }),
    )

    renderWithProviders(
      <Routes>
        <Route path="/learning/:courseId" element={<CoursePlayer />} />
      </Routes>,
      '/learning/course-101',
    )

    // Attente du rendu du lecteur de cours
    expect(await screen.findByText('Section 1 : Les Gammes')).toBeInTheDocument()
    expect(screen.getAllByText('Leçon 1 : La gamme majeure')[0]).toBeInTheDocument()

    // Vérification de la présence de la balise vidéo streaming avec le bon mediaId
    const videoElement = (await screen.findByLabelText(/la gamme majeure|lecteur vidéo/i)) as HTMLVideoElement
    expect(videoElement).toBeInTheDocument()
    expect(videoElement.querySelector('source')).toHaveAttribute('src', expect.stringContaining('video-123'))

    // Marquer la leçon comme terminée
    const completeBtn = screen.getByRole('button', { name: /marquer comme terminé|complete/i })
    await userEvent.click(completeBtn)

    // Vérification de l'appel à l'API de mise à jour du progrès
    await waitFor(() => {
      expect(currentProgress).toBeGreaterThan(0)
    })
  })
})
