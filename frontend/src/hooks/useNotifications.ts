import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
  const isLoggedIn = useAuthStore(s => !!s.token);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
    enabled: isLoggedIn,
    refetchInterval: 30_000,
  });

  const unreadCount = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: isLoggedIn,
    refetchInterval: 30_000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    unreadCount: unreadCount.data ?? 0,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
