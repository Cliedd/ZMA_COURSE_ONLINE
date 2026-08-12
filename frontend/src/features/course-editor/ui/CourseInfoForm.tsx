import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageIcon, Loader2, X } from 'lucide-react'
import { Field, Input, Button, toast } from '@/shared/ui'
import { COURSE_LEVELS, courseSkills, courseOutcomes } from '@/entities/course'
import type { Course, CourseWriteRequest } from '@/entities/course'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, UploadError, uploadCourseThumbnail } from '../api/mediaApi'

const schema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  shortDescription: z.string().min(1, 'La description courte est requise.'),
  description: z.string(),
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  level: z.string(),
  department: z.string(),
  durationHours: z.coerce.number().optional(),
  ects: z.coerce.number().optional(),
  skills: z.string().optional(),
  debouches: z.string().optional(),
})
type Values = z.infer<typeof schema>

const selectClass = 'min-h-touch w-full rounded border border-line bg-surface px-3 font-sans text-body text-ink'
const textareaClass = 'w-full rounded border border-line bg-surface px-3 py-2 font-sans text-body text-ink'

const DEPARTMENTS: { value: string; label: string }[] = [
  { value: 'Performance & Instrumental Practice', label: 'Interprétation & Pratique instrumentale' },
  { value: 'Composition, Writing & Music Theory', label: 'Composition, Écriture & Théorie musicale' },
  { value: 'Music Technology & Audiovisual Production', label: 'Technologies musicales & Production audiovisuelle' },
  { value: 'Music Education & Teacher Training', label: 'Pédagogie musicale & Formation des formateurs' },
  { value: 'Musicology, Heritage & Cultural Management', label: 'Musicologie, Patrimoine & Management culturel' },
]

/** Formulaire des informations principales d'un cours (titre, description, tarif, niveau, compétences, débouchés…). */
export function CourseInfoForm({ course, onSave }: { course: Course; onSave: (data: CourseWriteRequest) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: course.title,
      shortDescription: course.shortDescription,
      description: course.description,
      price: course.price,
      level: course.level,
      department: course.department,
      durationHours: course.durationHours,
      ects: course.ects ?? undefined,
      skills: courseSkills(course).join('\n'),
      debouches: courseOutcomes(course).join('\n'),
    },
  })

  // ── Photo de couverture ──────────────────────────────────────────────────
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(course.thumbnailUrl ?? null)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [thumbProgress, setThumbProgress] = useState(0)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const handleThumbnailFile = async (file: File | undefined) => {
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Choisissez une image JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image trop lourde (max 10 Mo).')
      return
    }
    setUploadingThumb(true)
    setThumbProgress(0)
    try {
      const url = await uploadCourseThumbnail(file, setThumbProgress)
      setThumbnailUrl(url)
      toast.success('Photo de couverture uploadée.')
    } catch (err) {
      const msg =
        err instanceof UploadError && err.kind === 'auth'
          ? 'Accès refusé. Reconnectez-vous.'
          : err instanceof UploadError && err.kind === 'server'
            ? 'Erreur serveur. Réessayez plus tard.'
            : 'Échec de l\'upload. Vérifiez votre connexion.'
      toast.error(msg)
    } finally {
      setUploadingThumb(false)
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  const removeThumbnail = () => setThumbnailUrl(null)

  const onSubmit = handleSubmit((values) => {
    const skillsArray = values.skills
      ? values.skills.split('\n').map((s) => s.trim()).filter(Boolean)
      : []
    const debouchesArray = values.debouches
      ? values.debouches.split('\n').map((s) => s.trim()).filter(Boolean)
      : []

    onSave({
      title: values.title,
      shortDescription: values.shortDescription,
      description: values.description,
      price: values.price,
      level: values.level,
      department: values.department,
      durationHours: values.durationHours,
      ects: values.ects,
      skillsJson: skillsArray.length > 0 ? JSON.stringify(skillsArray) : '',
      debouches: debouchesArray.length > 0 ? debouchesArray.join(' | ') : '',
      thumbnailUrl: thumbnailUrl ?? undefined,
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <h2 className="font-serif text-h3 text-ink">Informations du cours</h2>

      <Field name="title" label="Titre" required error={errors.title?.message}>
        <Input {...register('title')} />
      </Field>

      <Field name="shortDescription" label="Description courte" required error={errors.shortDescription?.message}>
        <Input {...register('shortDescription')} />
      </Field>

      <Field name="description" label="Description complète">
        <textarea rows={6} className={textareaClass} {...register('description')} />
      </Field>

      <Field name="skills" label="Compétences visées (une par ligne)">
        <textarea rows={4} className={textareaClass} placeholder="Lecture de partition&#10;Accompagnement piano" {...register('skills')} />
      </Field>

      <Field name="debouches" label="Recommandations, prérequis & débouchés (un par ligne)">
        <textarea rows={4} className={textareaClass} placeholder="Prérequis: Niveau intermédiaire&#10;Débouché: Accompagnateur" {...register('debouches')} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field name="price" label="Prix (€)" required error={errors.price?.message}>
          <Input type="number" min={0} step="0.01" {...register('price')} />
        </Field>

        <Field name="level" label="Niveau">
          <select className={selectClass} {...register('level')}>
            {COURSE_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </Field>

        <Field name="department" label="Département">
          <select className={selectClass} {...register('department')}>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
        </Field>

        <Field name="durationHours" label="Durée (heures)">
          <Input type="number" min={0} {...register('durationHours')} />
        </Field>

        <Field name="ects" label="Crédits ECTS">
          <Input type="number" min={0} {...register('ects')} />
        </Field>
      </div>

      {/* ── Photo de couverture ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-ink">Photo de couverture</span>
        <input
          ref={thumbInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          aria-label="Choisir une photo de couverture"
          onChange={(e) => void handleThumbnailFile(e.target.files?.[0])}
        />
        {thumbnailUrl ? (
          <div className="relative w-full max-w-sm overflow-hidden rounded border border-line">
            <img
              src={thumbnailUrl}
              alt="Aperçu de la couverture du cours"
              className="aspect-[16/10] w-full object-cover"
            />
            <button
              type="button"
              onClick={removeThumbnail}
              aria-label="Supprimer la photo de couverture"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/80 text-danger backdrop-blur-sm"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full max-w-sm items-center justify-center rounded border border-dashed border-line bg-surface-alt">
            <ImageIcon className="h-8 w-8 text-ink-faint" aria-hidden />
          </div>
        )}
        {uploadingThumb ? (
          <div className="flex items-center gap-2 font-sans text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span>Upload en cours… {thumbProgress}%</span>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => thumbInputRef.current?.click()}
            className="self-start"
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            {thumbnailUrl ? 'Changer la photo' : 'Choisir une image'}
          </Button>
        )}
        <p className="font-sans text-xs text-ink-muted">
          JPG, PNG ou WebP · max 10 Mo · format recommandé 16:10
        </p>
      </div>

      <div>
        <Button type="submit" variant="primary">Enregistrer</Button>
      </div>
    </form>
  )
}
