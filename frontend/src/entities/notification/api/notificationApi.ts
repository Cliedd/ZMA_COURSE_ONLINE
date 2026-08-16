import { z } from 'zod'
import { get, patch } from '@/shared/api/http'
import { notificationSchema, unreadCountSchema } from '../model/notification.schema'
import type { Notification } from '../model/notification.schema'

export const notificationApi = {
  getAll: (): Promise<Notification[]> =>
    get('/notifications', undefined, z.array(notificationSchema)),

  getUnreadCount: (): Promise<number> =>
    get('/notifications/unread-count', undefined, unreadCountSchema).then((r) => r.count),

  markAsRead: (id: string): Promise<Notification> =>
    patch(`/notifications/${id}/read`, undefined, notificationSchema),

  markAllAsRead: (): Promise<void> =>
    patch('/notifications/read-all'),
}
