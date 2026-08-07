import axios from 'axios'
import { z } from 'zod'
import { post, patch, AppError } from '@/shared/api/http'

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

/** Extensions vidéo courantes acceptées. */
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp', 'flv', 'ogv', 'ts']

/** Types MIME vidéo explicites acceptés. */
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/avi',
  'video/x-msvideo',
  'video/mkv',
  'video/3gpp',
  'video/ogg',
  'video/x-flv',
  'video/mp2t',
  'video/x-m4v',
]

export function isVideoFile(file: File): boolean {
  if (file.type && (file.type.startsWith('video/') || ALLOWED_VIDEO_TYPES.includes(file.type.split(';')[0]!.trim().toLowerCase()))) {
    return true
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_VIDEO_EXTENSIONS.includes(ext)
}

export function inferVideoContentType(file: File): string {
  const mime = file.type ? file.type.split(';')[0]!.trim().toLowerCase() : ''
  if (mime && mime !== 'application/octet-stream') {
    return mime
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  switch (ext) {
    case 'webm': return 'video/webm'
    case 'mov': return 'video/quicktime'
    case 'mkv': return 'video/x-matroska'
    case 'avi': return 'video/x-msvideo'
    default: return 'video/mp4'
  }
}

/** MediaService.MAX_SIZE_BYTES (2 Go) */
export const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024

const API_PREFIX = '/api/v1'

export interface UploadLessonVideoOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

/**
 * Coarse category for an upload failure, used by the UI to pick a specific
 * i18n message instead of always saying "check your connection" — that
 * fallback used to catch everything (CORS rejections, 5xx, permission
 * errors, an aborted upload) and mislabel it as a connectivity problem,
 * which made real failures (e.g. the storage bucket missing a CORS policy
 * for browser-origin uploads) look like a user network issue.
 */
export type UploadErrorKind = 'format' | 'size' | 'auth' | 'server' | 'network' | 'client'

export class UploadError extends Error {
  constructor(readonly kind: UploadErrorKind, message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'UploadError'
  }
}

function classifyAppError(err: AppError): UploadErrorKind {
  if (err.status === 0) return 'network'
  if (err.status === 401 || err.status === 403) return 'auth'
  if (err.status >= 500) return 'server'
  return 'client'
}

/**
 * Direct-to-bucket PUT bypasses shared/api/http.ts entirely (it's a raw
 * axios.put to an absolute presigned URL, not our API), so its errors never
 * go through toAppError. A request that never reaches the server at all —
 * no HTTP response, axios code ERR_NETWORK — is what a browser reports both
 * for a real connectivity loss AND for a CORS preflight rejection (the
 * browser deliberately hides the real reason from JS for security). We
 * cannot tell those apart client-side; console.error keeps the raw detail
 * available for debugging even though the user-facing message stays generic
 * for that case.
 */
function classifyPutError(err: unknown): UploadErrorKind {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    if (status === 401 || status === 403) return 'auth'
    if (status !== undefined && status >= 500) return 'server'
    if (status !== undefined) return 'client'
    return 'network'
  }
  return 'network'
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
  const contentType = inferVideoContentType(file)

  let presigned: z.infer<typeof presignSchema>
  try {
    presigned = await post(
      '/media/presign',
      { fileName: file.name, contentType, sizeBytes: file.size, purpose: 'LESSON_VIDEO' },
      presignSchema,
    )
  } catch (err) {
    const kind = err instanceof AppError ? classifyAppError(err) : 'network'
    console.error('[uploadLessonVideo] presign failed', err)
    throw new UploadError(kind, err instanceof Error ? err.message : 'presign failed', err)
  }

  const reportProgress = (loaded: number, total?: number) => {
    if (!onProgress) return
    const denom = total ?? file.size
    if (!denom) return
    onProgress(Math.min(100, Math.round((loaded / denom) * 100)))
  }

  if (/^https?:\/\//i.test(presigned.uploadUrl)) {
    try {
      await axios.put(presigned.uploadUrl, file, {
        headers: { 'Content-Type': contentType },
        signal,
        onUploadProgress: (e) => reportProgress(e.loaded, e.total),
      })
    } catch (err) {
      // Log the raw axios error (status, code, message) — this is the detail
      // that used to be discarded entirely and reported to the user as a
      // generic network error regardless of the actual cause (e.g. a bucket
      // CORS rejection, a 403 from an expired presigned URL, a 5xx).
      console.error('[uploadLessonVideo] PUT to storage failed', err)
      throw new UploadError(classifyPutError(err), err instanceof Error ? err.message : 'upload failed', err)
    }

    try {
      return await patch(`/media/${presigned.mediaId}/confirm`, undefined, uploadedMediaSchema)
    } catch (err) {
      const kind = err instanceof AppError ? classifyAppError(err) : 'network'
      console.error('[uploadLessonVideo] confirm failed', err)
      throw new UploadError(kind, err instanceof Error ? err.message : 'confirm failed', err)
    }
  }

  const relativeUrl = presigned.uploadUrl.startsWith(API_PREFIX)
    ? presigned.uploadUrl.slice(API_PREFIX.length)
    : presigned.uploadUrl

  const formData = new FormData()
  formData.append('file', file)

  try {
    return await post(relativeUrl, formData, uploadedMediaSchema, {
      signal,
      onUploadProgress: (e) => reportProgress(e.loaded, e.total),
    })
  } catch (err) {
    const kind = err instanceof AppError ? classifyAppError(err) : 'network'
    console.error('[uploadLessonVideo] direct upload failed', err)
    throw new UploadError(kind, err instanceof Error ? err.message : 'upload failed', err)
  }
}
