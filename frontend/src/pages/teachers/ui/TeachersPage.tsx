import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Skeleton, Picture, BlurFade } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { IMAGES } from '@/shared/config/images/manifest'
import { useTeachers } from '@/entities/teacher'
import { departmentLabel } from '@/shared/config/navigation'
import type { Teacher } from '@/entities/teacher'

const DEPT_BG = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

/** Équipe pédagogique : enseignants dérivés du catalogue. */
export function TeachersPage() {
  const { t } = useTranslation()
  const { data: teachers = [], isLoading } = useTeachers()

  return (
    <div>
      <Breadcrumb items={[{ label: t('nav.teachers') }]} />

      <div className="relative h-56 overflow-hidden sm:h-72">
        <Picture image={IMAGES.campus} sizes="100vw" priority className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-scene/60" />
        <div className="container absolute inset-0 flex flex-col justify-end pb-10">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-scene-accent">
            {t('nav.teachers')}
          </p>
          <h1 className="mt-3 font-serif text-h1 text-scene-ink">{t('teachers.title')}</h1>
          <p className="mt-3 max-w-2xl font-sans text-body leading-relaxed text-scene-ink/80">
            {t('teachers.subtitle')}
          </p>
        </div>
      </div>

      <div className="container py-14">
        {isLoading ? (
          <Grid>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</Grid>
        ) : teachers.length === 0 ? (
          <div className="border border-line bg-surface p-12 text-center font-serif text-h3 text-ink">{t('teachers.empty')}</div>
        ) : (
          <Grid>
            {teachers.map((teacher, i) => (
              <BlurFade key={teacher.username} delay={i * 0.04}>
                <TeacherCard teacher={teacher} deptBg={DEPT_BG[i % DEPT_BG.length] ?? DEPT_BG[0]} />
              </BlurFade>
            ))}
          </Grid>
        )}
      </div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function TeacherCard({ teacher, deptBg }: { teacher: Teacher; deptBg: string }) {
  const { t } = useTranslation()
  const initials = teacher.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Link
      to={`/teachers/${teacher.username}`}
      className="group flex flex-col border border-line bg-surface transition-transform duration-brand ease-brand hover:-translate-y-1 hover:shadow-overlay"
    >
      <div className={`grid aspect-[4/3] place-items-center ${deptBg}`}>
        <span className="font-serif text-h1 text-scene-ink" aria-hidden>{initials}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <p className="font-serif text-h3 text-ink">{teacher.name}</p>
          <p className="mt-1 font-sans text-sm text-ink-muted">{t('teachers.courses', { count: teacher.courseCount })}</p>
        </div>
        <div className="mt-auto flex items-center gap-4 font-sans text-sm text-ink-muted">
          {teacher.avgRating != null && (
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {teacher.avgRating.toFixed(1)}</span>
          )}
          {teacher.departments[0] && (
            <span className="font-sans text-eyebrow font-bold uppercase tracking-[0.14em] text-ink-faint">
              {departmentLabel(t, teacher.departments[0])}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
