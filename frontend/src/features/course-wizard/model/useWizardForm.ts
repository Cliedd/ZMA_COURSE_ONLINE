import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/** Départements enseignés — options du select à l'étape 1. */
export const DEPARTMENTS = ['Interprétation', 'Composition', 'Technologies', 'Pédagogie', 'Musicologie'] as const

/** Convertit une chaîne vide (champ nombre laissé vide) en `undefined` avant coercition. */
const optionalNumber = (message: string) =>
  z.preprocess(
    (value) => (value === '' || value === undefined || value === null || Number.isNaN(value) ? undefined : Number(value)),
    z.number().min(0, message).optional(),
  )

export const wizardSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est obligatoire.'),
  department: z.string().optional(),
  level: z.string().optional(),
  price: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
    z.number({ required_error: 'Le prix est obligatoire.', invalid_type_error: 'Veuillez saisir un prix valide.' })
      .min(0, 'Le prix doit être positif ou nul.'),
  ),
  shortDescription: z.string().trim().min(1, 'La description courte est obligatoire.'),
  description: z.string().optional(),
  durationHours: optionalNumber('La durée doit être positive ou nulle.'),
  ects: optionalNumber('Les ECTS doivent être positifs ou nuls.'),
})

export type WizardFormValues = z.infer<typeof wizardSchema>

export type WizardStep = 1 | 2

const BASICS_FIELDS = ['title', 'department', 'level', 'price'] as const

export interface UseWizardFormResult {
  form: UseFormReturn<WizardFormValues>
  step: WizardStep
  goNext: () => Promise<void>
  goPrevious: () => void
}

/**
 * Porte le state du formulaire multi-étapes : un seul `useForm` partagé entre
 * les deux étapes (les valeurs saisies à l'étape 1 survivent au passage à
 * l'étape 2), plus l'étape courante et la navigation entre étapes.
 */
export function useWizardForm(): UseWizardFormResult {
  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: '',
      department: '',
      level: '',
      price: 0,
      shortDescription: '',
      description: '',
      durationHours: undefined,
      ects: undefined,
    },
  })
  const [step, setStep] = useState<WizardStep>(1)

  const goNext = async () => {
    const valid = await form.trigger(BASICS_FIELDS)
    if (valid) setStep(2)
  }

  const goPrevious = () => setStep(1)

  return { form, step, goNext, goPrevious }
}
