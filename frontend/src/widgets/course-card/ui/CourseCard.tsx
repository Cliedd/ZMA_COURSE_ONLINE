import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardMedia, CardBody, CardFooter, Picture } from '@/shared/ui'
import { formatPrice, formatDuration } from '@/shared/config/i18n'
import { DEPARTMENTS, departmentLabel, levelLabel } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import type { Course } from '@/entities/course'
import { courseImage } from '../lib/courseImage'

const DEPT_DOT = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

function deptDotClass(value?: string | null): string {
  const idx = DEPARTMENTS.findIndex((d) => d.value === value)
  return DEPT_DOT[idx >= 0 ? idx % DEPT_DOT.length : 0] ?? DEPT_DOT[0]
}

/**
 * Carte de cours, registre clair éditorial. Le nom, le prix et la note sont en
 * serif (marqueur « publication », pas « application ») ; niveau/département en
 * eyebrow, avec un repère de couleur `--dept-1..5` propre au département.
 */
export function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation()
  const image = courseImage(course)

  const meta = [course.teacherName, course.durationHours > 0 ? formatDuration(course.durationHours) : null, course.ects ? `${course.ects} ECTS` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link to={`/course/${course.slug}`} className="group block focus-visible:outline-none">
      <Card className="h-full transition-all duration-brand ease-brand group-hover:-translate-y-0.5 group-hover:border-accent-ink/40 group-hover:shadow-[var(--shadow-overlay)]">
        <CardMedia>
          <Picture image={image} alt="" sizes="(min-width: 768px) 400px, 100vw" className="aspect-[16/10] w-full transition-transform duration-brand ease-brand group-hover:scale-[1.02]" />
        </CardMedia>
        <CardBody className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 font-sans text-eyebrow font-bold uppercase text-accent-ink">
            {course.department && (
              <span className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', deptDotClass(course.department))} aria-hidden />
            )}
            {levelLabel(t, course.level)}
            {course.department ? ` · ${departmentLabel(t, course.department)}` : ''}
          </span>
          <h3 className="font-serif text-h3 leading-tight text-ink group-hover:underline decoration-accent-ink/40 underline-offset-4">
            {course.title}
          </h3>
          {meta && <p className="font-sans text-sm text-ink-muted">{meta}</p>}
        </CardBody>
        <CardFooter>
          <span className="font-serif text-h3 text-ink">
            {course.price > 0 ? formatPrice(course.price) : t('course.free', 'Gratuit')}
          </span>
          {course.rating != null ? (
            <span className="flex items-center gap-1 font-sans text-sm text-ink-muted">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
              {course.rating.toFixed(1)}
              {course.studentsCount > 0 && <span className="text-ink-faint"> · {course.studentsCount}</span>}
            </span>
          ) : (
            <span className="font-sans text-sm text-ink-faint">{t('course.freePreview', 'Aperçu gratuit')}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
