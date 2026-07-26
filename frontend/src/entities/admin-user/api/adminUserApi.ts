import { get, patch } from '@/shared/api/http'
import { adminUserSchema, adminUserPageSchema } from '../model/adminUser.schema'
import type { AdminUser, AdminUserPage } from '../model/adminUser.schema'

export const adminUserApi = {
  /** Liste paginée des utilisateurs (admin uniquement). */
  list: (page = 0, size = 50): Promise<AdminUserPage> =>
    get('/auth/admin/users', { params: { page, size } }, adminUserPageSchema),

  updateRole: (id: string, role: string): Promise<AdminUser> =>
    patch(`/auth/admin/users/${id}/role`, undefined, adminUserSchema, { params: { role } }),

  setSuspended: (id: string, suspended: boolean): Promise<AdminUser> =>
    patch(`/auth/admin/users/${id}/suspend`, undefined, adminUserSchema, { params: { suspended } }),
}
