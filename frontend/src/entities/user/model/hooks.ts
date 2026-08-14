import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/userApi'
import type { UpdateProfileRequest } from '../api/userApi'
import { userKeys } from './queryKeys'

/**
 * Nombre total d'inscrits — statistique publique utilisée pour la preuve
 * sociale sur la page d'accueil (avant lancement des cours). Rafraîchi peu
 * souvent : ce n'est pas un compteur temps réel.
 */
export function useUserCount() {
  return useQuery({
    queryKey: userKeys.count(),
    queryFn: () => userApi.count(),
    staleTime: 60_000,
  })
}

/** Profil de l'utilisateur connecté. */
export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userApi.getMyProfile,
  })
}

/** Mutation pour mettre à jour le profil de l'utilisateur connecté. */
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateMyProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me() }),
  })
}
