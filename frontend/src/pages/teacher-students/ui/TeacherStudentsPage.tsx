import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { Skeleton, ProgressBar } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAuthStore } from '@/entities/session'
import { useTeacherCourses } from '@/entities/course'
import { useCourseEnrollments } from '@/entities/enrollment'
import type { Enrollment } from '@/entities/enrollment'

/** Single enrollment row inside the student table. */
function EnrollmentRow({ enrollment }: { enrollment: Enrollment }) {
  const { t } = useTranslation()
  const isComplete = enrollment.progress >= 100
  const statusLabel = isComplete
    ? t('teacherStudents.statusCompleted')
    : t('teacherStudents.statusActive')
  const statusClass = isComplete ? 'text-success' : 'text-accent-ink'

  const enrolledDate = enrollment.enrolledAt
    ? new Date(enrollment.enrolledAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <tr className="border-b border-line last:border-0 hover:bg-surface/60 transition-colors">
      <td className="py-3 px-4 font-sans text-sm text-ink break-all">
        {enrollment.studentId || '—'}
      </td>
      <td className="py-3 px-4 font-sans text-sm text-ink-muted whitespace-nowrap">
        {enrolledDate}
      </td>
      <td className="py-3 px-4">
        <ProgressBar value={enrollment.progress} className="w-24" />
      </td>
      <td className="py-3 px-4">
        <span className={`font-sans text-xs font-semibold uppercase ${statusClass}`}>
          {statusLabel}
        </span>
      </td>
    </tr>
  )
}

/** Table of enrollments for one course (fetched on demand). */
function CourseEnrollmentsTable({ courseId }: { courseId: string }) {
  const { t } = useTranslation()
  const { data: enrollments = [], isLoading, isError } = useCourseEnrollments(courseId)

  if (isLoading) {
    return (
      <div className="space-y-2 px-4 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="px-4 py-4 font-sans text-sm text-danger">
        {t('teacherStudents.loadError')}
      </p>
    )
  }

  if (enrollments.length === 0) {
    return (
      <p className="px-4 py-6 font-sans text-sm text-ink-muted text-center">
        {t('teacherStudents.noStudents')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-line bg-surface">
            <th className="py-2 px-4 font-sans text-eyebrow text-ink-muted">{t('teacherStudents.colStudent')}</th>
            <th className="py-2 px-4 font-sans text-eyebrow text-ink-muted">{t('teacherStudents.colEnrolledAt')}</th>
            <th className="py-2 px-4 font-sans text-eyebrow text-ink-muted">{t('teacherStudents.colProgress')}</th>
            <th className="py-2 px-4 font-sans text-eyebrow text-ink-muted">{t('teacherStudents.colStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <EnrollmentRow key={e.id} enrollment={e} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TeacherStudentsPage() {
  const { t } = useTranslation()
  const { email } = useAuthStore()
  const { data: courses = [], isLoading: coursesLoading } = useTeacherCourses(email ?? undefined)

  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // Default to first course once loaded
  const resolvedCourseId = selectedCourseId || courses[0]?.id || ''

  return (
    <div>
      <Breadcrumb
        items={[
          { label: t('teacherDashboard.breadcrumb'), to: '/teacher' },
          { label: t('teacherStudents.breadcrumb') },
        ]}
      />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-h1 text-ink">{t('teacherStudents.title')}</h1>
            <p className="mt-1 font-sans text-body text-ink-muted">
              {t('teacherStudents.subtitle')}
            </p>
          </div>
          <Link
            to="/teacher"
            className="inline-flex min-h-touch items-center gap-2 rounded border border-line px-5 font-sans text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            {t('teacherStudents.backToDashboard')}
          </Link>
        </div>

        {/* Course filter */}
        <div className="mt-6">
          {coursesLoading ? (
            <Skeleton className="h-10 w-72" />
          ) : courses.length === 0 ? (
            <div className="border border-line bg-surface p-8 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-ink-muted" aria-hidden="true" />
              <p className="font-serif text-h3 text-ink">{t('teacherStudents.noCourses')}</p>
              <Link
                to="/teacher/courses/new"
                className="mt-4 inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper"
              >
                {t('teacherDashboard.newCourse')}
              </Link>
            </div>
          ) : (
            <>
              <label
                htmlFor="course-filter"
                className="mb-2 block font-sans text-eyebrow text-ink-muted"
              >
                {t('teacherStudents.filterLabel')}
              </label>
              <select
                id="course-filter"
                value={resolvedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="min-h-touch rounded border border-line bg-surface px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Enrollment table */}
        {courses.length > 0 && resolvedCourseId && (
          <div className="mt-6 border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="font-sans text-sm font-semibold text-ink">
                {courses.find((c) => c.id === resolvedCourseId)?.title ?? ''}
              </p>
            </div>
            <CourseEnrollmentsTable courseId={resolvedCourseId} />
          </div>
        )}
      </div>
    </div>
  )
}
