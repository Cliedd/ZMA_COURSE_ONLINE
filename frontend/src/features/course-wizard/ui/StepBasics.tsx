import type { UseFormReturn } from 'react-hook-form'
import { Field, Input } from '@/shared/ui'
import { COURSE_LEVELS } from '@/entities/course'
import { DEPARTMENTS } from '../model/useWizardForm'
import type { WizardFormValues } from '../model/useWizardForm'

const SELECT_CLASSES = 'min-h-touch rounded border border-line bg-surface px-3 font-sans text-body text-ink'

/** Étape 1 : titre, département, niveau et prix du cours. */
export function StepBasics({ form }: { form: UseFormReturn<WizardFormValues> }) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-h2 text-ink">Informations</h2>

      <Field name="title" label="Titre du cours" required error={errors.title?.message}>
        <Input placeholder="ex : Jazz Harmony Fundamentals" {...register('title')} />
      </Field>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="department" className="font-sans text-sm font-medium text-ink">
          Département
        </label>
        <select id="department" className={SELECT_CLASSES} {...register('department')}>
          <option value="">—</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="level" className="font-sans text-sm font-medium text-ink">
          Niveau
        </label>
        <select id="level" className={SELECT_CLASSES} {...register('level')}>
          <option value="">—</option>
          {COURSE_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <Field name="price" label="Prix (€)" required error={errors.price?.message}>
        <Input type="number" min={0} step="0.01" {...register('price', { valueAsNumber: true })} />
      </Field>
    </div>
  )
}
