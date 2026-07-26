import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton, ProgressBar } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useMyEnrollments } from '@/entities/enrollment'
import type { Enrollment } from '@/entities/enrollment'

export function StudentDashboard() {
  const { t } = useTranslation()
  const { data: enrollments = [], isLoading } = useMyEnrollments()
  const resume = [...enrollments].sort((a, b) => a.progress - b.progress).find((e) => e.progress < 100) ?? enrollments[0]

  return (
    <div>
      <Breadcrumb items={[{ label: t('dashboard.title') }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">{t('dashboard.title')}</h1>

        {isLoading ? (
          <Skeleton className="mt-8 h-40 w-full" />
        ) : enrollments.length === 0 ? (
          <div className="mt-8 border border-line bg-surface p-12 text-center">
            <p className="font-serif text-h3 text-ink">{t('dashboard.empty')}</p>
            <Link to="/catalogue" className="mt-4 inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">{t('dashboard.browse')}</Link>
          </div>
        ) : (
          <>
            {resume && (
              <section className="mt-8 border border-line bg-surface p-6">
                <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-accent-ink">{t('dashboard.resume')}</p>
                <h2 className="mt-2 font-serif text-h2 text-ink">{resume.courseTitle}</h2>
                <ProgressBar value={resume.progress} className="mt-4" />
                <Link to={`/learning/${resume.courseId}`} className="mt-5 inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">{t('dashboard.continue')}</Link>
              </section>
            )}

            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-h2 text-ink">{t('dashboard.myCourses')}</h2>
                <Link to="/certificates" className="font-sans text-sm font-semibold text-blue hover:underline">{t('dashboard.certificates')}</Link>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {enrollments.map((e) => <EnrollmentRow key={e.id} enrollment={e} />)}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function EnrollmentRow({ enrollment: e }: { enrollment: Enrollment }) {
  const { t } = useTranslation()
  return (
    <li className="border border-line bg-surface p-5">
      <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-accent-ink">{e.courseLevel}</p>
      <Link to={`/learning/${e.courseId}`} className="mt-1 block font-serif text-h3 text-ink hover:underline">{e.courseTitle}</Link>
      <ProgressBar value={e.progress} className="mt-3" />
      <p className="mt-2 font-sans text-sm text-ink-muted">{t('dashboard.progress', { p: Math.round(e.progress) })}</p>
    </li>
  )
}

