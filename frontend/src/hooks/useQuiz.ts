import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, del } from '@/shared/api/http'
import type { Quiz, QuizAttempt, QuizStats, QuizRequest, SubmitAttemptPayload } from '../types/quiz'

export function useQuizByLesson(lessonId?: string) {
  return useQuery<Quiz | null>({
    queryKey: ['quiz', 'lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null
      try {
        const result = await get<Quiz | null>(`/quizzes/lesson/${lessonId}`)
        return result ?? null
      } catch (err: unknown) {
        // 404 means no quiz exists for this lesson — treat as null, not an error
        if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
          return null
        }
        throw err
      }
    },
    enabled: !!lessonId,
  })
}

export function useCreateOrUpdateQuiz(lessonId: string) {
  const qc = useQueryClient()
  return useMutation<Quiz, Error, QuizRequest>({
    mutationFn: (data) => post<Quiz>(`/quizzes/lesson/${lessonId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quiz', 'lesson', lessonId] })
    },
  })
}

export function useDeleteQuiz() {
  const qc = useQueryClient()
  return useMutation<void, Error, { quizId: string; lessonId: string }>({
    mutationFn: ({ quizId }) => del(`/quizzes/${quizId}`),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['quiz', 'lesson', lessonId] })
    },
  })
}

export function useMyQuizAttempts(quizId?: string) {
  return useQuery<QuizAttempt[]>({
    queryKey: ['quiz', 'attempts', quizId],
    queryFn: () => get<QuizAttempt[]>(`/quizzes/${quizId}/attempts/me`),
    enabled: !!quizId,
  })
}

export function useSubmitQuizAttempt(quizId?: string) {
  const qc = useQueryClient()
  return useMutation<QuizAttempt, Error, SubmitAttemptPayload>({
    mutationFn: (data) => post<QuizAttempt>(`/quizzes/${quizId}/attempts`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quiz', 'attempts', quizId] })
    },
  })
}

export function useQuizStats(quizId?: string) {
  return useQuery<QuizStats>({
    queryKey: ['quiz', 'stats', quizId],
    queryFn: () => get<QuizStats>(`/quizzes/${quizId}/stats`),
    enabled: !!quizId,
  })
}
