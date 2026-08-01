import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardMedia, CardBody, CardFooter, Picture } from '@/shared/ui'
import { formatPrice, formatDuration } from '@/shared/config/i18n'
import type { Course } from '@/entities/course'
import { courseImage } from '../lib/courseImage'
import { departmentLabel } from '@/shared/config/navigation'

/**
 * Carte de cours, registre clair éditorial. Le nom, le prix et la note sont en
 * serif (marqueur « publication », pas « application ») ; niveau en eyebrow or.
 */
export function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation()
  const image = courseImage(course)

  const meta = [course.teacherName, course.durationHours > 0 ? formatDuration(course.durationHours) : null, course.ects ? `${course.ects} ECTS` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link to={`/course/${course.slug}`} className="group block focus-visible:outline-none">
      <Card className="h-full transition-colors duration-brand ease-brand group-hover:border-accent-ink/40">
        <CardMedia>
          <Picture image={image} alt="" sizes="(min-width: 768px) 400px, 100vw" className="aspect-[16/10] w-full transition-transform duration-brand ease-brand group-hover:scale-[1.02]" />
        </CardMedia>
        <CardBody className="flex flex-col gap-2">
          <span className="font-sans text-eyebrow font-bold uppercase text-accent-ink">
            {t(`level.${course.level}`, course.level)}
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
