import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton, ProgressBar } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useMyEnrollments } from '@/entities/enrollment'

export function MyCoursesPage() {
  const { t } = useTranslation()
  const { data: enrollments = [], isLoading } = useMyEnrollments()

  return (
    <div>
      <Breadcrumb items={[{ label: t('myCourses.title') }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">{t('myCourses.title')}</h1>
        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
        ) : enrollments.length === 0 ? (
          <div className="mt-8 border border-line bg-surface p-12 text-center">
            <p className="font-serif text-h3 text-ink">{t('myCourses.empty')}</p>
            <Link to="/catalogue" className="mt-4 inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">{t('myCourses.browse')}</Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {enrollments.map((e) => (
              <li key={e.id} className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-accent-ink">{e.courseLevel}</p>
                <Link to={`/learning/${e.courseId}`} className="mt-1 block font-serif text-h3 text-ink hover:underline">{e.courseTitle}</Link>
                <ProgressBar value={e.progress} className="mt-3" />
                <p className="mt-2 font-sans text-sm text-ink-muted">{t('dashboard.progress', { p: Math.round(e.progress) })}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
