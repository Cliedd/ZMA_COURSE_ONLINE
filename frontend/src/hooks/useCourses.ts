import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../services/api';
import type { CourseRequest } from '../types';

export function useCourses(params?: { department?: string; level?: string }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseApi.getAll(params),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
  });
}

export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: ['courses', 'slug', slug],
    queryFn: () => courseApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useTeacherCourses(email: string) {
  return useQuery({
    queryKey: ['courses', 'teacher', email],
    queryFn: () => courseApi.getByTeacher(email),
    enabled: !!email,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseRequest) => courseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseRequest }) =>
      courseApi.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
