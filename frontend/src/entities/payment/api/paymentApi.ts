import { z } from 'zod'
import { get, post, patch } from '@/shared/api/http'
import { paymentSchema } from '../model/payment.schema'
import type { Payment } from '../model/payment.schema'
import { revenueAnalyticsSchema, teacherPayoutAnalyticsSchema } from '../model/analytics.schema'
import type { RevenueAnalytics, TeacherPayoutAnalytics } from '../model/analytics.schema'

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
  /** ADMIN uniquement — revenus réellement encaissés (paiements SUCCESS). */
  getRevenueAnalytics: (groupBy: 'day' | 'month' | 'year' = 'month'): Promise<RevenueAnalytics> =>
    get('/payments/analytics/revenue', { params: { groupBy } }, revenueAnalyticsSchema),
  /** ADMIN uniquement — répartition des revenus par enseignant (part plateforme/enseignant). */
  getTeacherPayouts: (): Promise<TeacherPayoutAnalytics> =>
    get('/payments/analytics/teacher-payouts', undefined, teacherPayoutAnalyticsSchema),
  invoicePdfUrl: (paymentId: string) => `/api/v1/payments/${paymentId}/invoice/pdf`,
}
