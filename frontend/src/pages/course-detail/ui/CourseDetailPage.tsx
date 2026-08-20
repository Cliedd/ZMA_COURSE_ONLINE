import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Check, ShoppingCart, BookOpen } from 'lucide-react'
import { Skeleton, Picture } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { formatPrice, formatDuration } from '@/shared/config/i18n'
import { useCourse, courseSkills, courseCurriculum, curriculumLessonCount } from '@/entities/course'
import { useEnrollmentCheck } from '@/entities/enrollment'
import { useAuthStore } from '@/entities/session'
import { slugify } from '@/shared/lib/slugify'
import { courseImage } from '@/widgets/course-card/lib/courseImage'
import { DEPARTMENTS, departmentLabel, levelLabel } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import { CourseSyllabus } from './CourseSyllabus'

const DEPT_DOT = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

function deptDotClass(value?: string | null): string {
  const idx = DEPARTMENTS.findIndex((d) => d.value === value)
  return DEPT_DOT[idx >= 0 ? idx % DEPT_DOT.length : 0] ?? DEPT_DOT[0]
}

export function CourseDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { data: course, isLoading, isError } = useCourse(slug)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data: enrollCheck, isLoading: isCheckLoading } = useEnrollmentCheck(
    isAuthenticated ? course?.id : undefined,
  )

  const enrolled = enrollCheck?.enrolled === true

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
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Picture image={courseImage(course)} alt="" priority sizes="100vw" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-scene via-scene/65 to-scene/20" />
        </div>
        <div className="container max-w-3xl py-16">
          <span className="flex items-center gap-2 font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent">
            {course.department && (
              <span className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', deptDotClass(course.department))} aria-hidden />
            )}
            {levelLabel(t, course.level)}{course.department ? ` · ${departmentLabel(t, course.department)}` : ''}
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
          <div className="border-2 border-ink bg-surface">
            <div className="border-b border-line p-6">
              <p className="font-serif text-display leading-none text-ink">
                {course.price > 0 ? formatPrice(course.price) : t('course.free')}
              </p>
              {enrolled ? (
                <Link
                  to={`/learning/${course.id}`}
                  aria-label={t('course.continueLearning')}
                  className="mt-5 flex min-h-touch items-center justify-center gap-2 rounded border-2 border-ink bg-surface px-5 font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:bg-ink/10"
                >
                  <BookOpen className="h-4 w-4" aria-hidden />
                  {t('course.continueLearning')}
                </Link>
              ) : (
                <Link
                  to={isAuthenticated && isCheckLoading ? '#' : `/checkout/${course.id}`}
                  aria-disabled={isAuthenticated && isCheckLoading}
                  className={cn(
                    'mt-5 flex min-h-touch items-center justify-center gap-2 rounded bg-ink px-5 font-sans text-sm font-semibold text-paper transition-colors duration-brand ease-brand',
                    isAuthenticated && isCheckLoading
                      ? 'cursor-wait opacity-60'
                      : 'hover:bg-ink/90',
                  )}
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden />
                  {t('course.buy')}
                </Link>
              )}
              {!enrolled && (
                <p className="mt-3 text-center font-sans text-sm text-ink-faint">{t('course.lifetime')}</p>
              )}
              {enrolled && (
                <p className="mt-3 text-center font-sans text-sm text-ink-faint">{t('course.alreadyEnrolled')}</p>
              )}
            </div>

            <ul className="divide-y divide-line font-sans text-sm">
              <SummaryRow label={t('catalogue.filtersLevel')} value={levelLabel(t, course.level)} />
              {course.department && <SummaryRow label={t('catalogue.filtersDept')} value={departmentLabel(t, course.department)} />}
              {course.durationHours > 0 && <SummaryRow label={t('course.duration')} value={formatDuration(course.durationHours)} />}
              {lessonTotal > 0 && <SummaryRow label={t('course.syllabus')} value={t('course.lessons', { count: lessonTotal })} />}
              {course.ects != null && course.ects > 0 && <SummaryRow label="ECTS" value={String(course.ects)} />}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-6 py-3">
      <span className="text-ink-faint">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </li>
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
