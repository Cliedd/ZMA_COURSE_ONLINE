import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { CourseGrid } from '@/widgets/course-grid'
import { useTeacher } from '@/entities/teacher'
import { departmentLabel } from '@/shared/config/navigation'

const DEPT_BG = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

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
        <Link to="/teachers" className="inline-flex min-h-touch items-center bg-ink px-5 font-sans text-sm font-semibold text-paper">{t('teachers.backList')}</Link>
      </div>
    )
  }

  const initials = teacher.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const deptBg = DEPT_BG[teacher.username.length % DEPT_BG.length]

  return (
    <div>
      <Breadcrumb items={[{ label: t('nav.teachers'), to: '/teachers' }, { label: teacher.name }]} />

      <div className="border-b border-line bg-paper">
        <div className="container flex flex-wrap items-center gap-8 py-12">
          <span className={`grid h-24 w-24 shrink-0 place-items-center font-serif text-h1 text-scene-ink ${deptBg}`} aria-hidden>
            {initials}
          </span>
          <div>
            <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">{t('nav.teachers')}</p>
            <h1 className="mt-2 font-serif text-h1 text-ink">{teacher.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm text-ink-muted">
              <span>{t('teachers.courses', { count: teacher.courseCount })}</span>
              {teacher.avgRating != null && (
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {teacher.avgRating.toFixed(1)}</span>
              )}
            </div>
            {teacher.departments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {teacher.departments.map((dept, i) => (
                  <span
                    key={dept}
                    className={`inline-flex items-center gap-1.5 border border-line px-2.5 py-1 font-sans text-eyebrow font-bold uppercase tracking-[0.12em] text-ink-muted`}
                  >
                    <span className={`h-2 w-2 shrink-0 ${DEPT_BG[i % DEPT_BG.length]}`} aria-hidden />
                    {departmentLabel(t, dept)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-14">
        <section>
          <h2 className="font-serif text-h2 text-ink">{t('teachers.profileCourses')}</h2>
          <div className="mt-6"><CourseGrid courses={data.courses} /></div>
        </section>
      </div>
    </div>
  )
}
