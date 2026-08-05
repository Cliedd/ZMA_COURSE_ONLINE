import axios from 'axios'
import { z } from 'zod'
import { post, patch } from '@/shared/api/http'

/** Miroir de zma-media : MediaService.PresignUrlWithId */
const presignSchema = z.object({
  mediaId: z.string(),
  uploadUrl: z.string(),
  s3Key: z.string(),
  expiresInSeconds: z.number(),
})

/** Miroir de zma-media : Media (sous-ensemble utile côté client) */
const uploadedMediaSchema = z.object({
  id: z.string(),
  fileName: z.string().nullish(),
  size: z.number().nullish(),
  contentType: z.string().nullish(),
  status: z.string().nullish(),
})

export type UploadedMedia = z.infer<typeof uploadedMediaSchema>

/** Types vidéo acceptés par zma-media (MediaService.ALLOWED_TYPES, sous-ensemble vidéo). */
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

/** MediaService.MAX_SIZE_BYTES (2 Go) */
export const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024

const API_PREFIX = '/api/v1'

export interface UploadLessonVideoOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

/**
 * Upload une vidéo de leçon via le flux presign de zma-media :
 * 1) POST /media/presign → { mediaId, uploadUrl, s3Key }
 * 2a) En prod (R2) : uploadUrl est une URL S3 signée absolue → PUT direct des octets,
 *     puis PATCH /media/{id}/confirm.
 * 2b) En dev local : uploadUrl pointe vers notre propre contrôleur
 *     (/api/v1/media/{id}/upload-direct) qui confirme lui-même l'upload.
 */
export async function uploadLessonVideo(
  file: File,
  { onProgress, signal }: UploadLessonVideoOptions = {},
): Promise<UploadedMedia> {
  const presigned = await post(
    '/media/presign',
    { fileName: file.name, contentType: file.type, sizeBytes: file.size, purpose: 'LESSON_VIDEO' },
    presignSchema,
  )

  const reportProgress = (loaded: number, total?: number) => {
    if (!onProgress) return
    const denom = total ?? file.size
    if (!denom) return
    onProgress(Math.min(100, Math.round((loaded / denom) * 100)))
  }

  if (/^https?:\/\//i.test(presigned.uploadUrl)) {
    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      signal,
      onUploadProgress: (e) => reportProgress(e.loaded, e.total),
    })
    return patch(`/media/${presigned.mediaId}/confirm`, undefined, uploadedMediaSchema)
  }

  const relativeUrl = presigned.uploadUrl.startsWith(API_PREFIX)
    ? presigned.uploadUrl.slice(API_PREFIX.length)
    : presigned.uploadUrl

  const formData = new FormData()
  formData.append('file', file)

  return post(relativeUrl, formData, uploadedMediaSchema, {
    signal,
    onUploadProgress: (e) => reportProgress(e.loaded, e.total),
  })
}
