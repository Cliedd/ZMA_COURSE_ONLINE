import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CoursePlayer } from './CoursePlayer'

function renderPlayer(courseId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/learning/:courseId" element={<CoursePlayer />} />
    </Routes>,
    { route: `/learning/${courseId}` },
  )
}

describe('CoursePlayer', () => {
  it('affiche un message quand la leçon active n\'a pas de vidéo attachée', async () => {
    mswServer.use(
      http.get('*/api/v1/courses/c1', () =>
        HttpResponse.json({
          id: 'c1',
          slug: 'piano-101',
          title: 'Piano Débutant',
          curriculumJson: JSON.stringify([
            {
              id: 's1',
              title: 'Module 1',
              lessons: [{ title: 'Introduction sans vidéo' }],
            },
          ]),
        }),
      ),
      http.get('*/api/v1/enrollments/me', () => HttpResponse.json([])),
    )

    renderPlayer('c1')

    expect(await screen.findByText(/vidéo indisponible|no video|aucune vidéo|noVideoAttached/i)).toBeInTheDocument()
  })

  it('affiche le lecteur vidéo avec src et contrôles quand mediaId est présent', async () => {
    mswServer.use(
      http.get('*/api/v1/courses/c2', () =>
        HttpResponse.json({
          id: 'c2',
          slug: 'guitare-101',
          title: 'Guitare Débutant',
          curriculumJson: JSON.stringify([
            {
              id: 's1',
              title: 'Module 1',
              lessons: [{ title: 'Premiers accords', mediaId: 'media-88' }],
            },
          ]),
        }),
      ),
      http.get('*/api/v1/enrollments/me', () => HttpResponse.json([])),
      http.get('*/api/v1/media/media-88/url', () => HttpResponse.json({ url: '/api/v1/media/media-88/file' })),
    )

    renderPlayer('c2')

    const video = (await screen.findByTestId('lesson-video-player')) as HTMLVideoElement
    expect(video).toBeInTheDocument()
    const source = video.querySelector('source')
    expect(source?.getAttribute('src')).toMatch(/media-88/)
    expect(video).toHaveAttribute('controls')
  })
})
