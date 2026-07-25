import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { CourseGrid } from '@/widgets/course-grid'
import { useTeacher } from '@/entities/teacher'

export function TeacherProfilePage() {
  const { t } = useTranslation()
  const { username } = useParams()
  const { data, isLoading } = useTeacher(username)

  if (isLoading) return <div className="container space-y-6 py-16"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 w-full" /></div>

  const teacher = data?.teacher
  if (!teacher) {
    return (
      <div className="container flex flex-col items-start gap-4 py-20">
        <h1 className="font-serif text-h1 text-ink">{t('teachers.empty')}</h1>
        <Link to="/teachers" className="inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">{t('teachers.backList')}</Link>
      </div>
    )
  }

  const initials = teacher.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div>
      <Breadcrumb items={[{ label: t('nav.teachers'), to: '/teachers' }, { label: teacher.name }]} />
      <div className="container py-10">
        <div className="flex flex-wrap items-center gap-6">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-line bg-paper font-serif text-h2 text-ink-muted" aria-hidden>{initials}</span>
          <div>
            <h1 className="font-serif text-h1 text-ink">{teacher.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-sm text-ink-muted">
              <span>{t('teachers.courses', { count: teacher.courseCount })}</span>
              {teacher.avgRating != null && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden /> {teacher.avgRating.toFixed(1)}</span>}
              {teacher.departments.length > 0 && <span className="text-ink-faint">{teacher.departments.join(' · ')}</span>}
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-h2 text-ink">{t('teachers.profileCourses')}</h2>
          <div className="mt-6"><CourseGrid courses={data.courses} /></div>
        </section>
      </div>
    </div>
  )
}
