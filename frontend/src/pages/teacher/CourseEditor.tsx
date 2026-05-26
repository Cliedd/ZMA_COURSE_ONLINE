import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCourse } from '../../hooks/useCourses'
import { courseApi, mediaApi } from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'
import type { CurriculumSection } from '../../types'
import {
  ChevronLeft, Save, Plus, Trash2, GripVertical, Upload,
  CheckCircle2, Loader2, Eye, BookOpen, Layout, Video,
  AlertCircle, Play, X, Globe, Lock, Target, Settings,
  Image as ImageIcon, Film, CheckCheck, RefreshCw,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { cn } from '../../lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVELS = ['Licence', 'Master', 'Doctorat', 'Certificat', 'Atelier'] as const

const DEPTS = [
  'Interprétation et Pratique Instrumentale',
  'Composition, Écriture et Théorie Musicale',
  'Technologies Musicales et Production Audiovisuelle',
  'Pédagogie Musicale et Formation des Formateurs',
  'Musicologie, Patrimoine et Management Culturel',
]

const GRADIENTS = [
  { label: 'Bleu royal',    from: 'from-blue-700',    to: 'to-blue-900' },
  { label: 'Ambre-Orange',  from: 'from-amber-600',   to: 'to-orange-800' },
  { label: 'Émeraude',      from: 'from-emerald-600', to: 'to-teal-800' },
  { label: 'Violet',        from: 'from-purple-600',  to: 'to-violet-900' },
  { label: 'Rose',          from: 'from-rose-600',    to: 'to-pink-800' },
  { label: 'Cyan',          from: 'from-cyan-600',    to: 'to-sky-800' },
  { label: 'Indigo',        from: 'from-indigo-600',  to: 'to-blue-900' },
  { label: 'Jaune',         from: 'from-yellow-500',  to: 'to-amber-700' },
  { label: 'Vert',          from: 'from-green-600',   to: 'to-emerald-800' },
  { label: 'Rouge',         from: 'from-red-600',     to: 'to-rose-800' },
] as const

type Section = 'objectives' | 'curriculum' | 'presentation' | 'videos' | 'settings'

interface SidebarItem {
  id: Section
  label: string
  icon: React.ReactNode
}

// ─── BulletEditor ─────────────────────────────────────────────────────────────

function BulletEditor({
  items,
  onChange,
  placeholder = 'Ajouter un élément…',
  minItems = 0,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  minItems?: number
}) {
  const addItem = () => onChange([...items, ''])
  const removeItem = (i: number) => {
    if (items.length <= minItems) return
    onChange(items.filter((_, idx) => idx !== i))
  }
  const updateItem = (i: number, val: string) =>
    onChange(items.map((item, idx) => (idx === i ? val : item)))

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0 text-sm">✓</span>
          <Input
            value={item}
            onChange={e => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-9 text-sm"
          />
          <button
            onClick={() => removeItem(i)}
            disabled={items.length <= minItems}
            className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-primary hover:underline mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Ajouter
      </button>
    </div>
  )
}

// ─── ImageUploader ─────────────────────────────────────────────────────────────

function ImageUploader({
  onUploaded,
  currentUrl,
}: {
  onUploaded: (url: string) => void
  currentUrl?: string
}) {
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setState('uploading')
    setProgress(0)
    try {
      const presign = await mediaApi.requestUpload(file.name, file.type, file.size)
      const token = useAuthStore.getState().token

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        if (presign.uploadUrl.includes('/upload-direct')) {
          xhr.open('POST', presign.uploadUrl)
          if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token)
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          const fd = new FormData()
          fd.append('file', file)
          xhr.send(fd)
        } else {
          xhr.open('PUT', presign.uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          xhr.send(file)
        }
      })

      setProgress(100)

      let downloadUrl: string
      if (presign.uploadUrl.includes('/upload-direct')) {
        downloadUrl = `/api/v1/media/${presign.mediaId}/file`
      } else {
        await mediaApi.confirmUpload(presign.mediaId)
        downloadUrl = await mediaApi.getDownloadUrl(presign.mediaId)
      }
      setState('done')
      onUploaded(downloadUrl)
    } catch {
      setState('error')
      setPreviewUrl(currentUrl)
    }
  }, [currentUrl, onUploaded])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border h-48 bg-muted/30">
          <img src={previewUrl} alt="Vignette" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white transition-colors"
            >
              <ImageIcon className="h-4 w-4" /> Changer la vignette
            </button>
          </div>
          {state === 'uploading' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors',
            isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          {state === 'uploading' ? (
            <div className="space-y-2 text-center px-8 w-full">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Glissez une image ici</p>
              <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP — max 5 Mo</p>
            </>
          )}
        </div>
      )}

      {state === 'done' && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Vignette uploadée avec succès
        </div>
      )}
      {state === 'error' && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> Erreur lors de l'upload
          <button onClick={() => setState('idle')} className="ml-1 underline">Réessayer</button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}

