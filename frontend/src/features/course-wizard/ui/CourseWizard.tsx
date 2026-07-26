import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { useCreateCourse } from '@/entities/course'
import type { CourseWriteRequest } from '@/entities/course'
import { AppError } from '@/shared/api/http'
import { useWizardForm } from '../model/useWizardForm'
import type { WizardFormValues } from '../model/useWizardForm'
import { StepBasics } from './StepBasics'
import { StepDetails } from './StepDetails'

function toWriteRequest(values: WizardFormValues): CourseWriteRequest {
  return {
    title: values.title,
    price: values.price,
    department: values.department || undefined,
    level: values.level || undefined,
    shortDescription: values.shortDescription,
    description: values.description || undefined,
    durationHours: values.durationHours,
    ects: values.ects,
  }
}

/** Assistant de création de cours en deux étapes : informations puis description. */
export function CourseWizard() {
  const { form, step, goNext, goPrevious } = useWizardForm()
  const createCourse = useCreateCourse()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const course = await createCourse.mutateAsync(toWriteRequest(values))
      navigate(`/teacher/courses/${course.id}/edit`)
    } catch (error) {
      setSubmitError(error instanceof AppError ? error.message : 'Erreur lors de la création du cours.')
    }
  })

  const handlePrimary = () => {
    if (step === 1) {
      void goNext()
      return
    }
    void onSubmit()
  }

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="mx-auto max-w-2xl space-y-6">
      <p className="font-sans text-eyebrow text-accent-ink">Étape {step}/2</p>

      {step === 1 ? <StepBasics form={form} /> : <StepDetails form={form} />}

      {submitError && (
        <p role="alert" className="font-sans text-sm text-danger">{submitError}</p>
      )}

      <div className="flex items-center justify-between gap-3">
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
