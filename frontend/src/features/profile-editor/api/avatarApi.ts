import axios from 'axios'
import { z } from 'zod'
import { post, patch } from '@/shared/api/http'
import { userApi } from '@/entities/user'

const presignSchema = z.object({
  mediaId: z.string(),
  uploadUrl: z.string(),
})

const API_PREFIX = '/api/v1'

/**
 * Upload un avatar via le flux presign de zma-media :
 * 1) POST /media/presign avec purpose="AVATAR"
 * 2) PUT file bytes vers uploadUrl (S3 presigned URL)
 * 3) PATCH /media/{id}/confirm
 * 4) POST /users/me/avatar avec { mediaId }
 * Retourne la nouvelle avatarUrl.
 */
export async function uploadAvatar(file: File): Promise<string> {
  const contentType = file.type || 'image/jpeg'

  const presigned = await post(
    '/media/presign',
    { fileName: file.name, contentType, sizeBytes: file.size, purpose: 'AVATAR' },
    presignSchema,
  )

  if (/^https?:\/\//i.test(presigned.uploadUrl)) {
    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': contentType },
    })
    await patch(`/media/${presigned.mediaId}/confirm`)
  } else {
    const relativeUrl = presigned.uploadUrl.startsWith(API_PREFIX)
      ? presigned.uploadUrl.slice(API_PREFIX.length)
      : presigned.uploadUrl
    const formData = new FormData()
    formData.append('file', file)
    await post(relativeUrl, formData)
  }

  const result = await userApi.updateAvatar(presigned.mediaId)
  return result.avatarUrl
}
