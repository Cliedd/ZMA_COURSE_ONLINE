import { useQuery, useMutation } from '@tanstack/react-query'
import { paymentApi } from '../api/paymentApi'

export const paymentKeys = {
  all: ['payments'] as const,
  mine: () => [...paymentKeys.all, 'mine'] as const,
}

export function useMyPayments() {
  return useQuery({ queryKey: paymentKeys.mine(), queryFn: paymentApi.getMine, staleTime: 30_000 })
}

export function useCheckout() {
  return useMutation({ mutationFn: ({ courseId, promoCode }: { courseId: string; promoCode?: string }) => paymentApi.checkout(courseId, promoCode) })
}

export function useConfirmPayment() {
  return useMutation({ mutationFn: (id: string) => paymentApi.confirm(id) })
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
