import { z } from 'zod'
import { get, post, patch } from '@/shared/api/http'
import { paymentSchema } from '../model/payment.schema'
import type { Payment } from '../model/payment.schema'

export const paymentApi = {
  /** Initie le paiement — le prix est calculé côté serveur. */
  checkout: (courseId: string, promoCode?: string): Promise<Payment> =>
    post('/payments/checkout', { courseId, promoCode }, paymentSchema),
  confirm: (id: string): Promise<Payment> =>
    patch(`/payments/${id}/confirm`, undefined, paymentSchema),
  getMine: (): Promise<Payment[]> =>
    get('/payments/me', undefined, z.array(paymentSchema)),
  checkPaid: (courseId: string) =>
    get('/payments/check', { params: { courseId } }, z.object({ paid: z.boolean().nullish().transform((v) => v ?? false) })),
}
