import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/** Départements enseignés — options du select à l'étape 1. Valeurs verbatim de la
 * taxonomie backend (voir DataLoader.java) : ne jamais raccourcir/traduire, sous
 * peine de désynchroniser les filtres du catalogue (cf. navigation.ts DEPARTMENTS). */
export const DEPARTMENTS = [
  'Performance & Instrumental Practice',
  'Composition, Writing & Music Theory',
  'Music Technology & Audiovisual Production',
  'Music Education & Teacher Training',
  'Musicology, Heritage & Cultural Management',
] as const

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
    (value) => (value === '' || value === undefined || value === null || Number.isNaN(value) ? undefined : Number(value)),
    z
      .number({ required_error: 'Le prix est obligatoire.', invalid_type_error: 'Veuillez saisir un prix valide.' })
      .positive('Le prix doit être strictly supérieur à 0.'),
  ),
  shortDescription: z.string().trim().min(1, 'La description courte est obligatoire.'),
  description: z.string().optional(),
  durationHours: optionalNumber('La durée doit être positive ou nulle.'),
  ects: optionalNumber('Les ECTS doivent être positifs ou nuls.'),
  skills: z.string().optional(),
  debouches: z.string().optional(),
})

export type WizardFormValues = z.infer<typeof wizardSchema>

export type WizardStep = 1 | 2

export const STEP_FIELDS: Record<WizardStep, readonly (keyof WizardFormValues)[]> = {
  1: ['title', 'department', 'level', 'price'],
  2: ['shortDescription', 'description', 'durationHours', 'ects', 'skills', 'debouches'],
}

export interface UseWizardFormResult {
  form: UseFormReturn<WizardFormValues>
  step: WizardStep
  setStep: (step: WizardStep) => void
  goNext: () => Promise<boolean>
  goPrevious: () => void
  getStepForField: (fieldName: string) => WizardStep
}

/**
 * Porte le state du formulaire multi-étapes (2 étapes) : un seul `useForm` partagé entre
 * les étapes, avec navigation et validation scoped par étape.
 */
export function useWizardForm(): UseWizardFormResult {
  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: '',
      department: '',
      level: '',
      price: undefined as unknown as number,
      shortDescription: '',
      description: '',
      durationHours: undefined,
      ects: undefined,
      skills: '',
      debouches: '',
    },
  })
  const [step, setStep] = useState<WizardStep>(1)

  const goNext = async (): Promise<boolean> => {
    const fieldsToValidate = STEP_FIELDS[step]
    const valid = await form.trigger(fieldsToValidate as (keyof WizardFormValues)[])
    if (valid && step < 2) {
      setStep((prev) => (prev + 1) as WizardStep)
      return true
    }
    return valid
  }

  const goPrevious = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as WizardStep)
    }
  }

  const getStepForField = (fieldName: string): WizardStep => {
    for (const [s, fields] of Object.entries(STEP_FIELDS)) {
      if ((fields as readonly string[]).includes(fieldName as keyof WizardFormValues)) {
        return Number(s) as WizardStep
      }
    }
    return 1
  }

  return { form, step, setStep, goNext, goPrevious, getStepForField }
}
