/** Fabrique de clés de cache typée : invalidation juste, pas devinée. */
export const userKeys = {
  all: ['users'] as const,
  count: () => [...userKeys.all, 'count'] as const,
}
