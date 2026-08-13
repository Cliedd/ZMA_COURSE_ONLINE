/* eslint-disable max-lines */
import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Play, Check, Lock, VideoOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Skeleton, ProgressBar } from '@/shared/ui'
import { get } from '@/shared/api/http'
import { cn } from '@/shared/lib/cn'
import { useCourseById, courseCurriculum, curriculumLessonCount, lessonTitle } from '@/entities/course'
import { useMyEnrollments, useUpdateProgress } from '@/entities/enrollment'
import { useQuizByLesson } from '@/hooks/useQuiz'

interface VideoPlayerProps {
  mediaId?: string | null
  title?: string
}

export function VideoPlayer({ mediaId, title }: VideoPlayerProps) {
  const { t } = useTranslation()
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const resolveMediaUrl = useCallback(async (id: string, signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    setStreamUrl(null)

    try {
      const res = await get<{ url: string }>(`/media/${id}/url`, { signal })
      if (res?.url) {
        setStreamUrl(res.url)
        setIsLoading(false)
        return
      }
    } catch {
      // presigned URL unavailable — no unauthenticated fallback in production
    }

    if (signal?.aborted) return

    // Last-resort fallback: the /file endpoint works in local dev (storage.type=local)
    // but returns 404 in production (R2). We attempt it so local dev keeps working;
    // if the video element fires onError we surface a user-facing message.
    setStreamUrl(`/api/v1/media/${id}/file`)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!mediaId) {
      setStreamUrl(null)
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    void resolveMediaUrl(mediaId, controller.signal)

    return () => {
      controller.abort()
    }
  }, [mediaId, resolveMediaUrl])

  if (!mediaId) {
    return (
      <div className="grid aspect-video place-items-center bg-scene-surface p-6 text-center">
        <div>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
            <VideoOff className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-3 font-sans text-sm font-medium text-scene-ink/70">
            {t('player.noVideoAttached')}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid aspect-video place-items-center bg-scene-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
          <p className="font-sans text-xs text-scene-ink/60">{t('player.loadingVideo')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid aspect-video place-items-center bg-scene-surface p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
          <p className="font-sans text-sm text-scene-ink/80">{error}</p>
          <button
            type="button"
            onClick={() => mediaId && void resolveMediaUrl(mediaId)}
            className="mt-2 inline-flex items-center gap-1.5 rounded bg-accent px-4 py-1.5 font-sans text-xs font-semibold text-scene"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {t('player.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {streamUrl && (
        <video
          key={streamUrl}
          data-testid="lesson-video-player"
          controls
          autoPlay={false}
          preload="metadata"
          aria-label={title || t('player.videoPlayer', 'Lecteur vidéo')}
          className="h-full w-full object-contain"
          onError={() => setError(t('player.videoError'))}
        >
          <source src={streamUrl} />
          {t('player.unsupportedBrowser', 'Votre navigateur ne prend pas en charge la lecture de vidéos.')}
        </video>
      )}
    </div>
  )
}

/** Extracts lesson IDs from raw curriculumJson for quiz linking. */
function extractLessonIds(curriculumJson: string): (string | undefined)[] {
  try {
    const raw = JSON.parse(curriculumJson)
    if (!Array.isArray(raw)) return []
    return raw.flatMap((section: { lessons?: { id?: string }[] }) =>
      (section.lessons ?? []).map((l) => l.id)
    )
  } catch {
    return []
  }
}

function ActiveLessonQuizButton({ lessonId }: { lessonId: string | undefined }) {
  const { data: lessonQuiz } = useQuizByLesson(lessonId)
  if (!lessonQuiz || !lessonId) return null
  return (
    <Link
      to={`/quiz/${lessonId}`}
      className="inline-flex items-center gap-2 rounded bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
    >
      Passer le quiz →
    </Link>
  )
}

export function CoursePlayer() {
  const { t } = useTranslation()
  const { courseId } = useParams()
  const { data: course, isLoading } = useCourseById(courseId)
  const { data: enrollments = [] } = useMyEnrollments()
  const updateProgress = useUpdateProgress()

  const enrollment = enrollments.find((e) => e.courseId === courseId)
  const sections = course ? courseCurriculum(course) : []
  const lessons = sections.flatMap((s) => s.lessons)
  const [current, setCurrent] = useState(0)

  if (isLoading) return <div className="container py-10"><Skeleton className="h-96 w-full" /></div>
  if (!course) return null

  const activeLesson = lessons[current]
  const total = course.lessonCount || curriculumLessonCount(sections) || lessons.length
  const done = Math.round(((enrollment?.progress ?? 0) / 100) * total)

  // Extract raw lesson IDs from curriculum JSON for quiz linking
  const lessonIds = extractLessonIds(course.curriculumJson)
  const activeLessonId = lessonIds[current]

  const markComplete = () => {
    if (!enrollment) return
    const next = Math.min(100, Math.round(((current + 1) / Math.max(1, total)) * 100))
    updateProgress.mutate({ id: enrollment.id, progress: Math.max(enrollment.progress, next) })
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
      <main className="min-h-[60vh]">
        <VideoPlayer mediaId={activeLesson?.mediaId} title={activeLesson ? lessonTitle(activeLesson) : undefined} />
        <div className="p-6">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-accent">{course.title}</p>
          <h1 className="mt-2 font-serif text-h2 text-scene-ink">{activeLesson ? lessonTitle(activeLesson) : course.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={markComplete} disabled={!enrollment || updateProgress.isPending}
              className="inline-flex min-h-touch items-center gap-2 rounded bg-accent px-5 font-sans text-sm font-semibold text-scene disabled:opacity-50">
              <Check className="h-4 w-4" aria-hidden /> {t('player.complete')}
            </button>
            <ActiveLessonQuizButton lessonId={activeLessonId} />
          </div>
        </div>
      </main>

      <aside className="border-l border-line bg-scene-surface/40">
        <div className="border-b border-line p-4">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-scene-ink/50">{t('player.syllabus')}</p>
          <ProgressBar value={enrollment?.progress ?? 0} className="mt-3" />
        </div>
        <div className="overflow-y-auto">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="bg-scene-surface/60 px-4 py-2 font-serif text-scene-ink">{section.title}</p>
              <ul>
                {section.lessons.map((lesson) => {
                  const idx = lessons.indexOf(lesson)
                  const isDone = idx < done
                  const locked = idx > done && idx !== current
                  return (
                    <li key={idx}>
                      <button onClick={() => setCurrent(idx)}
                        className={cn('flex min-h-touch w-full items-center gap-2 border-b border-line/50 px-4 text-left font-sans text-sm', idx === current ? 'text-scene-ink' : 'text-scene-ink/55 hover:text-scene-ink')}>
                        <span className="shrink-0 text-accent">{isDone ? <Check className="h-3.5 w-3.5" aria-hidden /> : locked ? <Lock className="h-3.5 w-3.5 opacity-50" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}</span>
                        {lessonTitle(lesson)}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
