import { get, post, put, patch, del } from '@/shared/api/http'
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

/** Payload d'écriture — reflète CourseRequest côté backend (zma-catalog). */
export interface CourseWriteRequest {
  title: string
  slug?: string
  description?: string
  shortDescription?: string
  price: number
  level?: string
  department?: string
  filiere?: string
  ects?: number
  teacherName?: string
  studentsCount?: number
  rating?: number
  durationHours?: number
  gradientIndex?: number
  skillsJson?: string
  curriculumJson?: string
  debouches?: string
  thumbnailUrl?: string
}

const reviewPageSchema = z.object({
  content: z.array(reviewSchema).default([]),
  totalElements: z.number().nullish().transform((v) => v ?? 0),
})

export const courseApi = {
  /** Liste paginée des cours publiés, filtrée. Valide la réponse à la frontière. */
  list: (filters: CourseFilters = {}): Promise<CoursePage> =>
    get('/courses', { params: filters }, coursePageSchema),

  /** Liste paginée de TOUS les cours (publiés et non publiés), réservée à l'admin. */
  listAllAdmin: (page = 0, size = 50): Promise<CoursePage> =>
    get('/courses/admin/all', { params: { page, size } }, coursePageSchema),

  getBySlug: (slug: string): Promise<Course> =>
    get(`/courses/slug/${encodeURIComponent(slug)}`, undefined, courseSchema),

  getById: (id: string): Promise<Course> =>
    get(`/courses/${id}`, undefined, courseSchema),

  getReviews: (id: string, page = 0, size = 20) =>
    get(`/courses/${id}/reviews`, { params: { page, size } }, reviewPageSchema),

  /** Cours d'un enseignant (par email), y compris non publiés. */
  getByTeacher: (email: string): Promise<Course[]> =>
    get(`/courses/teacher/${encodeURIComponent(email)}`, undefined, z.array(courseSchema)),

  create: (data: CourseWriteRequest): Promise<Course> =>
    post('/courses', data, courseSchema),

  update: (id: string, data: CourseWriteRequest): Promise<Course> =>
    put(`/courses/${id}`, data, courseSchema),

  publish: (id: string, published: boolean): Promise<Course> =>
    patch(`/courses/${id}/publish`, undefined, courseSchema, { params: { published } }),

  remove: (id: string): Promise<void> => del(`/courses/${id}`),
}
