import type { UseFormReturn } from 'react-hook-form'
import { Field, Input } from '@/shared/ui'
import type { WizardFormValues } from '../model/useWizardForm'

const TEXTAREA_CLASSES =
  'min-h-[6rem] w-full rounded border border-line bg-surface px-3 py-2 font-sans text-body text-ink placeholder:text-ink-faint aria-[invalid=true]:border-danger'

/** Étape 2 : descriptions, volume horaire, crédits, compétences visées et recommandations / prérequis / débouchés. */
export function StepDetails({ form }: { form: UseFormReturn<WizardFormValues> }) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-h2 text-ink">Description & Recommandations</h2>

      <Field name="shortDescription" label="Description courte" required error={errors.shortDescription?.message}>
        <Input placeholder="Résumé en une phrase" {...register('shortDescription')} />
      </Field>

      <Field name="description" label="Description détaillée" error={errors.description?.message}>
        <textarea rows={5} className={TEXTAREA_CLASSES} placeholder="Décrivez ce que les étudiants vont apprendre..." {...register('description')} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field name="durationHours" label="Durée (heures)" error={errors.durationHours?.message}>
          <Input type="number" min={0} step="1" {...register('durationHours')} />
        </Field>

        <Field name="ects" label="Crédits ECTS" error={errors.ects?.message}>
          <Input type="number" min={0} step="1" {...register('ects')} />
        </Field>
      </div>

      <Field name="skills" label="Compétences visées (Ce que les étudiants vont apprendre)" error={errors.skills?.message}>
        <div>
          <textarea
            rows={3}
            className={TEXTAREA_CLASSES}
            placeholder={`Lecture de partition en clé de Sol et Fa\nAccompagnement de mélodies au piano`}
            {...register('skills')}
          />
          <p className="mt-1 font-sans text-xs text-ink-faint">Saisissez une compétence par ligne.</p>
        </div>
      </Field>

      <Field name="debouches" label="Recommandations, prérequis & débouchés" error={errors.debouches?.message}>
        <div>
          <textarea
            rows={3}
            className={TEXTAREA_CLASSES}
            placeholder={`Recommandé : Avoir 1 an de pratique instrumentale\nDébouché : Accompagnateur de chorale`}
            {...register('debouches')}
          />
          <p className="mt-1 font-sans text-xs text-ink-faint">Saisissez un prérequis, une recommandation ou un débouché par ligne.</p>
        </div>
      </Field>
    </div>
  )
}
