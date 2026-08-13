/**
 * Announcement API — wraps the zma-community chat endpoints.
 *
 * A "course announcement" is modelled as a ChatMessage in the per-course
 * ChatRoom.  The workflow is:
 *   1. POST /community/rooms          → create or retrieve the room (idempotent)
 *   2. GET  /community/rooms/course/{courseId}  → resolve roomId from courseId
 *   3. GET  /community/rooms/{roomId}/messages  → list messages (newest-first on page 0)
 *   4. POST /community/rooms/{roomId}/messages  → teacher posts a new announcement
 *   5. DELETE /community/rooms/{roomId}/messages/{messageId} → teacher deletes
 */
import { get, post, del } from '@/shared/api/http'
import { z } from 'zod'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const chatRoomSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseName: z.string(),
  createdByEmail: z.string(),
  createdAt: z.string(),
})

export const announcementSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderEmail: z.string(),
  senderName: z.string(),
  content: z.string().nullable().optional(),
  sentAt: z.string(),
  editedAt: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  parentMessageId: z.string().nullable().optional(),
  attachmentMediaId: z.string().nullable().optional(),
  attachmentType: z.string().nullable().optional(),
})

export type ChatRoom = z.infer<typeof chatRoomSchema>
export type Announcement = z.infer<typeof announcementSchema>

// Page<ChatMessage> shape from Spring Data
const announcementPageSchema = z.object({
  content: z.array(announcementSchema),
  totalElements: z.number().optional(),
})

// ─── API functions ─────────────────────────────────────────────────────────────

export const announcementApi = {
  /** Create or retrieve the chat room for a course. */
  ensureRoom: (courseId: string, courseName: string): Promise<ChatRoom> =>
    post<ChatRoom>('/community/rooms', { courseId, courseName }),

  /** Resolve the chat room for a course (returns null if no room yet). */
  getRoom: (courseId: string): Promise<ChatRoom> =>
    get<ChatRoom>(`/community/rooms/course/${encodeURIComponent(courseId)}`),

  /** Fetch the latest announcements for a room (page 0, 50 messages). */
  getMessages: async (roomId: string): Promise<Announcement[]> => {
    const raw = await get<unknown>(`/community/rooms/${encodeURIComponent(roomId)}/messages?page=0&size=50`)
    // Backend returns Spring Page<ChatMessage> — extract content
    const parsed = announcementPageSchema.safeParse(raw)
    if (parsed.success) return parsed.data.content
    // Fallback: raw array
    if (Array.isArray(raw)) return raw as Announcement[]
    return []
  },

  /** Teacher posts a new announcement. */
  postMessage: (roomId: string, content: string): Promise<Announcement> =>
    post<Announcement>(`/community/rooms/${encodeURIComponent(roomId)}/messages`, { content }),

  /** Teacher (or admin) deletes an announcement. */
  deleteMessage: (roomId: string, messageId: string): Promise<void> =>
    del<void>(`/community/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(messageId)}`),
}
