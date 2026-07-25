import type { CourseFilters } from '../api/courseApi'

/** Fabrique de clés de cache typée (spec § 7.3) : invalidation juste, pas devinée. */
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: CourseFilters) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (slug: string) => [...courseKeys.details(), slug] as const,
  reviews: (id: string) => [...courseKeys.all, 'reviews', id] as const,
}
