import { z } from 'zod'

export const paymentSchema = z.object({
  id: z.string(),
  studentId: z.string().nullish().transform((v) => v ?? ''),
  courseId: z.string(),
  amount: z.number().nullish().transform((v) => v ?? 0),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED']).nullish().transform((v) => v ?? 'PENDING'),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
})
export type Payment = z.infer<typeof paymentSchema>
