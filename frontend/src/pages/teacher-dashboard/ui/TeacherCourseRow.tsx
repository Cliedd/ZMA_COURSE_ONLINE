import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageSquare } from 'lucide-react'
import { Badge } from '@/shared/ui'
import type { Course } from '@/entities/course'

/** Une ligne de la liste des cours de l'enseignant. */
export function TeacherCourseRow({ course }: { course: Course }) {
  const { t } = useTranslation()
  return (
    <li className="flex items-center justify-between border border-line bg-surface p-4">
      <div>
        <p className="font-serif text-h3 text-ink">{course.title}</p>
        <p className="font-sans text-eyebrow text-accent-ink">
          {course.level} · {course.department}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Badge tone={course.published ? 'success' : 'default'}>
          {course.published ? t('teacherDashboard.published') : t('teacherDashboard.draft')}
        </Badge>
        <Link
          to={`/teacher/courses/${course.id}/quiz-stats`}
          className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
        >
          Stats quiz
        </Link>
        <Link
          to={`/chat/${course.id}`}
          className="inline-flex min-h-touch items-center gap-1.5 font-sans text-sm font-semibold text-ink underline"
          aria-label={t('teacherDashboard.chat')}
        >
          <MessageSquare className="h-4 w-4 text-accent" aria-hidden />
          {t('teacherDashboard.chat')}
        </Link>
        <Link
          to={`/teacher/courses/${course.id}/edit`}
          className="inline-flex min-h-touch items-center font-sans text-sm font-semibold text-ink underline"
        >
          {t('teacherDashboard.edit')}
        </Link>
      </div>
    </li>
  )
}
