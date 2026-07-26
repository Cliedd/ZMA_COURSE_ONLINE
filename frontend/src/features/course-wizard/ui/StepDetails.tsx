import type { UseFormReturn } from 'react-hook-form'
import { Field, Input } from '@/shared/ui'
import type { WizardFormValues } from '../model/useWizardForm'

const TEXTAREA_CLASSES =
  'min-h-[8rem] w-full rounded border border-line bg-surface px-3 py-2 font-sans text-body text-ink placeholder:text-ink-faint aria-[invalid=true]:border-danger'

/** Étape 2 : descriptions et volume horaire / crédits du cours. */
export function StepDetails({ form }: { form: UseFormReturn<WizardFormValues> }) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-h2 text-ink">Description</h2>

      <Field name="shortDescription" label="Description courte" required error={errors.shortDescription?.message}>
        <Input placeholder="Résumé en une phrase" {...register('shortDescription')} />
      </Field>

      <Field name="description" label="Description détaillée" error={errors.description?.message}>
        <textarea rows={6} className={TEXTAREA_CLASSES} placeholder="Décrivez ce que les étudiants vont apprendre..." {...register('description')} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field name="durationHours" label="Durée (heures)" error={errors.durationHours?.message}>
          <Input type="number" min={0} step="1" {...register('durationHours', { valueAsNumber: true })} />
        </Field>

        <Field name="ects" label="Crédits ECTS" error={errors.ects?.message}>
          <Input type="number" min={0} step="1" {...register('ects', { valueAsNumber: true })} />
        </Field>
      </div>
    </div>
  )
}
