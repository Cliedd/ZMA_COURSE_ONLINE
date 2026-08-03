import { z } from 'zod'

/**
 * Réponse du compteur public d'utilisateurs inscrits — endpoint marketing,
 * non authentifié, n'expose qu'un agrégat (aucune donnée personnelle).
 */
export const userCountSchema = z.object({
  count: z.number().nullish().transform((v) => v ?? 0),
})

export type UserCount = z.infer<typeof userCountSchema>
