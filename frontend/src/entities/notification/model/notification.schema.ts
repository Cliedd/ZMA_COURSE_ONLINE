import { z } from 'zod'

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
})
export type Notification = z.infer<typeof notificationSchema>

export const unreadCountSchema = z.object({ count: z.number() })
