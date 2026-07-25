import { useQuery } from '@tanstack/react-query'
import { teacherApi } from '../api/teacherApi'

export const teacherKeys = {
  all: ['teachers'] as const,
  list: () => [...teacherKeys.all, 'list'] as const,
  detail: (username: string) => [...teacherKeys.all, 'detail', username] as const,
}

/** Liste des enseignants (dérivée du catalogue). */
export function useTeachers() {
  return useQuery({ queryKey: teacherKeys.list(), queryFn: teacherApi.list, staleTime: 60_000 })
}

/** Un enseignant et ses cours. */
export function useTeacher(username: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.detail(username ?? ''),
    queryFn: () => teacherApi.getByUsername(username as string),
    enabled: Boolean(username),
    staleTime: 60_000,
  })
}
