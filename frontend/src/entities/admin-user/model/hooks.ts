import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUserApi } from '../api/adminUserApi'
import { adminUserKeys } from './queryKeys'
import { toast } from '@/shared/ui'
import { AppError } from '@/shared/api/http'

/** Message d'erreur lisible : l'API renvoie déjà un texte utilisable, sinon message générique. */
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof AppError ? error.message : fallback
}

/** Liste paginée des utilisateurs (admin uniquement). */
export function useAdminUsers(page = 0) {
  return useQuery({
    queryKey: adminUserKeys.list(page),
    queryFn: () => adminUserApi.list(page),
    staleTime: 30_000,
  })
}

function invalidateAdminUserCaches(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: adminUserKeys.all })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminUserApi.updateRole(id, role),
    onSuccess: (user) => {
      invalidateAdminUserCaches(qc)
      toast.success(`${user.email} est maintenant ${user.role}.`, 'Rôle mis à jour')
    },
    // Sans ce retour explicite, un échec (session admin expirée, 403, réseau…) ne se
    // voyait nulle part : le menu déroulant revenait silencieusement à l'ancienne valeur
    // et l'admin avait l'impression que « le changement de rôle ne prend pas effet ».
    onError: (error) => {
      toast.error(errorMessage(error, 'Le changement de rôle a échoué. Réessayez.'), 'Échec de la mise à jour')
    },
  })
}

export function useSetUserSuspended() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) => adminUserApi.setSuspended(id, suspended),
    onSuccess: (user) => {
      invalidateAdminUserCaches(qc)
      toast.success(
        user.suspended ? `${user.email} a été suspendu.` : `${user.email} a été réactivé.`,
        'Statut mis à jour',
      )
    },
    onError: (error) => {
      toast.error(errorMessage(error, 'La mise à jour du statut a échoué. Réessayez.'), 'Échec de la mise à jour')
    },
  })
}
