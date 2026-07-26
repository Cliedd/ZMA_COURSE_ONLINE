import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseApi } from '../api/courseApi'
import type { CourseFilters, CourseWriteRequest } from '../api/courseApi'
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

/** Liste paginée de TOUS les cours (publiés et non publiés), réservée à l'admin. */
export function useAdminCourses(page = 0) {
  return useQuery({
    queryKey: [...courseKeys.all, 'admin-all', page],
    queryFn: () => courseApi.listAllAdmin(page),
    staleTime: 30_000,
  })
}

/** Cours d'un enseignant (par email), y compris non publiés. */
export function useTeacherCourses(email: string | undefined) {
  return useQuery({
    queryKey: [...courseKeys.all, 'byTeacher', email ?? ''],
    queryFn: () => courseApi.getByTeacher(email as string),
    enabled: Boolean(email),
    staleTime: 30_000,
  })
}

function invalidateCourseCaches(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: courseKeys.all })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CourseWriteRequest) => courseApi.create(data),
    onSuccess: () => invalidateCourseCaches(qc),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseWriteRequest }) => courseApi.update(id, data),
    onSuccess: () => invalidateCourseCaches(qc),
  })
}

export function usePublishCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => courseApi.publish(id, published),
    onSuccess: () => invalidateCourseCaches(qc),
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => courseApi.remove(id),
    onSuccess: () => invalidateCourseCaches(qc),
  })
}
