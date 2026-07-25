import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Le frontend actuel redirige silencieusement vers l'accueil : l'utilisateur
 * qui suit un lien mort ne comprend pas ce qui s'est passé. Exigence
 * « Zero Dead Ends » du CDC.
 */
export function NotFound() {
  const { t } = useTranslation()
  return (
    <section className="container flex flex-col items-start gap-4 py-20">
      <p className="eyebrow">404</p>
      <h1 className="max-w-2xl font-serif text-h1 text-ink">{t('notFound.title')}</h1>
      <p className="max-w-prose font-sans text-body text-ink-muted">{t('notFound.body')}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link to="/" className="flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">
          {t('notFound.backHome')}
        </Link>
        <Link to="/catalogue" className="flex min-h-touch items-center rounded border border-ink px-5 font-sans text-sm font-semibold text-ink">
          {t('notFound.browseCatalogue')}
        </Link>
      </div>
    </section>
  )
}
