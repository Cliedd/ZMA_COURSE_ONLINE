import type { UseFormReturn } from 'react-hook-form'
import { Field } from '@/shared/ui'
import type { WizardFormValues } from '../model/useWizardForm'

const TEXTAREA_CLASSES =
  'min-h-[6rem] w-full rounded border border-line bg-surface px-3 py-2 font-sans text-body text-ink placeholder:text-ink-faint aria-[invalid=true]:border-danger'

/** Étape 3 : compétences visées et recommandations / prérequis / débouchés du cours. */
export function StepRecommendations({ form }: { form: UseFormReturn<WizardFormValues> }) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-serif text-h2 text-ink">Compétences & Recommandations</h2>
        <p className="font-sans text-sm text-ink-muted">
          Définissez les compétences visées, prérequis et recommandations d'orientation pour vos étudiants.
        </p>
      </div>

      <Field
        name="skills"
        label="Compétences visées (Ce que les étudiants vont apprendre)"
        error={errors.skills?.message}
      >
        <div>
          <textarea
            rows={4}
            className={TEXTAREA_CLASSES}
            placeholder={`Maîtriser la lecture de partition en clé de Sol et Fa\nAccompagner une mélodie au piano en direct\nComprendre les cadences et la structure harmonique`}
            {...register('skills')}
          />
          <p className="mt-1 font-sans text-xs text-ink-faint">
            Saisissez une compétence par ligne.
          </p>
        </div>
      </Field>

      <Field
        name="debouches"
        label="Recommandations, prérequis & débouchés"
        error={errors.debouches?.message}
      >
        <div>
          <textarea
            rows={4}
            className={TEXTAREA_CLASSES}
            placeholder={`Recommandé : Avoir des notions fondamentales de solfège\nPublic cible : Étudiants en cycle préparatoire ou supérieur\nDébouchés : Accompagnateur de chorale, Enseignant d'éveil musical`}
            {...register('debouches')}
          />
          <p className="mt-1 font-sans text-xs text-ink-faint">
            Saisissez une recommandation, un prérequis ou un débouché par ligne.
          </p>
        </div>
      </Field>
    </div>
  )
}
