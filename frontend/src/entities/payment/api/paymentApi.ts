import { z } from 'zod'
import { get, post } from '@/shared/api/http'
import { paymentSchema } from '../model/payment.schema'
import type { Payment, PaymentProvider } from '../model/payment.schema'
import { revenueAnalyticsSchema, teacherPayoutAnalyticsSchema } from '../model/analytics.schema'
import type { RevenueAnalytics, TeacherPayoutAnalytics } from '../model/analytics.schema'

export const paymentApi = {
  /**
   * Initie le paiement — le prix est calculé côté serveur. `provider` est
   * requis pour tout cours payant (STRIPE_CARD, STRIPE_PAYPAL ou CINETPAY) ;
   * omis pour un cours gratuit, confirmé immédiatement côté serveur.
   * Le paiement PENDING renvoyé porte `checkoutUrl` — la page hébergée du
   * gateway vers laquelle rediriger le navigateur. La confirmation réelle
   * n'arrive jamais d'ici : elle vient uniquement d'un webhook signé
   * (voir /checkout/return, qui interroge getById plutôt que de faire
   * confiance à un paramètre d'URL renvoyé par le gateway).
   */
  checkout: (courseId: string, provider?: PaymentProvider, promoCode?: string): Promise<Payment> =>
    post('/payments/checkout', { courseId, promoCode, provider }, paymentSchema),
  getById: (id: string): Promise<Payment> =>
    get(`/payments/${id}`, undefined, paymentSchema),
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
