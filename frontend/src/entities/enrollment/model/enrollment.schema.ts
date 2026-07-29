import { z } from 'zod'

export const enrollmentSchema = z.object({
  id: z.string(),
  studentId: z.string().nullish().transform((v) => v ?? ''),
  courseId: z.string(),
  courseTitle: z.string().nullish().transform((v) => v ?? ''),
  courseLevel: z.string().nullish().transform((v) => v ?? ''),
  progress: z.number().nullish().transform((v) => v ?? 0),
  completedLessonsJson: z.string().nullish().transform((v) => v ?? ''),
  enrolledAt: z.string().nullish().transform((v) => v ?? ''),
})
export type Enrollment = z.infer<typeof enrollmentSchema>

export const certificateSchema = z.object({
  id: z.string(),
  studentId: z.string().nullish().transform((v) => v ?? ''),
  courseId: z.string(),
  certNumber: z.string().nullish().transform((v) => v ?? ''),
})
export type Certificate = z.infer<typeof certificateSchema>

export const enrollCheckSchema = z.object({
  enrolled: z.boolean().nullish().transform((v) => v ?? false),
  enrollmentId: z.string().nullable().transform((v) => v ?? null),
})

/** Réponse publique de vérification — miroir de CertificateVerificationResponse (backend). */
export const certificateVerificationSchema = z.object({
  valid: z.boolean().nullish().transform((v) => v ?? false),
  certNumber: z.string().nullish().transform((v) => v ?? ''),
  courseTitle: z.string().nullish().transform((v) => v ?? ''),
  issuedAt: z.string().nullable().transform((v) => v ?? null),
})
export type CertificateVerification = z.infer<typeof certificateVerificationSchema>
