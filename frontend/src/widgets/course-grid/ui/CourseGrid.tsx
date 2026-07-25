import type { ReactNode } from 'react'
import { Skeleton } from '@/shared/ui'
import type { Course } from '@/entities/course'
import { CourseCard } from '@/widgets/course-card'

interface CourseGridProps {
  courses: Course[]
  loading?: boolean
  /** Nombre de squelettes pendant le chargement. */
  skeletonCount?: number
  /** Contenu affiché quand la liste est vide (état « Zero Dead Ends »). */
  emptyState?: ReactNode
}

/** Grille de cartes de cours : squelettes au chargement, état vide explicite. */
export function CourseGrid({ courses, loading = false, skeletonCount = 6, emptyState }: CourseGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="border border-line bg-surface">
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return <div>{emptyState}</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
