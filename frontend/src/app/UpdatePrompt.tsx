import { useTranslation } from 'react-i18next'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Le service worker (registerType: 'autoUpdate') remplace silencieusement
 * la version en cache dès qu'un nouveau déploiement est détecté — mais un
 * onglet resté ouvert pendant ce temps continue de tourner sur l'ancien
 * bundle JS, dont les chunks référencés ont depuis été supprimés du serveur
 * (échecs "Failed to fetch dynamically imported module", clics qui ne font
 * rien). `needRefresh` nous prévient qu'une nouvelle version est prête ;
 * on l'affiche explicitement plutôt que de laisser l'utilisateur bloqué
 * sur une page périmée sans le savoir.
 */
export function UpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: (error) => {
      console.error('Service worker registration failed', error)
    },
  })

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:justify-end sm:pr-6"
    >
      <div className="flex w-full max-w-sm items-start gap-3 rounded border border-line bg-surface p-4 shadow-lg">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue" aria-hidden />
        <div className="flex-1 font-sans text-sm">
          <p className="font-semibold text-ink">{t('update.title')}</p>
          <p className="mt-1 text-ink-muted">{t('update.body')}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="min-h-touch rounded bg-blue px-4 font-sans text-sm font-semibold text-paper transition-colors duration-brand ease-brand hover:opacity-90"
            >
              {t('update.reload')}
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="min-h-touch rounded px-3 font-sans text-sm text-ink-muted transition-colors duration-brand ease-brand hover:text-ink"
            >
              {t('update.dismiss')}
            </button>
          </div>
        </div>
        <button
          onClick={() => setNeedRefresh(false)}
          aria-label={t('update.dismiss')}
          className="rounded p-1 text-ink-faint transition-colors hover:bg-line hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
