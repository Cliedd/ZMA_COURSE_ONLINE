import { z } from 'zod'

export const paymentProviderSchema = z.enum(['STRIPE_CARD', 'STRIPE_PAYPAL', 'CINETPAY', 'FREE'])
export type PaymentProvider = z.infer<typeof paymentProviderSchema>

export const paymentSchema = z.object({
  id: z.string(),
  studentId: z.string().nullish().transform((v) => v ?? ''),
  courseId: z.string(),
  amount: z.number().nullish().transform((v) => v ?? 0),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']).nullish().transform((v) => v ?? 'PENDING'),
  provider: paymentProviderSchema.nullish(),
  /** URL de la page de paiement hébergée (Stripe/CinetPay) — présente uniquement pour un paiement PENDING payant. */
  checkoutUrl: z.string().nullish(),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
})
export type Payment = z.infer<typeof paymentSchema>
