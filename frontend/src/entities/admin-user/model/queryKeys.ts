/** Fabrique de clés de cache typée : invalidation juste, pas devinée. */
export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (page: number) => [...adminUserKeys.lists(), page] as const,
}