// ─── VideoUploader (présentation) ─────────────────────────────────────────────

function VideoUploader({
  courseId,
  onUploaded,
}: {
  courseId: string
  onUploaded: (mediaId: string) => void
}) {
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setFileName(file.name)
    setState('uploading')
    setProgress(0)
    try {
      const presign = await mediaApi.requestUpload(file.name, file.type, file.size)
      const token = useAuthStore.getState().token

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        if (presign.uploadUrl.includes('/upload-direct')) {
          xhr.open('POST', presign.uploadUrl)
          if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token)
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          const fd = new FormData()
          fd.append('file', file)
          xhr.send(fd)
        } else {
          xhr.open('PUT', presign.uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          xhr.send(file)
        }
      })
      setProgress(100)
      if (!presign.uploadUrl.includes('/upload-direct')) {
        await mediaApi.confirmUpload(presign.mediaId)
      }
      await mediaApi.attach(presign.mediaId, courseId)
      setState('done')
      onUploaded(presign.mediaId)
    } catch {
      setState('error')
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {state === 'idle' && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all w-full justify-center"
        >
          <Film className="h-4 w-4" /> Uploader une vidéo de présentation (MP4)
        </button>
      )}
      {state === 'uploading' && (
        <div className="space-y-2 px-4 py-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{progress}%</span>
          </div>
        </div>
      )}
      {state === 'done' && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCheck className="h-4 w-4" />
          <span>Vidéo de présentation uploadée</span>
          <button
            onClick={() => { setState('idle'); setFileName('') }}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {state === 'error' && (
        <div className="flex items-center gap-2 text-sm text-destructive px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <span>Erreur lors de l'upload</span>
          <button onClick={() => setState('idle')} className="ml-auto underline text-xs">Réessayer</button>
        </div>
      )}
    </div>
  )
}

// ─── LessonVideoUploader ──────────────────────────────────────────────────────

