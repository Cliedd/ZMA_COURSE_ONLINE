import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api/userApi'
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
