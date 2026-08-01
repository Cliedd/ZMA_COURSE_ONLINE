import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Check } from 'lucide-react'
import { Skeleton, Picture } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { formatPrice, formatDuration } from '@/shared/config/i18n'
import { useCourse, courseSkills, courseCurriculum, curriculumLessonCount } from '@/entities/course'
import { slugify } from '@/shared/lib/slugify'
import { courseImage } from '@/widgets/course-card/lib/courseImage'
import { departmentLabel } from '@/shared/config/navigation'
import { CourseSyllabus } from './CourseSyllabus'

export function CourseDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { data: course, isLoading, isError } = useCourse(slug)

  if (isLoading) return <CourseDetailSkeleton />
  if (isError || !course) return <NotFoundState />

  const skills = courseSkills(course).slice(0, 6)
  const sections = courseCurriculum(course)
  const lessonTotal = course.lessonCount || curriculumLessonCount(sections)

  return (
    <div>
      <Breadcrumb items={[{ label: t('catalogue.shop'), to: '/catalogue' }, { label: course.title }]} />

      {/* En-tête sombre (scène) */}
      <section data-theme="dark" className="relative isolate overflow-hidden bg-scene text-scene-ink">
        <div className="absolute inset-0 -z-10">
          <Picture image={courseImage(course)} alt="" priority sizes="100vw" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-scene via-scene/85 to-scene/40" />
        </div>
        <div className="container max-w-3xl py-16">
          <span className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent">
            {t(`level.${course.level}`, course.level)}{course.department ? ` · ${departmentLabel(t, course.department)}` : ''}
          </span>
          <h1 className="mt-4 font-serif text-h1 leading-tight text-scene-ink">{course.title}</h1>
          {course.shortDescription && <p className="mt-4 max-w-2xl font-sans text-body leading-relaxed text-scene-ink/70">{course.shortDescription}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-sm text-scene-ink/70">
            {course.teacherName && (
              <span>{t('course.by')} <Link to={`/teachers/${slugify(course.teacherName)}`} className="text-accent hover:underline">{course.teacherName}</Link></span>
            )}
            {course.rating != null && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {course.rating.toFixed(1)}</span>}
            {lessonTotal > 0 && <span>{t('course.lessons', { count: lessonTotal })}</span>}
            {course.durationHours > 0 && <span>{formatDuration(course.durationHours)}</span>}
            {course.ects && <span>{course.ects} ECTS</span>}
          </div>
        </div>
      </section>

      <div className="container grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {skills.length > 0 && (
            <section>
              <h2 className="font-serif text-h2 text-ink">{t('course.learn')}</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2 font-sans text-sm text-ink-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden /> {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.description && (
            <section>
              <p className="max-w-prose whitespace-pre-line font-sans text-body leading-relaxed text-ink-muted">{course.description}</p>
            </section>
          )}

          {sections.length > 0 && (
            <section>
              <h2 className="font-serif text-h2 text-ink">{t('course.syllabus')}</h2>
              <div className="mt-5"><CourseSyllabus sections={sections} /></div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-surface p-6">
            <p className="font-serif text-display leading-none text-ink">
              {course.price > 0 ? formatPrice(course.price) : t('course.free')}
            </p>
            <Link to={`/checkout/${course.id}`} className="mt-5 flex min-h-touch items-center justify-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">
              {t('course.buy')}
            </Link>
            <p className="mt-3 text-center font-sans text-sm text-ink-faint">{t('course.lifetime')}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CourseDetailSkeleton() {
  return (
    <div className="container space-y-6 py-16">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function NotFoundState() {
  const { t } = useTranslation()
  return (
    <div className="container flex flex-col items-start gap-4 py-20">
      <h1 className="font-serif text-h1 text-ink">{t('course.notFound')}</h1>
      <Link to="/catalogue" className="inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">
        {t('course.backCatalogue')}
      </Link>
    </div>
  )
}
