import { get, put, post } from '@/shared/api/http'
import { userCountSchema } from '../model/user.schema'
import type { UserCount } from '../model/user.schema'

export interface MyProfile {
  id: string
  email: string
  role: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  avatarUrl: string | null
  phoneNumber: string | null
  preferredLanguage: string | null
}

export interface UpdateProfileRequest {
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  phoneNumber?: string | null
  preferredLanguage?: string | null
}

export interface AvatarResponse {
  avatarUrl: string
}

export const userApi = {
  /** Nombre total de comptes inscrits — statistique publique, sans donnée personnelle. */
  count: (): Promise<UserCount> => get('/auth/users/count', undefined, userCountSchema),

  /** Profil de l'utilisateur connecté. */
  getMyProfile: (): Promise<MyProfile> => get('/users/me'),

  /** Met à jour le profil de l'utilisateur connecté. */
  updateMyProfile: (data: UpdateProfileRequest): Promise<MyProfile> => put('/users/me', data),

  /** Met à jour l'avatar via un mediaId confirmé. */
  updateAvatar: (mediaId: string): Promise<AvatarResponse> =>
    post('/users/me/avatar', { mediaId }),
}
