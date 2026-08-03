import { get } from '@/shared/api/http'
import { userCountSchema } from '../model/user.schema'
import type { UserCount } from '../model/user.schema'

export const userApi = {
  /** Nombre total de comptes inscrits — statistique publique, sans donnée personnelle. */
  count: (): Promise<UserCount> => get('/auth/users/count', undefined, userCountSchema),
}
