import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Field, Input, Button } from '@/shared/ui'
import { COURSE_LEVELS, courseSkills, courseOutcomes } from '@/entities/course'
import type { Course, CourseWriteRequest } from '@/entities/course'

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

      <div>
        <Button type="submit" variant="primary">Enregistrer</Button>
      </div>
    </form>
  )
}
