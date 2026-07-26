import { z } from 'zod'

/** Rôles applicatifs (correspond à l'enum backend). */
export const ADMIN_USER_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const
export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number]

/** Utilisateur tel que renvoyé par l'endpoint d'administration. */
export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(ADMIN_USER_ROLES),
  provider: z.string().nullish().transform((v) => v ?? 'LOCAL'),
  suspended: z.boolean().nullish().transform((v) => v ?? false),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
})

export type AdminUser = z.infer<typeof adminUserSchema>

/** Enveloppe de pagination Spring Data. */
export const adminUserPageSchema = z.object({
  content: z.array(adminUserSchema).default([]),
  totalElements: z.number().nullish().transform((v) => v ?? 0),
})

export type AdminUserPage = z.infer<typeof adminUserPageSchema>
