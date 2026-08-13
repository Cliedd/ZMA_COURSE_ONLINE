import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementApi } from '../api/announcementApi'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const announcementKeys = {
  room: (courseId: string) => ['announcement-room', courseId] as const,
  messages: (roomId: string) => ['announcements', roomId] as const,
}

// ─── Room resolution ──────────────────────────────────────────────────────────

export function useCourseRoom(courseId: string | undefined) {
  return useQuery({
    queryKey: announcementKeys.room(courseId ?? ''),
    queryFn: () => announcementApi.getRoom(courseId as string),
    enabled: Boolean(courseId),
    retry: false,
    staleTime: 60_000,
  })
}

// ─── Message list ──────────────────────────────────────────────────────────────

export function useCourseAnnouncements(roomId: string | undefined) {
  return useQuery({
    queryKey: announcementKeys.messages(roomId ?? ''),
    queryFn: () => announcementApi.getMessages(roomId as string),
    enabled: Boolean(roomId),
    staleTime: 30_000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useEnsureRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, courseName }: { courseId: string; courseName: string }) =>
      announcementApi.ensureRoom(courseId, courseName),
    onSuccess: (room) => {
      qc.setQueryData(announcementKeys.room(room.courseId), room)
    },
  })
}

export function usePostAnnouncement(roomId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => {
      if (!roomId) return Promise.reject(new Error('No room'))
      return announcementApi.postMessage(roomId, content)
    },
    onSuccess: () => {
      if (roomId) void qc.invalidateQueries({ queryKey: announcementKeys.messages(roomId) })
    },
  })
}

export function useDeleteAnnouncement(roomId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => {
      if (!roomId) return Promise.reject(new Error('No room'))
      return announcementApi.deleteMessage(roomId, messageId)
    },
    onSuccess: () => {
      if (roomId) void qc.invalidateQueries({ queryKey: announcementKeys.messages(roomId) })
    },
  })
}
