import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/session'
import { notificationApi } from '../api/notificationApi'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
}

export function useNotifications() {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: notificationApi.getAll,
    enabled: isLoggedIn,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useUnreadCount() {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: notificationApi.getUnreadCount,
    enabled: isLoggedIn,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
