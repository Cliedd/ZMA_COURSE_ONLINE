import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'
import type { CourseFilters } from '@/entities/course'

/**
 * État des filtres du catalogue, porté par l'URL (spec § 6 règle 5) : un catalogue
 * filtré est partageable, marque-page-able, et restauré par le bouton Retour.
 */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()

  const filters: CourseFilters = useMemo(() => {
    const department = params.get('department') ?? undefined
    const level = params.get('level') ?? undefined
    const q = params.get('q') ?? undefined
    const page = params.get('page')
    return {
      department: department || undefined,
      level: level || undefined,
      q: q || undefined,
      page: page ? Math.max(0, Number(page) - 1) : 0,
      size: 12,
    }
  }, [params])

  /** Pose (ou retire, si valeur vide) un paramètre et remet la pagination à 1. */
  const setFilter = useCallback(
    (key: 'department' | 'level' | 'q', value: string | undefined) => {
      const next = new URLSearchParams(params)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      setParams(next, { replace: false })
    },
    [params, setParams],
  )

  const setPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(params)
      if (page > 1) next.set('page', String(page))
      else next.delete('page')
      setParams(next, { replace: false })
    },
    [params, setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: false }), [setParams])

  const hasActiveFilters = Boolean(filters.department || filters.level || filters.q)

  return { filters, setFilter, setPage, reset, hasActiveFilters }
}
