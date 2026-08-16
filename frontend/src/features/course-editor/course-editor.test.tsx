import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/shared/config/i18n'
import { LessonMediaUpload } from './ui/LessonMediaUpload'
import { CurriculumEditor } from './ui/CurriculumEditor'
import type { CurriculumLesson, CurriculumSection } from '@/entities/course'

// Mock uploadLessonVideo to avoid FormData+XHR hanging under Node 24's jsdom.
// MSW's XHR interceptor does not respond to FormData POST requests in Node 24,
// so the upload spinner blocks indefinitely.  We test component behaviour here
// (onChange called with correct mediaId, error states); the HTTP implementation
// is covered by shared/api/http.test.ts.
vi.mock('./api/mediaApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/mediaApi')>()
  return { ...actual, uploadLessonVideo: vi.fn() }
})

// This import is resolved AFTER the hoisted vi.mock above, so it receives the
// mocked module where uploadLessonVideo is a vi.fn() stub.
import { uploadLessonVideo, UploadError } from './api/mediaApi'

/** Harnais avec état local : reproduit l'usage réel (contrôlé par CurriculumEditor),
 * où la mise à jour de `mediaId` déclenche un nouveau rendu avec la leçon à jour. */
function Harness({ onSettled }: { onSettled?: (lesson: CurriculumLesson) => void }) {
  const [lesson, setLesson] = useState<CurriculumLesson>({ title: 'Introduction' })
  return (
    <I18nextProvider i18n={i18n}>
      <LessonMediaUpload
        lesson={lesson}
        onChange={(next) => {
          setLesson(next)
          onSettled?.(next)
        }}
      />
    </I18nextProvider>
  )
}

function makeVideoFile(name = 'lesson.mp4', type = 'video/mp4', sizeBytes = 1024) {
  return new File([new Uint8Array(sizeBytes)], name, { type })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('LessonMediaUpload', () => {
  it('téléverse une vidéo et met à jour mediaId de la leçon en cas de succès', async () => {
    vi.mocked(uploadLessonVideo).mockResolvedValueOnce({
      id: 'media-1',
      fileName: 'lesson.mp4',
      size: 1024,
      contentType: 'video/mp4',
      status: 'READY',
    })

    let settled: CurriculumLesson | null = null
    render(<Harness onSettled={(lesson) => (settled = lesson)} />)

    const input = screen.getByLabelText(/attacher|attach/i, { selector: 'input' })
    await userEvent.upload(input, makeVideoFile())

    await waitFor(() => expect(settled?.mediaId).toBe('media-1'))
    expect(await screen.findByText(/vidéo attachée|video attached/i)).toBeInTheDocument()
  })

  it('affiche une erreur et ne modifie pas mediaId quand le serveur rejette le téléversement', async () => {
    vi.mocked(uploadLessonVideo).mockRejectedValueOnce(
      new UploadError('client', 'File type not allowed'),
    )

    let settled: CurriculumLesson | null = null
    render(<Harness onSettled={(lesson) => (settled = lesson)} />)

    const input = screen.getByLabelText(/attacher|attach/i, { selector: 'input' })
    await userEvent.upload(input, makeVideoFile())

    // The raw server message ("File type not allowed") must never reach the UI as-is:
    // it isn't localized (shared/api/http's own fallbacks are hardcoded French), so
    // LessonMediaUpload always renders the translated generic upload-error copy instead.
    expect(await screen.findByRole('alert')).toHaveTextContent(/upload failed|échec de l'envoi/i)
    expect(settled).toBeNull()
  })

  it("rejette côté client un fichier dont le format n'est pas une vidéo, sans appeler le serveur", async () => {
    let settled: CurriculumLesson | null = null
    render(<Harness onSettled={(lesson) => (settled = lesson)} />)

    const input = screen.getByLabelText(/attacher|attach/i, { selector: 'input' }) as HTMLInputElement
    const badFile = new File(['x'], 'notes.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [badFile] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/unsupported|non pris en charge/i)
    expect(settled).toBeNull()
    expect(uploadLessonVideo).not.toHaveBeenCalled()
  })
})

describe('CurriculumEditor', () => {
  it('met à jour la section et inclut mediaId dans le programme quand une vidéo est téléversée', async () => {
    vi.mocked(uploadLessonVideo).mockResolvedValueOnce({
      id: 'media-42',
      fileName: 'lesson.mp4',
      size: 1024,
      contentType: 'video/mp4',
      status: 'READY',
    })

    let lastSections: CurriculumSection[] = []
    render(
      <I18nextProvider i18n={i18n}>
        <CurriculumEditor
          sections={[{ id: 's1', title: 'Section 1', lessons: [{ title: 'Leçon 1' }] }]}
          onChange={(next) => {
            lastSections = next
          }}
        />
      </I18nextProvider>,
    )

    const input = screen.getByLabelText(/attacher|attach/i, { selector: 'input' })
    await userEvent.upload(input, makeVideoFile())

    await waitFor(() => {
      expect(lastSections[0]?.lessons[0]?.mediaId).toBe('media-42')
    })
  })
})
