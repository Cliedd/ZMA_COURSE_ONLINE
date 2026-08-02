import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { reloadOnceForChunkError } from './lazyWithReload'

interface State {
  hasError: boolean
  message: string
}

/**
 * Dernier filet de sécurité : capture les erreurs de rendu non interceptées
 * pour éviter l'écran blanc, et propose une sortie (Zero Dead Ends du CDC).
 * Une frontière d'erreur DOIT être un composant de classe — il n'existe pas
 * d'équivalent en hooks pour getDerivedStateFromError.
 *
 * Filet chunk périmé : lazyWithReload() (router.tsx) gère déjà le cas nominal
 * d'un chunk de route disparu après déploiement. Ce composant reste le filet de
 * secours si une telle erreur survient ailleurs (import dynamique hors routeur,
 * échec réseau resurgissant pendant le rendu) — même logique de rechargement
 * unique par onglet, pour ne jamais remplacer un vrai bug par une boucle.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || String(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Point de branchement pour un futur rapport d'erreurs (Sentry, cf. CDC).
    console.error('Erreur de rendu non interceptée', error, info)
    reloadOnceForChunkError(error)
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper p-8 text-center">
        <p className="eyebrow text-danger">Erreur</p>
        <h1 className="max-w-xl font-serif text-h1 text-ink">Une erreur est survenue</h1>
        <p className="max-w-prose font-sans text-body text-ink-muted">{this.state.message}</p>
        <a
          href="/"
          className="mt-2 flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper"
        >
          Retour à l'accueil
        </a>
      </div>
    )
  }
}
