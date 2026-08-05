import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, Video, X } from 'lucide-react'
import { Badge, Button, ProgressBar, toast } from '@/shared/ui'
import { AppError } from '@/shared/api/http'
import type { CurriculumLesson } from '@/entities/course'
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES, isVideoFile, uploadLessonVideo } from '../api/mediaApi'

interface LessonMediaUploadProps {
  lesson: CurriculumLesson
  onChange: (lesson: CurriculumLesson) => void
}

/** Attache/remplace/retire la vidéo d'une leçon via le flux presign de zma-media. */
export function LessonMediaUpload({ lesson, onChange }: LessonMediaUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)

    if (!isVideoFile(file)) {
      const msg = t('courseEditor.media.errorFormat')
      setError(msg)
      toast.error(msg)
      return
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      const msg = t('courseEditor.media.errorSize')
      setError(msg)
      toast.error(msg)
      return
    }

    setUploading(true)
    setProgress(0)
    try {
      const media = await uploadLessonVideo(file, { onProgress: setProgress })
      onChange({ ...lesson, mediaId: media.id })
      toast.success(t('courseEditor.media.uploadSuccess'))
    } catch (err) {
      const serverMsg = err instanceof AppError ? err.message : null
      const msg = serverMsg && serverMsg !== 'Une erreur est survenue.'
        ? serverMsg
        : t('courseEditor.media.errorNetwork')
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeVideo = () => {
    onChange({ ...lesson, mediaId: null })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_VIDEO_TYPES.join(',')}
        className="hidden"
        aria-label={t('courseEditor.media.attach')}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {lesson.mediaId && !uploading && (
        <Badge tone="success" className="gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t('courseEditor.media.attached')}
        </Badge>
      )}

      {uploading ? (
        <div className="flex min-w-[140px] items-center gap-2">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-muted" aria-hidden />
          <ProgressBar value={progress} className="w-24" />
          <span className="font-sans text-xs text-ink-muted">{progress}%</span>
        </div>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
          <Video className="h-3.5 w-3.5" aria-hidden />
          {lesson.mediaId ? t('courseEditor.media.replace') : t('courseEditor.media.attach')}
        </Button>
      )}

      {lesson.mediaId && !uploading && (
        <button
          type="button"
          onClick={removeVideo}
          aria-label={t('courseEditor.media.remove')}
          className="inline-flex min-h-touch items-center px-1 font-sans text-xs text-danger"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}

      {error && (
        <span role="alert" className="font-sans text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  )
}
