import { useQuery } from '@tanstack/react-query'
import { courseApi } from '../api/courseApi'
import type { CourseFilters } from '../api/courseApi'
import { courseKeys } from './queryKeys'

/** Liste paginée de cours, filtrée. */
export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () => courseApi.list(filters),
    staleTime: 60_000,
  })
}

/** Un cours par son slug. */
export function useCourse(slug: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(slug ?? ''),
    queryFn: () => courseApi.getBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

/** Avis d'un cours. */
export function useCourseReviews(id: string | undefined, page = 0) {
  return useQuery({
    queryKey: [...courseKeys.reviews(id ?? ''), page],
    queryFn: () => courseApi.getReviews(id as string, page),
    enabled: Boolean(id),
  })
}

/** Un cours par son id (avec sections). */
export function useCourseById(id: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(`id:${id ?? ''}`),
    queryFn: () => courseApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}
