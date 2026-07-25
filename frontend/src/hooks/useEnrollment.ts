import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../services/api';
import { useAuthStore } from '@/entities/session';
import type { EnrollRequest } from '../types';

export function useMyEnrollments() {
  const isLoggedIn = useAuthStore(s => !!s.token);

  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: () => enrollmentApi.getMine(),
    enabled: isLoggedIn,
  });
}

export function useIsEnrolled(courseId: string) {
  const isLoggedIn = useAuthStore(s => !!s.token);

  return useQuery({
    queryKey: ['enrollment-check', courseId],
    queryFn: () => enrollmentApi.checkEnrollment(courseId),
    enabled: isLoggedIn && !!courseId,
  });
}

export function useEnrollmentsByCourse(courseId: string) {
  return useQuery({
    queryKey: ['enrollments-course', courseId],
    queryFn: () => enrollmentApi.getByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnrollRequest) => enrollmentApi.enroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-check'] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, progress }: { enrollmentId: string; progress: number }) =>
      enrollmentApi.updateProgress(enrollmentId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export function useMyCertificates() {
  const isLoggedIn = useAuthStore(s => !!s.token);

  return useQuery({
    queryKey: ['certificates', 'me'],
    queryFn: () => enrollmentApi.getCertificates(),
    enabled: isLoggedIn,
  });
}
