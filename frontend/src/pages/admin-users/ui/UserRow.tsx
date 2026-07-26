import { Badge, Button } from '@/shared/ui'
import { ADMIN_USER_ROLES, useSetUserSuspended, useUpdateUserRole } from '@/entities/admin-user'
import type { AdminUser } from '@/entities/admin-user'

const roleTone: Record<AdminUser['role'], 'accent' | 'success' | 'default'> = {
  ADMIN: 'accent',
  TEACHER: 'success',
  STUDENT: 'default',
}

/** Une ligne de la liste des utilisateurs (page admin). Non exportée du module. */
export function UserRow({ user }: { user: AdminUser }) {
  const updateRole = useUpdateUserRole()
  const setSuspended = useSetUserSuspended()

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-4">
      <div>
        <p className="font-serif text-h3 text-ink">{user.email}</p>
        <p className="font-sans text-eyebrow text-ink-muted">{user.provider}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={roleTone[user.role]}>{user.role}</Badge>
        <Badge tone={user.suspended ? 'danger' : 'success'}>
          {user.suspended ? 'Suspendu' : 'Actif'}
        </Badge>

        <select
          aria-label={`Rôle de ${user.email}`}
          value={user.role}
          disabled={updateRole.isPending}
          onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
          className="min-h-touch border border-line bg-paper px-2 font-sans text-sm text-ink"
        >
          {ADMIN_USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant={user.suspended ? 'secondary' : 'danger'}
          size="sm"
          disabled={setSuspended.isPending}
          onClick={() => setSuspended.mutate({ id: user.id, suspended: !user.suspended })}
        >
          {user.suspended ? 'Réactiver' : 'Suspendre'}
        </Button>
      </div>
    </li>
  )
}