function LessonVideoUploader({ courseId, lessonId, onVideoUploaded, hasVideo }: {
  courseId: string; lessonId: string; onVideoUploaded?: (mediaId: string) => void; hasVideo?: boolean
}) {
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Show as "done" immediately if lesson already has a video
  const initialDone = hasVideo && state === 'idle'

  const handleFile = async (file: File) => {
    if (!file) return
    setFileName(file.name)
    setState('uploading')
    setProgress(0)
    try {
      const presign = await mediaApi.requestUpload(file.name, file.type, file.size)
      const isDirectUpload = presign.uploadUrl.includes('/upload-direct')

      if (isDirectUpload) {
        const token = useAuthStore.getState().token
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', presign.uploadUrl)
          if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token)
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          const fd = new FormData()
          fd.append('file', file)
          xhr.send(fd)
        })
        setProgress(100)
        await mediaApi.attach(presign.mediaId, courseId, lessonId)
      } else {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', presign.uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.upload.onprogress = e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          xhr.send(file)
        })
        setProgress(100)
        await mediaApi.confirmUpload(presign.mediaId)
        await mediaApi.attach(presign.mediaId, courseId, lessonId)
      }
      setState('done')
      // Notify parent so mediaId gets stored in curriculum JSON
      onVideoUploaded?.(presign.mediaId)
    } catch {
      setState('error')
    }
  }

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {state === 'idle' && !initialDone && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <Upload className="h-3.5 w-3.5" /> Uploader une vidéo
        </button>
      )}
      {state === 'idle' && initialDone && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Vidéo liée ✓
          <button onClick={() => inputRef.current?.click()} className="ml-1 text-muted-foreground hover:text-foreground underline">
            Remplacer
          </button>
        </div>
      )}
      {state === 'uploading' && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{progress}%</span>
          </div>
        </div>
      )}
      {state === 'done' && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Vidéo uploadée ✓
          <button onClick={() => inputRef.current?.click()} className="ml-1 text-muted-foreground hover:text-foreground underline">
            Remplacer
          </button>
        </div>
      )}
      {state === 'error' && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> Erreur d'upload
          <button onClick={() => setState('idle')} className="ml-1 underline">Réessayer</button>
        </div>
      )}
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const isError = message.startsWith('Erreur')
  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border max-w-sm',
      isError
        ? 'bg-destructive/10 text-destructive border-destructive/20'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    )}>
      {isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── CoursePreviewCard ────────────────────────────────────────────────────────

function CoursePreviewCard({
  title,
  level,
  price,
  gradientIndex,
}: {
  title: string
  level: string
  price: number | ''
  gradientIndex: number
}) {
  const g = GRADIENTS[gradientIndex] ?? GRADIENTS[0]
  return (
    <div className="w-56 rounded-xl overflow-hidden border border-border shadow-sm">
      <div className={cn('h-28 bg-gradient-to-br flex items-end p-3', g.from, g.to)}>
        <span className="text-white text-xs font-semibold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm">
          {level || 'Niveau'}
        </span>
      </div>
      <div className="p-3 bg-white">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-2">
          {title || 'Titre du cours'}
        </p>
        <p className="text-base font-bold text-primary">
          {price !== '' ? `${price} €` : 'Gratuit'}
        </p>
      </div>
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export const CourseEditor = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()
  const { data: course, isLoading } = useCourse(courseId ?? '')

  // ── Active sidebar section ──
  const [activeSection, setActiveSection] = useState<Section>('objectives')

  // ── Toast ──
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  // ── Saving state ──
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // ── Objectives section state ──
  const [objectives, setObjectives] = useState<string[]>(['', '', '', ''])
  const [targetAudience, setTargetAudience] = useState('')
  const [requirements, setRequirements] = useState<string[]>([''])

  // ── Curriculum state ──
  const [sections, setSections] = useState<CurriculumSection[]>([])

  // ── Presentation state ──
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [previewVideoMediaId, setPreviewVideoMediaId] = useState('')
  const [department, setDept] = useState('')
  const [filiere, setFiliere] = useState('')
  const [level, setLevel] = useState('')
  const [ects, setEcts] = useState<number | ''>('')
  const [durationHours, setDuration] = useState<number | ''>('')

  // ── Settings state ──
  const [gradientIndex, setGradientIndex] = useState(0)
  const [price, setPrice] = useState<number | ''>('')

  // ── Load course data ──
  useEffect(() => {
    if (!course) return
    setTitle(course.title ?? '')
    setDesc(course.description ?? '')
    setShortDesc(course.shortDescription ?? '')
    setPrice(course.price ?? '')
    setLevel(course.level ?? '')
    setDept(course.department ?? '')
    setFiliere(course.filiere ?? '')
    setEcts(course.ects ?? '')
    setDuration(course.durationHours ?? '')
    setGradientIndex(course.gradientIndex ?? 0)

    // Parse skillsJson → objectives
    try {
      const parsed = JSON.parse(course.skillsJson ?? '[]')
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure at least 4 items
        const padded = [...parsed]
        while (padded.length < 4) padded.push('')
        setObjectives(padded)
      }
    } catch {
      setObjectives(['', '', '', ''])
    }

    // Parse debouches → audience + requirements (retro-compat)
    try {
      const parsed = JSON.parse(course.debouches ?? '{}')
      if (typeof parsed === 'object' && parsed !== null) {
        setTargetAudience(parsed.audience ?? '')
        setRequirements(Array.isArray(parsed.requirements) && parsed.requirements.length > 0
          ? parsed.requirements
          : [''])
      }
    } catch {
      // old format: plain string = debouches text
      setTargetAudience('')
      setRequirements([''])
    }

    // Curriculum
    try { setSections(JSON.parse(course.curriculumJson ?? '[]')) } catch { setSections([]) }
  }, [course])

  // ── Save helpers ──
  const buildDebouches = () => JSON.stringify({
    audience: targetAudience,
    requirements,
    debouches: '',
  })

  const saveObjectives = async () => {
    setSaving(true)
    try {
      await courseApi.update(courseId!, {
        title,
        skillsJson: JSON.stringify(objectives.filter(o => o.trim())),
        debouches: buildDebouches(),
      } as any)
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      showToast('Objectifs sauvegardés ✓')
    } catch (e: any) {
      showToast('Erreur : ' + (e?.response?.data?.message ?? e?.message ?? 'inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const saveCurriculum = async () => {
    setSaving(true)
    try {
      await courseApi.update(courseId!, {
        title,
        curriculumJson: JSON.stringify(sections),
      } as any)
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      showToast('Programme sauvegardé ✓')
    } catch (e: any) {
      showToast('Erreur : ' + (e?.response?.data?.message ?? e?.message ?? 'inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const savePresentation = async () => {
    setSaving(true)
    try {
      await courseApi.update(courseId!, {
        title,
        description,
        shortDescription: shortDesc,
        level,
        department,
        filiere,
        ects: ects === '' ? undefined : Number(ects),
        durationHours: durationHours === '' ? undefined : Number(durationHours),
      } as any)
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      showToast('Présentation sauvegardée ✓')
    } catch (e: any) {
      showToast('Erreur : ' + (e?.response?.data?.message ?? e?.message ?? 'inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await courseApi.update(courseId!, {
        title,
        price: price === '' ? undefined : Number(price),
        gradientIndex,
      } as any)
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      showToast('Paramètres sauvegardés ✓')
    } catch (e: any) {
      showToast('Erreur : ' + (e?.response?.data?.message ?? e?.message ?? 'inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    setPublishing(true)
    try {
      await courseApi.publish(courseId!, !course?.published)
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      showToast(course?.published ? 'Cours dépublié' : 'Cours publié ! 🎉')
    } catch (e: any) {
      showToast('Erreur : ' + (e?.response?.data?.message ?? e?.message ?? 'inconnue'))
    } finally {
      setPublishing(false)
    }
  }

  // ── Curriculum helpers ──
  const addSection = () =>
    setSections(prev => [...prev, { id: `s-${Date.now()}`, title: `Section ${prev.length + 1}`, lessons: [] }])

  const removeSection = (sIdx: number) =>
    setSections(prev => prev.filter((_, i) => i !== sIdx))

  const updateSectionTitle = (sIdx: number, t: string) =>
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, title: t } : s))

  const addLesson = (sIdx: number) =>
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, lessons: [...s.lessons, { title: `Leçon ${s.lessons.length + 1}` }] } : s
    ))

  const removeLesson = (sIdx: number, lIdx: number) =>
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, lessons: s.lessons.filter((_, j) => j !== lIdx) } : s
    ))

  const updateLesson = (sIdx: number, lIdx: number, val: string) =>
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? {
        ...s,
        lessons: s.lessons.map((l, j) => {
          if (j !== lIdx) return l
          return typeof l === 'string' ? { title: val } : { ...l, title: val }
        }),
      } : s
    ))

  // Called when a video is successfully uploaded for a lesson — saves mediaId into curriculumJson
  const setLessonMediaId = async (sIdx: number, lIdx: number, mediaId: string) => {
    const newSections = sections.map((s, i) =>
      i !== sIdx ? s : {
        ...s,
        lessons: s.lessons.map((l, j) => {
          if (j !== lIdx) return l
          const base = typeof l === 'string' ? { title: l } : l
          return { ...base, mediaId }
        }),
      }
    )
    setSections(newSections)
    // Auto-save so mediaId is persisted immediately
    try {
      await courseApi.update(courseId!, { title, curriculumJson: JSON.stringify(newSections) } as any)
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] })
      showToast('Vidéo liée à la leçon ✓')
    } catch {
      showToast('Erreur lors de la sauvegarde du curriculum')
    }
  }

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0)
  const lessonsWithVideo = sections.reduce((acc, s) =>
    acc + s.lessons.filter(l => typeof l !== 'string' && l.mediaId).length, 0)

  // ── Section completion indicators ──
  const objectivesDone = objectives.filter(o => o.trim()).length >= 4 && targetAudience.trim().length > 0
  const curriculumDone = sections.length > 0 && totalLessons > 0
  const presentationDone = title.trim().length > 0 && description.trim().length > 0
  const videosDone = totalLessons > 0 && lessonsWithVideo === totalLessons
  const settingsDone = price !== ''

  const sidebarItems: SidebarItem[] = [
    { id: 'objectives',    label: 'Objectifs',       icon: <Target className="h-4 w-4" /> },
    { id: 'curriculum',   label: 'Programme',        icon: <Layout className="h-4 w-4" /> },
    { id: 'presentation', label: 'Présentation',     icon: <BookOpen className="h-4 w-4" /> },
    { id: 'videos',       label: 'Vidéos',           icon: <Video className="h-4 w-4" /> },
    { id: 'settings',     label: 'Paramètres',       icon: <Settings className="h-4 w-4" /> },
  ]

  const completionMap: Record<Section, boolean> = {
    objectives:    objectivesDone,
    curriculum:    curriculumDone,
    presentation:  presentationDone,
    videos:        videosDone,
    settings:      settingsDone,
  }

  // ── Loading / not found ──
  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!course) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Cours introuvable.</p>
      <Link to="/teacher"><Button className="mt-4">Retour</Button></Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ── Top header bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 h-14">
          {/* Left: back + title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/teacher">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2 shrink-0">
                <ChevronLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <div className="h-4 w-px bg-border shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate max-w-xs">{course.title}</p>
            </div>
            <Badge
              variant={course.published ? 'default' : 'secondary'}
              className={cn(
                'text-[10px] shrink-0',
                course.published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''
              )}
            >
              {course.published ? 'Publié' : 'Brouillon'}
            </Badge>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {course.slug && (
              <Link to={`/course/${course.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <Eye className="h-3.5 w-3.5" /> Voir le cours
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant={course.published ? 'outline' : 'default'}
              className={cn(
                'gap-1.5 text-xs h-8',
                !course.published && 'bg-primary hover:bg-primary/90 text-white'
              )}
              onClick={togglePublish}
              disabled={publishing}
            >
              {publishing
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : course.published
                  ? <><Lock className="h-3.5 w-3.5" /> Dépublier</>
                  : <><Globe className="h-3.5 w-3.5" /> Publier</>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + content ── */}
      <div className="flex min-h-[calc(100vh-3.5rem)]">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-white sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="py-4 px-3 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-3">
              Étapes de création
            </p>
            {sidebarItems.map((item, idx) => {
              const done = completionMap[item.id]
              const active = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <span className={cn('shrink-0', active ? 'text-primary' : 'text-muted-foreground')}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{idx + 1}. {item.label}</span>
                  {done && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">

            {/* ── SECTION: Objectifs ── */}
            {activeSection === 'objectives' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Objectifs du cours</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Définissez ce que les étudiants apprendront et à qui ce cours s'adresse.
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Ce que les étudiants apprendront</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Minimum 4 points. Soyez précis et concret.</p>
                      </div>
                      <BulletEditor
                        items={objectives}
                        onChange={setObjectives}
                        placeholder="ex : Maîtriser les gammes pentatoniques"
                        minItems={4}
                      />
                    </div>

                    <div className="border-t border-border pt-6 space-y-3">
                      <Label className="text-sm font-semibold">À qui ce cours s'adresse</Label>
                      <textarea
                        className="w-full h-24 text-sm border border-input rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                        placeholder="ex : Musiciens débutants souhaitant apprendre le jazz, étudiants en conservatoire..."
                        value={targetAudience}
                        onChange={e => setTargetAudience(e.target.value)}
                      />
                    </div>

                    <div className="border-t border-border pt-6 space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Prérequis</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Connaissances ou équipements nécessaires avant de suivre ce cours.</p>
                      </div>
                      <BulletEditor
                        items={requirements}
                        onChange={setRequirements}
                        placeholder="ex : Savoir lire une partition de base"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={saveObjectives} disabled={saving} className="gap-2 min-w-[140px] bg-primary hover:bg-primary/90 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}

            {/* ── SECTION: Programme (Curriculum) ── */}
            {activeSection === 'curriculum' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Programme du cours</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Organisez votre cours en sections et leçons.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sections.length} section{sections.length !== 1 ? 's' : ''} · {totalLessons} leçon{totalLessons !== 1 ? 's' : ''}
                  </p>
                  <Button variant="outline" size="sm" onClick={addSection} className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Ajouter une section
                  </Button>
                </div>

                {sections.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Layout className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold text-sm">Aucune section pour l'instant</p>
                      <p className="text-xs text-muted-foreground mt-1">Cliquez sur "Ajouter une section" pour structurer votre cours.</p>
                      <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={addSection}>
                        <Plus className="h-3.5 w-3.5" /> Ajouter la première section
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {sections.map((section, sIdx) => (
                      <Card key={section.id} className="overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                            {sIdx + 1}
                          </div>
                          <Input
                            value={section.title}
                            onChange={e => updateSectionTitle(sIdx, e.target.value)}
                            className="h-8 text-sm font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                            placeholder="Titre de la section"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {section.lessons.length} leçon{section.lessons.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => removeSection(sIdx)}
                            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="p-3 space-y-2">
                          {section.lessons.map((lesson, lIdx) => {
                            const lessonObj = typeof lesson === 'string' ? { title: lesson, mediaId: undefined } : lesson
                            return (
                              <div key={lIdx} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/20 transition-colors">
                                <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <Play className={cn('h-3 w-3 shrink-0', lessonObj.mediaId ? 'text-emerald-500 fill-emerald-500' : 'text-primary fill-primary')} />
                                <Input
                                  value={lessonObj.title}
                                  onChange={e => updateLesson(sIdx, lIdx, e.target.value)}
                                  className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                                  placeholder="Titre de la leçon"
                                />
                                {lessonObj.mediaId && (
                                  <span className="text-[10px] text-emerald-600 shrink-0 font-medium">▶ vidéo</span>
                                )}
                                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                                  {String(lIdx + 1).padStart(2, '0')}
                                </span>
                                <button
                                  onClick={() => removeLesson(sIdx, lIdx)}
                                  className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )
                          })}
                          <button
                            onClick={() => addLesson(sIdx)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" /> Ajouter une leçon
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={saveCurriculum} disabled={saving} className="gap-2 min-w-[160px] bg-primary hover:bg-primary/90 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder le programme
                  </Button>
                </div>
              </div>
            )}

            {/* ── SECTION: Présentation ── */}
            {activeSection === 'presentation' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Présentation du cours</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ces informations apparaissent sur la page publique du cours.
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Titre du cours <span className="text-destructive">*</span></Label>
                      <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="ex : Harmonie Jazz — Niveau 1"
                        className="text-base"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Description complète</Label>
                      <textarea
                        className="w-full h-32 text-sm border border-input rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                        placeholder="Décrivez en détail ce que les étudiants vont apprendre, les méthodes pédagogiques, l'organisation du cours..."
                        value={description}
                        onChange={e => setDesc(e.target.value)}
                      />
                    </div>

                    {/* Short description */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">
                        Description courte
                        <span className="text-xs font-normal text-muted-foreground ml-1">(affichée sur la carte cours)</span>
                      </Label>
                      <Input
                        value={shortDesc}
                        onChange={e => setShortDesc(e.target.value)}
                        placeholder="Résumé accrocheur en une ligne"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-2 border-t border-border pt-6">
                      <Label className="text-sm font-semibold">Vignette du cours</Label>
                      <p className="text-xs text-muted-foreground">
                        Image principale affichée sur la carte et en haut de la page du cours. Recommandé : 1280×720 px.
                      </p>
                      <ImageUploader
                        onUploaded={url => setThumbnailUrl(url)}
                        currentUrl={thumbnailUrl || undefined}
                      />
                    </div>

                    {/* Preview video */}
                    <div className="space-y-2 border-t border-border pt-6">
                      <Label className="text-sm font-semibold">Vidéo de présentation</Label>
                      <p className="text-xs text-muted-foreground">
                        Courte vidéo (1–3 min) où vous vous présentez et expliquez le cours. Visible publiquement.
                      </p>
                      <VideoUploader
                        courseId={course.id}
                        onUploaded={mediaId => setPreviewVideoMediaId(mediaId)}
                      />
                      {previewVideoMediaId && (
                        <p className="text-xs text-muted-foreground">ID média : {previewVideoMediaId}</p>
                      )}
                    </div>

                    {/* Dept, filiere, level */}
                    <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Département</Label>
                        <select
                          className="w-full h-10 text-sm border border-input rounded-lg px-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={department}
                          onChange={e => setDept(e.target.value)}
                        >
                          <option value="">— Sélectionner —</option>
                          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Filière</Label>
                        <Input
                          value={filiere}
                          onChange={e => setFiliere(e.target.value)}
                          placeholder="ex : Piano classique"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Niveau</Label>
                        <select
                          className="w-full h-10 text-sm border border-input rounded-lg px-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={level}
                          onChange={e => setLevel(e.target.value)}
                        >
                          <option value="">— Sélectionner —</option>
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Crédits ECTS</Label>
                        <Input
                          type="number" min={0} max={180}
                          value={ects}
                          onChange={e => setEcts(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="ex : 30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Durée (heures de contenu)</Label>
                        <Input
                          type="number" min={0}
                          value={durationHours}
                          onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="ex : 40"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={savePresentation} disabled={saving} className="gap-2 min-w-[140px] bg-primary hover:bg-primary/90 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}

            {/* ── SECTION: Vidéos ── */}
            {activeSection === 'videos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Vidéos des leçons</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploadez une vidéo MP4/WebM pour chaque leçon. Les fichiers sont stockés de manière sécurisée.
                  </p>
                  {totalLessons > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden max-w-xs">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${Math.round((lessonsWithVideo / totalLessons) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {lessonsWithVideo}/{totalLessons} leçon{totalLessons !== 1 ? 's' : ''} avec vidéo
                      </span>
                    </div>
                  )}
                </div>

                {sections.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Video className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold text-sm">Créez d'abord vos sections et leçons</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        Allez dans "Programme" pour structurer votre cours, puis revenez ici pour uploader les vidéos.
                      </p>
                      <Button
                        variant="outline" size="sm" className="mt-4 gap-1.5"
                        onClick={() => setActiveSection('curriculum')}
                      >
                        <Layout className="h-3.5 w-3.5" /> Créer le programme
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section, sIdx) => (
                      <Card key={section.id} className="overflow-hidden">
                        <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-3">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                            {sIdx + 1}
                          </div>
                          <p className="text-sm font-semibold">{section.title}</p>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {section.lessons.length} leçon{section.lessons.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="divide-y divide-border">
                          {section.lessons.length === 0 ? (
                            <div className="px-4 py-4 text-xs text-muted-foreground italic">
                              Aucune leçon dans cette section.
                            </div>
                          ) : (
                            section.lessons.map((lesson, lIdx) => {
                              const lessonObj = typeof lesson === 'string' ? { title: lesson, mediaId: undefined } : lesson
                              const lessonId = `${sIdx}-${lIdx}`
                              return (
                                <div key={lIdx} className="flex items-start gap-3 px-4 py-3">
                                  <div className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5',
                                    lessonObj.mediaId ? 'bg-emerald-100' : 'bg-primary/10'
                                  )}>
                                    <Play className={cn('h-3 w-3', lessonObj.mediaId ? 'text-emerald-600 fill-emerald-600' : 'text-primary fill-primary')} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{lessonObj.title}</p>
                                    <LessonVideoUploader
                                      courseId={course.id}
                                      lessonId={lessonId}
                                      hasVideo={!!lessonObj.mediaId}
                                      onVideoUploaded={(mediaId) => setLessonMediaId(sIdx, lIdx, mediaId)}
                                    />
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION: Paramètres ── */}
            {activeSection === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Paramètres du cours</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Couleur, prix et publication du cours.
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-8">
                    {/* Gradient picker */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Couleur du cours</Label>
                      <p className="text-xs text-muted-foreground">
                        Choisissez un dégradé pour la carte et la bannière de votre cours.
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {GRADIENTS.map((g, idx) => (
                          <button
                            key={idx}
                            onClick={() => setGradientIndex(idx)}
                            title={g.label}
                            className={cn(
                              'h-12 rounded-lg bg-gradient-to-br transition-all',
                              g.from, g.to,
                              gradientIndex === idx
                                ? 'ring-2 ring-offset-2 ring-primary scale-105 shadow-md'
                                : 'hover:scale-105 hover:shadow-sm opacity-80 hover:opacity-100'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sélectionné : <span className="font-medium text-foreground">{GRADIENTS[gradientIndex]?.label}</span>
                      </p>
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5 border-t border-border pt-6">
                      <Label className="text-sm font-semibold">Prix (€) <span className="text-destructive">*</span></Label>
                      <div className="flex items-center gap-2 max-w-xs">
                        <Input
                          type="number" min={0} max={9999}
                          value={price}
                          onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="ex : 49"
                          className="text-lg font-semibold"
                        />
                        <span className="text-muted-foreground font-semibold text-lg">€</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Entrez 0 pour un cours gratuit.</p>
                    </div>

                    {/* Preview */}
                    <div className="space-y-3 border-t border-border pt-6">
                      <Label className="text-sm font-semibold">Aperçu de la carte</Label>
                      <CoursePreviewCard
                        title={title}
                        level={level}
                        price={price}
                        gradientIndex={gradientIndex}
                      />
                    </div>

                    {/* Publication */}
                    <div className="space-y-3 border-t border-border pt-6">
                      <Label className="text-sm font-semibold">Publication</Label>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                          course.published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                          {course.published
                            ? <><CheckCircle2 className="h-4 w-4" /> Publié</>
                            : <><Lock className="h-4 w-4" /> Brouillon</>
                          }
                        </div>
                        <Button
                          variant={course.published ? 'outline' : 'default'}
                          size="sm"
                          onClick={togglePublish}
                          disabled={publishing}
                          className={cn(
                            'gap-2',
                            !course.published && 'bg-primary hover:bg-primary/90 text-white'
                          )}
                        >
                          {publishing
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : course.published
                              ? <><Lock className="h-4 w-4" /> Dépublier</>
                              : <><Globe className="h-4 w-4" /> Publier le cours</>
                          }
                        </Button>
                      </div>
                      {course.published && course.slug && (
                        <Link
                          to={`/course/${course.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <Eye className="h-3 w-3" /> Voir le cours publié
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={saving} className="gap-2 min-w-[160px] bg-primary hover:bg-primary/90 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
