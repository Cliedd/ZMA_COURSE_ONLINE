import { Link } from 'react-router-dom'
import { Badge } from '@/shared/ui'
import type { Course } from '@/entities/course'

/** Une ligne de la liste des cours de l'enseignant. */
export function TeacherCourseRow({ course }: { course: Course }) {
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
          {course.published ? 'Publié' : 'Brouillon'}
        </Badge>
        <Link
          to={`/teacher/courses/${course.id}/edit`}
          className="inline-flex min-h-touch items-center font-sans text-sm font-semibold text-ink underline"
        >
          Modifier
        </Link>
      </div>
    </li>
  )
}
