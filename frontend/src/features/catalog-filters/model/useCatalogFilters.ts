import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo, useRef } from 'react'
import type { CourseFilters } from '@/entities/course'

/**
 * État des filtres du catalogue, porté par l'URL (spec § 6 règle 5) : un catalogue
 * filtré est partageable, marque-page-able, et restauré par le bouton Retour.
 */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()

  // Reflète toujours le TOUT DERNIER état voulu, y compris entre deux appels à
  // setFilter/setPage déclenchés avant qu'un rendu n'ait eu lieu (ex. deux clics
  // rapprochés, ou l'effet debouncé de la recherche qui se déclenche juste après
  // qu'un autre filtre a changé). On ne peut pas s'appuyer ni sur `params` capturé
  // au rendu, ni sur la forme fonctionnelle de `setSearchParams` de react-router-dom :
  // celle-ci referme elle aussi sur un `searchParams` mémoïsé au rendu (voir son
  // implémentation), donc tout aussi périmé dans ce scénario. Cette ref est mise à
  // jour de façon synchrone à chaque appel, donc un second appel juste après le
  // premier voit déjà le résultat du premier, quel que soit l'état du rendu React.
  const paramsRef = useRef(params)
  paramsRef.current = params

  // `setSearchParams` change elle-même d'identité à chaque changement d'URL (elle
  // referme sur `searchParams`, cf. l'implémentation de react-router-dom : son
  // `useCallback` a `searchParams` en dépendance). Sans cette ref, `setFilter`/`setPage`
  // (ci-dessous, mémoïsés sur `setParams`) changeraient donc eux aussi d'identité à
  // chaque navigation — y compris un simple clic de pagination — ce qui re-déclenche
  // à tort tout effet qui les liste en dépendance (ex. la synchro de la recherche
  // débouncée dans CataloguePage), lequel réapplique `setFilter('q', …)` et supprime
  // `page` de l'URL au passage : le clic sur « page 2 » semblait alors « glitcher »
  // et revenir silencieusement à la page 1. On isole donc `setParams` dans une ref
  // pour que `setFilter`/`setPage`/`reset` restent des callbacks stables (deps vides).
  const setParamsRef = useRef(setParams)
  setParamsRef.current = setParams

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

  /**
   * Pose (ou retire, si valeur vide) un paramètre et remet la pagination à 1.
   *
   * Part de `paramsRef.current` (toujours à jour, voir plus haut) plutôt que de
   * `params` capturé au rendu, et remet immédiatement `paramsRef.current` à jour
   * après le calcul — sans quoi une seconde mise à jour déclenchée juste après la
   * première pourrait repartir d'un instantané périmé et l'écraser silencieusement
   * (un des deux filtres disparaît de l'URL au lieu de se combiner).
   */
  const setFilter = useCallback(
    (key: 'department' | 'level' | 'q', value: string | undefined) => {
      const next = new URLSearchParams(paramsRef.current)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      paramsRef.current = next
      setParamsRef.current(next, { replace: false })
    },
    [],
  )

  const setPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(paramsRef.current)
      if (page > 1) next.set('page', String(page))
      else next.delete('page')
      paramsRef.current = next
      setParamsRef.current(next, { replace: false })
    },
    [],
  )

  const reset = useCallback(() => {
    const next = new URLSearchParams()
    paramsRef.current = next
    setParamsRef.current(next, { replace: false })
  }, [])

  const hasActiveFilters = Boolean(filters.department || filters.level || filters.q)

  return { filters, setFilter, setPage, reset, hasActiveFilters }
}
