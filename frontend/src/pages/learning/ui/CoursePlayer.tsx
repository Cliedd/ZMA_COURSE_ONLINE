import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Play, Check, Lock } from 'lucide-react'
import { Skeleton, ProgressBar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useCourseById, courseCurriculum, curriculumLessonCount, lessonTitle } from '@/entities/course'
import { useMyEnrollments, useUpdateProgress } from '@/entities/enrollment'

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

  const total = course.lessonCount || curriculumLessonCount(sections) || lessons.length
  const done = Math.round(((enrollment?.progress ?? 0) / 100) * total)

  const markComplete = () => {
    if (!enrollment) return
    const next = Math.min(100, Math.round(((current + 1) / Math.max(1, total)) * 100))
    updateProgress.mutate({ id: enrollment.id, progress: Math.max(enrollment.progress, next) })
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
      <main className="min-h-[60vh]">
        <div className="grid aspect-video place-items-center bg-scene-surface">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-scene"><Play className="h-6 w-6" aria-hidden /></span>
            <p className="mt-3 font-sans text-sm text-scene-ink/60">{t('player.noVideo')}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-accent">{course.title}</p>
          <h1 className="mt-2 font-serif text-h2 text-scene-ink">{lessons[current] ? lessonTitle(lessons[current]) : course.title}</h1>
          <button onClick={markComplete} disabled={!enrollment || updateProgress.isPending}
            className="mt-5 inline-flex min-h-touch items-center gap-2 rounded bg-accent px-5 font-sans text-sm font-semibold text-scene disabled:opacity-50">
            <Check className="h-4 w-4" aria-hidden /> {t('player.complete')}
          </button>
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
