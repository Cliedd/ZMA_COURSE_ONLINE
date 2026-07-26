import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Skeleton, Picture } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { IMAGES } from '@/shared/config/images/manifest'
import { useTeachers } from '@/entities/teacher'
import type { Teacher } from '@/entities/teacher'

/** Équipe pédagogique : enseignants dérivés du catalogue. */
export function TeachersPage() {
  const { t } = useTranslation()
  const { data: teachers = [], isLoading } = useTeachers()

  return (
    <div>
      <Breadcrumb items={[{ label: t('nav.teachers') }]} />
      <div className="relative h-48 overflow-hidden sm:h-64">
        <Picture image={IMAGES.campus} sizes="100vw" priority className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-scene/40" />
      </div>
      <div className="container py-10">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">{t('nav.teachers')}</p>
        <h1 className="mt-3 font-serif text-h1 text-ink">{t('teachers.title')}</h1>
        <p className="mt-3 max-w-2xl font-sans text-body leading-relaxed text-ink-muted">{t('teachers.subtitle')}</p>

        <div className="mt-10">
          {isLoading ? (
            <Grid>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</Grid>
          ) : teachers.length === 0 ? (
            <div className="border border-line bg-surface p-12 text-center font-serif text-h3 text-ink">{t('teachers.empty')}</div>
          ) : (
            <Grid>{teachers.map((teacher) => <TeacherCard key={teacher.username} teacher={teacher} />)}</Grid>
          )}
        </div>
      </div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  const { t } = useTranslation()
  const initials = teacher.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Link to={`/teachers/${teacher.username}`} className="flex flex-col gap-4 bg-surface p-6 transition-colors duration-brand ease-brand hover:bg-paper">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line bg-paper font-serif text-h3 text-ink-muted" aria-hidden>
          {initials}
        </span>
        <div>
          <p className="font-serif text-h3 text-ink">{teacher.name}</p>
          <p className="font-sans text-sm text-ink-muted">{t('teachers.courses', { count: teacher.courseCount })}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 font-sans text-sm text-ink-muted">
        {teacher.avgRating != null && (
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {teacher.avgRating.toFixed(1)}</span>
        )}
        {teacher.departments[0] && <span className="text-ink-faint">{teacher.departments[0]}</span>}
      </div>
    </Link>
  )
}
