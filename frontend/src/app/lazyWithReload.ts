import { lazy } from 'react'
import type { ComponentType } from 'react'

/** Clé sessionStorage : une seule tentative de rechargement automatique par onglet,
 *  pour ne jamais boucler si le vrai problème n'est pas un chunk périmé (ex. coupure
 *  réseau persistante, blocage par un bloqueur de pub). */
export const CHUNK_RELOAD_FLAG_KEY = 'chunk-reload-attempted'

/**
 * Motifs d'erreur caractéristiques d'un chunk JS/CSS devenu introuvable côté serveur :
 * après un déploiement Netlify, les anciens fichiers content-hashés sont supprimés. Un
 * onglet resté ouvert depuis avant le déploiement (ou un index.html mis en cache par le
 * navigateur) référence encore ces hashes et échoue au premier `import()` dynamique —
 * exactement le rapport « Failed to fetch dynamically imported module ». Chaque moteur
 * (Vite/Rollup, Webpack, Safari, Firefox) formule ce même échec avec un libellé différent.
 */
const CHUNK_LOAD_ERROR_PATTERNS: RegExp[] = [
  /failed to fetch dynamically imported module/i,
  /loading chunk \S+ failed/i,
  /loading css chunk \S+ failed/i,
  /importing a module script failed/i,
  /error loading dynamically imported module/i,
  /unable to preload css/i,
  /dynamically imported module/i,
]

/** Détecte si une erreur correspond à un chunk de code introuvable, plutôt qu'une
 *  vraie erreur applicative (que ce filet ne doit surtout pas masquer). */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false
  const message = error instanceof Error ? error.message : String(error)
  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

/** Recharge la page une seule fois par onglet si l'erreur est un chunk périmé.
 *  Renvoie `true` si un rechargement a été déclenché (l'appelant doit alors
 *  suspendre son rendu — la navigation va de toute façon repartir de zéro). */
export function reloadOnceForChunkError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false
  if (sessionStorage.getItem(CHUNK_RELOAD_FLAG_KEY)) return false
  sessionStorage.setItem(CHUNK_RELOAD_FLAG_KEY, '1')
  window.location.reload()
  return true
}

/**
 * Enveloppe `lazy(() => import(...))` : si le chunk demandé a disparu du serveur
 * (déploiement pendant que l'onglet était ouvert), recharge la page automatiquement
 * une seule fois au lieu d'afficher l'écran d'erreur générique « Une erreur est
 * survenue ». Un second échec (ou une erreur non liée aux chunks) est propagé tel
 * quel jusqu'à l'ErrorBoundary, qui applique le même filet en dernier recours.
 */
export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): ReturnType<typeof lazy<T>> {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (reloadOnceForChunkError(error)) {
        // Le rechargement est déjà en vol : on ne résout jamais cette promesse pour
        // éviter à React de tenter un rendu (Suspense) pendant la navigation.
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }),
  )
}
