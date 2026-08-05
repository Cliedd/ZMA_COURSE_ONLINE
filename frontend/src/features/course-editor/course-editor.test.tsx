import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, it, expect } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/shared/config/i18n'
import { mswServer } from '@/test/msw'
import { LessonMediaUpload } from './ui/LessonMediaUpload'
import type { CurriculumLesson } from '@/entities/course'

const API = 'http://localhost/api/v1'

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

describe('LessonMediaUpload', () => {
  it('téléverse une vidéo et met à jour mediaId de la leçon en cas de succès', async () => {
    mswServer.use(
      http.post(`${API}/media/presign`, () =>
        HttpResponse.json(
          { mediaId: 'media-1', uploadUrl: '/api/v1/media/media-1/upload-direct', s3Key: 'local/media-1/lesson.mp4', expiresInSeconds: 3600 },
          { status: 201 },
        ),
      ),
      http.post(`${API}/media/media-1/upload-direct`, () =>
        HttpResponse.json({ id: 'media-1', fileName: 'lesson.mp4', size: 1024, contentType: 'video/mp4', status: 'READY' }),
      ),
    )

    let settled: CurriculumLesson | null = null
    render(<Harness onSettled={(lesson) => (settled = lesson)} />)

    const input = screen.getByLabelText(/attach video/i, { selector: 'input' })
    await userEvent.upload(input, makeVideoFile())

    await waitFor(() => expect(settled?.mediaId).toBe('media-1'))
    expect(await screen.findByText(/video attached/i)).toBeInTheDocument()
  })

  it('affiche une erreur et ne modifie pas mediaId quand le serveur rejette le téléversement', async () => {
    mswServer.use(
      http.post(`${API}/media/presign`, () =>
        HttpResponse.json({ message: 'File type not allowed', code: 'BAD_REQUEST' }, { status: 400 }),
      ),
    )

    let settled: CurriculumLesson | null = null
    render(<Harness onSettled={(lesson) => (settled = lesson)} />)

    const input = screen.getByLabelText(/attach video/i, { selector: 'input' })
    await userEvent.upload(input, makeVideoFile())

    expect(await screen.findByRole('alert')).toHaveTextContent(/file type not allowed/i)
    expect(settled).toBeNull()
  })

  it("rejette côté client un fichier dont le format n'est pas une vidéo, sans appeler le serveur", async () => {
    // Aucun handler /media/presign n'est enregistré : mswServer (onUnhandledRequest: 'error')
    // ferait échouer le test si le composant tentait quand même la requête.
    let settled: CurriculumLesson | null = null
    render(<Harness onSettled={(lesson) => (settled = lesson)} />)

    const input = screen.getByLabelText(/attach video/i, { selector: 'input' }) as HTMLInputElement
    const badFile = new File(['x'], 'notes.txt', { type: 'text/plain' })
    // userEvent.upload() applique lui-même le filtre `accept` de l'input (comme un vrai
    // navigateur) : un fichier hors accept n'y déclencherait jamais l'événement change.
    // On simule ici le cas réel où l'utilisateur contourne ce filtre (glisser-déposer,
    // ou sélecteur « tous les fichiers »), pour vérifier notre propre garde-fou côté client.
    fireEvent.change(input, { target: { files: [badFile] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/unsupported file type/i)
    expect(settled).toBeNull()
  })
})
