import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentApi } from '../api/enrollmentApi'

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  mine: () => [...enrollmentKeys.all, 'mine'] as const,
  check: (courseId: string) => [...enrollmentKeys.all, 'check', courseId] as const,
  certificates: () => ['certificates', 'mine'] as const,
}

export function useMyEnrollments() {
  return useQuery({ queryKey: enrollmentKeys.mine(), queryFn: enrollmentApi.getMine, staleTime: 30_000 })
}

export function useEnrollmentCheck(courseId: string | undefined) {
  return useQuery({
    queryKey: enrollmentKeys.check(courseId ?? ''),
    queryFn: () => enrollmentApi.check(courseId as string),
    enabled: Boolean(courseId),
  })
}

export function useMyCertificates() {
  return useQuery({ queryKey: enrollmentKeys.certificates(), queryFn: enrollmentApi.getCertificates, staleTime: 60_000 })
}

/** Met à jour la progression et invalide les inscriptions. */
export function useUpdateProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => enrollmentApi.updateProgress(id, progress),
    onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.mine() }),
  })
}
