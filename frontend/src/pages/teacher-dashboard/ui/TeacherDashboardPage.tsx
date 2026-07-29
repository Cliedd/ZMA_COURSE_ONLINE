import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAuthStore } from '@/entities/session'
import { useTeacherCourses } from '@/entities/course'
import { TeacherCourseRow } from './TeacherCourseRow'

/** Somme des étudiants inscrits sur tous les cours de l'enseignant. */
function totalStudents(courses: { studentsCount: number }[]): number {
  return courses.reduce((sum, c) => sum + c.studentsCount, 0)
}

/** Note moyenne des cours notés, ou « — » si aucun cours n'a de note. */
function averageRating(courses: { rating: number | null }[]): string {
  const rated = courses.filter((c): c is { rating: number } => c.rating !== null)
  if (rated.length === 0) return '—'
  return (rated.reduce((sum, c) => sum + c.rating, 0) / rated.length).toFixed(1)
}

export function TeacherDashboardPage() {
  const { t } = useTranslation()
  const { email } = useAuthStore()
  const { data: courses = [], isLoading, isError } = useTeacherCourses(email ?? undefined)

  return (
    <div>
      <Breadcrumb items={[{ label: t('teacherDashboard.breadcrumb') }]} />
      <div className="container py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-h1 text-ink">{t('teacherDashboard.title')}</h1>
            <p className="mt-1 font-sans text-body text-ink-muted">
              {t('teacherDashboard.subtitle')}
            </p>
          </div>
          <Link
            to="/teacher/courses/new"
            className="inline-flex min-h-touch items-center gap-2 rounded bg-ink px-5 font-sans text-sm font-semibold text-paper"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('teacherDashboard.newCourse')}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-line bg-surface p-5">
            <p className="font-sans text-eyebrow text-ink-muted">{t('teacherDashboard.statCourses')}</p>
            <p className="mt-1 font-serif text-h2 text-ink">{isLoading ? '—' : courses.length}</p>
          </div>
          <div className="border border-line bg-surface p-5">
            <p className="font-sans text-eyebrow text-ink-muted">{t('teacherDashboard.statStudents')}</p>
            <p className="mt-1 font-serif text-h2 text-ink">{isLoading ? '—' : totalStudents(courses)}</p>
          </div>
          <div className="border border-line bg-surface p-5">
            <p className="font-sans text-eyebrow text-ink-muted">{t('teacherDashboard.statRating')}</p>
            <p className="mt-1 font-serif text-h2 text-ink">{isLoading ? '—' : averageRating(courses)}</p>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <ul className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-20 w-full" />
                </li>
              ))}
            </ul>
          ) : isError ? (
            <div className="border border-line bg-surface p-8 text-center">
              <p className="font-sans text-body text-danger">
                {t('teacherDashboard.loadError')}
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="border border-line bg-surface p-12 text-center">
              <p className="font-serif text-h3 text-ink">
                {t('teacherDashboard.empty')}
              </p>
              <Link
                to="/teacher/courses/new"
                className="mt-4 inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper"
              >
                {t('teacherDashboard.newCourse')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {courses.map((course) => (
                <TeacherCourseRow key={course.id} course={course} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
