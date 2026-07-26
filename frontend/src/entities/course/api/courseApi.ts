import { get } from '@/shared/api/http'
import { courseSchema, coursePageSchema, reviewSchema } from '../model/course.schema'
import type { Course, CoursePage } from '../model/course.schema'
import { z } from 'zod'

export interface CourseFilters {
  department?: string
  level?: string
  q?: string
  page?: number
  size?: number
}

const reviewPageSchema = z.object({
  content: z.array(reviewSchema).default([]),
  totalElements: z.number().nullish().transform((v) => v ?? 0),
})

export const courseApi = {
  /** Liste paginée des cours publiés, filtrée. Valide la réponse à la frontière. */
  list: (filters: CourseFilters = {}): Promise<CoursePage> =>
    get('/courses', { params: filters }, coursePageSchema),

  getBySlug: (slug: string): Promise<Course> =>
    get(`/courses/slug/${encodeURIComponent(slug)}`, undefined, courseSchema),

  getById: (id: string): Promise<Course> =>
    get(`/courses/${id}`, undefined, courseSchema),

  getReviews: (id: string, page = 0, size = 20) =>
    get(`/courses/${id}/reviews`, { params: { page, size } }, reviewPageSchema),
}
