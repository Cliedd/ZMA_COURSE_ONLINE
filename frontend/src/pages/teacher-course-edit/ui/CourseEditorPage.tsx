import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton, toast } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import {
  useCourseById,
  courseCurriculum,
  useUpdateCourse,
  usePublishCourse,
  useDeleteCourse,
} from '@/entities/course'
import type { Course, CurriculumSection, CourseWriteRequest } from '@/entities/course'
import { CourseInfoForm, CurriculumEditor, PublishControl } from '@/features/course-editor'
import { patch } from '@/shared/api/http'

function toWriteRequest(base: Course, patch: Partial<CourseWriteRequest>): CourseWriteRequest {
  return {
    title: base.title,
    price: base.price,
    department: base.department,
    level: base.level,
    shortDescription: base.shortDescription,
    description: base.description,
    durationHours: base.durationHours,
    ects: base.ects ?? undefined,
    skillsJson: base.skillsJson,
    debouches: base.debouches,
    curriculumJson: base.curriculumJson,
    ...patch,
  }
}

/** Page d'édition d'un cours : infos, programme, publication et suppression. */
export function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading, isError } = useCourseById(courseId)
  const updateCourse = useUpdateCourse()
  const publishCourse = usePublishCourse()
  const deleteCourse = useDeleteCourse()

  const [sections, setSections] = useState<CurriculumSection[] | null>(null)

  if (isLoading) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Modifier le cours' }]} />
        <div className="container py-8">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Modifier le cours' }]} />
        <div className="container py-8">
          <p className="font-sans text-body text-ink-muted">Ce cours est introuvable.</p>
        </div>
      </div>
    )
  }

  const currentSections = sections ?? courseCurriculum(course)

  const handleSaveInfo = (data: CourseWriteRequest) => {
    if (!courseId) return
    updateCourse.mutate(
      { id: courseId, data: { ...data, curriculumJson: JSON.stringify(currentSections) } },
      { onError: () => toast.error('Impossible de sauvegarder le cours.') },
    )
  }

  const handleSaveCurriculum = (next: CurriculumSection[]) => {
    setSections(next)
    if (!courseId) return
    const data = toWriteRequest(course, { curriculumJson: JSON.stringify(next) })
    updateCourse.mutate(
      { id: courseId, data },
      { onError: () => toast.error('Impossible de sauvegarder le cours.') },
    )
    // Link each lesson's media to this course so enrolled students can play it.
    // Fire-and-forget — failures are non-blocking (the fallback courseId param handles playback).
    next.flatMap((s) => s.lessons).forEach((lesson) => {
      if (lesson.mediaId) {
        void patch(`/media/${lesson.mediaId}/attach`, { courseId }).catch(() => {})
      }
    })
  }

  const handleTogglePublish = () => {
    if (!courseId) return
    publishCourse.mutate({ id: courseId, published: !course.published })
  }

  const handleDelete = () => {
    if (!courseId) return
    deleteCourse.mutate(courseId, { onSuccess: () => navigate('/teacher') })
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Modifier le cours' }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">{course.title}</h1>

        <section className="mt-6">
          <CourseInfoForm course={course} onSave={handleSaveInfo} />
        </section>

        <section className="mt-8 border-t border-line pt-8">
          <CurriculumEditor sections={currentSections} onChange={handleSaveCurriculum} />
        </section>

        <section className="mt-8 border-t border-line pt-8">
          <PublishControl
            published={course.published}
            onTogglePublish={handleTogglePublish}
            onDelete={handleDelete}
            pending={publishCourse.isPending || deleteCourse.isPending}
          />
        </section>
      </div>
    </div>
  )
}
