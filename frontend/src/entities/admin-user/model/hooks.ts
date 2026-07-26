import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUserApi } from '../api/adminUserApi'
import { adminUserKeys } from './queryKeys'

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
    onSuccess: () => invalidateAdminUserCaches(qc),
  })
}

export function useSetUserSuspended() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) => adminUserApi.setSuspended(id, suspended),
    onSuccess: () => invalidateAdminUserCaches(qc),
  })
}
