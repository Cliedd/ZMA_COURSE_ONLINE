import { useQuery, useMutation } from '@tanstack/react-query'
import { paymentApi } from '../api/paymentApi'
import type { PaymentProvider } from './payment.schema'

export const paymentKeys = {
  all: ['payments'] as const,
  mine: () => [...paymentKeys.all, 'mine'] as const,
  byId: (id: string) => [...paymentKeys.all, id] as const,
}

export function useMyPayments() {
  return useQuery({ queryKey: paymentKeys.mine(), queryFn: paymentApi.getMine, staleTime: 30_000 })
}

export function useCheckout() {
  return useMutation({
    mutationFn: ({ courseId, provider, promoCode }: { courseId: string; provider?: PaymentProvider; promoCode?: string }) =>
      paymentApi.checkout(courseId, provider, promoCode),
  })
}

/**
 * Poll un paiement jusqu'à ce qu'il quitte l'état PENDING — utilisé sur la
 * page de retour de gateway. Ne fait JAMAIS confiance à un paramètre d'URL
 * renvoyé par Stripe/CinetPay : seule cette lecture serveur (elle-même
 * dérivée d'un webhook signé) fait foi.
 */
export function usePaymentStatus(paymentId: string | undefined, options?: { pollWhilePending?: boolean }) {
  return useQuery({
    queryKey: paymentKeys.byId(paymentId ?? ''),
    queryFn: () => paymentApi.getById(paymentId!),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      if (!options?.pollWhilePending) return false
      return query.state.data?.status === 'PENDING' ? 2_000 : false
    },
  })
}

export function useRevenueAnalytics(groupBy: 'day' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: [...paymentKeys.all, 'analytics', 'revenue', groupBy],
    queryFn: () => paymentApi.getRevenueAnalytics(groupBy),
    staleTime: 60_000,
  })
}

export function useTeacherPayouts() {
  return useQuery({
    queryKey: [...paymentKeys.all, 'analytics', 'teacher-payouts'],
    queryFn: () => paymentApi.getTeacherPayouts(),
    staleTime: 60_000,
  })
}
