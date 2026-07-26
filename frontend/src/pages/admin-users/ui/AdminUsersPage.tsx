import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAdminUsers } from '@/entities/admin-user'
import { UserRow } from './UserRow'

/** Gestion des utilisateurs : rôles et suspension de compte. */
export function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsers()
  const users = data?.content ?? []

  return (
    <div>
      <Breadcrumb items={[{ label: 'Administration', to: '/admin' }, { label: 'Utilisateurs' }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">Gestion des utilisateurs</h1>
        <p className="mt-1 font-sans text-body text-ink-muted">
          {isLoading ? 'Chargement…' : `${data?.totalElements ?? 0} utilisateur(s) au total.`}
        </p>

        <div className="mt-8">
          {isLoading ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-20 w-full" />
                </li>
              ))}
            </ul>
          ) : isError ? (
            <div className="border border-line bg-surface p-8 text-center">
              <p className="font-sans text-body text-danger">
                Impossible de charger les utilisateurs.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="border border-line bg-surface p-12 text-center">
              <p className="font-serif text-h3 text-ink">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
