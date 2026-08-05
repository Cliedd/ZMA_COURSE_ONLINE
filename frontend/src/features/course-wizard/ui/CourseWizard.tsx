import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { useCreateCourse } from '@/entities/course'
import type { CourseWriteRequest } from '@/entities/course'
import { AppError } from '@/shared/api/http'
import { useWizardForm } from '../model/useWizardForm'
import type { WizardFormValues, WizardStep } from '../model/useWizardForm'
import { StepBasics } from './StepBasics'
import { StepDetails } from './StepDetails'

export function toWriteRequest(values: WizardFormValues): CourseWriteRequest {
  const skillsArray = values.skills
    ? values.skills
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  const debouchesArray = values.debouches
    ? values.debouches
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return {
    title: values.title,
    price: values.price,
    department: values.department || undefined,
    level: values.level || undefined,
    shortDescription: values.shortDescription,
    description: values.description || undefined,
    durationHours: values.durationHours,
    ects: values.ects,
    skillsJson: skillsArray.length > 0 ? JSON.stringify(skillsArray) : undefined,
    debouches: debouchesArray.length > 0 ? debouchesArray.join(' | ') : undefined,
  }
}

const STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Informations' },
  { step: 2, label: 'Description & Recommandations' },
]

/** Assistant de création de cours en deux étapes : informations puis description & recommandations. */
export function CourseWizard() {
  const { form, step, setStep, goNext, goPrevious, getStepForField } = useWizardForm()
  const createCourse = useCreateCourse()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleValidSubmit = async (values: WizardFormValues) => {
    setSubmitError(null)
    try {
      const course = await createCourse.mutateAsync(toWriteRequest(values))
      navigate(`/teacher/courses/${course.id}/edit`)
    } catch (error) {
      setSubmitError(error instanceof AppError ? error.message : 'Erreur lors de la création du cours.')
    }
  }

  const handleInvalidSubmit = (errors: Record<string, unknown>) => {
    const errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      const firstErrorField = errorKeys[0] as string
      const targetStep = getStepForField(firstErrorField)
      setStep(targetStep)
      setSubmitError(`Des erreurs de validation sont présentes à l'étape ${targetStep}. Veuillez les corriger avant de valider.`)
    }
  }

  const onSubmit = form.handleSubmit(handleValidSubmit, handleInvalidSubmit)

  const handlePrimary = async () => {
    setSubmitError(null)
    if (step < 2) {
      const valid = await goNext()
      if (!valid) {
        setSubmitError(`Veuillez corriger les erreurs de l'étape actuelle avant de continuer.`)
      }
      return
    }
    await onSubmit()
  }

  const handleStepClick = async (targetStep: WizardStep) => {
    if (targetStep === step) return
    if (targetStep < step) {
      setStep(targetStep)
      setSubmitError(null)
    } else {
      const valid = await goNext()
      if (!valid) {
        setSubmitError(`Veuillez corriger les erreurs avant de passer à l'étape suivante.`)
      }
    }
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="mx-auto max-w-2xl space-y-6">
      {/* Stepper progress indicator */}
      <nav aria-label="Étapes de création du cours" className="border-b border-line pb-4">
        <ol className="flex items-center justify-between gap-2 sm:gap-4">
          {STEPS.map((s) => {
            const isActive = s.step === step
            const isDone = s.step < step
            return (
              <li key={s.step} className="flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(s.step)}
                  className={`group flex w-full flex-col gap-1 text-left transition-colors font-sans text-xs sm:text-sm ${
                    isActive
                      ? 'font-bold text-accent-ink'
                      : isDone
                      ? 'text-ink hover:text-accent-ink'
                      : 'text-ink-faint'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-accent text-paper'
                          : isDone
                          ? 'bg-ink text-paper'
                          : 'bg-surface-elevated border border-line text-ink-muted'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span className="truncate hidden sm:inline">{s.label}</span>
                  </div>
                  <span className="sm:hidden text-xs truncate">{s.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <p className="font-sans text-eyebrow text-accent-ink">Étape {step}/2</p>

      {step === 1 ? <StepBasics form={form} /> : <StepDetails form={form} />}

      {submitError && (
        <div role="alert" className="rounded border border-danger/30 bg-danger/10 p-3 font-sans text-sm font-medium text-danger">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-4">
        <Button type="button" variant="secondary" disabled={step === 1} onClick={goPrevious}>
          Précédent
        </Button>
        <Button type="button" onClick={handlePrimary} disabled={createCourse.isPending}>
          {step === 1 ? 'Suivant' : createCourse.isPending ? 'Création...' : 'Créer le cours'}
        </Button>
      </div>
    </form>
  )
}
