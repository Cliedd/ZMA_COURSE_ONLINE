import { z } from 'zod'

export const revenuePointSchema = z.object({
  period: z.string(),
  amount: z.number(),
  transactionCount: z.number(),
})

export const revenueAnalyticsSchema = z.object({
  groupBy: z.string(),
  from: z.string(),
  to: z.string(),
  totalRevenue: z.number(),
  totalTransactions: z.number(),
  byCurrency: z.record(z.string(), z.number()),
  points: z.array(revenuePointSchema),
})
export type RevenueAnalytics = z.infer<typeof revenueAnalyticsSchema>

export const teacherPayoutSchema = z.object({
  teacherEmail: z.string(),
  totalRevenue: z.number(),
  teacherShare: z.number(),
  platformShare: z.number(),
  transactionCount: z.number(),
})

export const teacherPayoutAnalyticsSchema = z.object({
  from: z.string(),
  to: z.string(),
  teacherShareRate: z.number(),
  payouts: z.array(teacherPayoutSchema),
})
export type TeacherPayoutAnalytics = z.infer<typeof teacherPayoutAnalyticsSchema>
