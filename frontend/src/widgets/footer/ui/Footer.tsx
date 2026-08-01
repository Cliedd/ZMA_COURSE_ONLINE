import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEPARTMENTS, LEVELS } from '@/shared/config/navigation'
import { setLocale, type Locale } from '@/shared/config/i18n'

/** Sélecteur de langue FR/EN du pied de page. */
function FooterLocaleSwitch() {
  const { t, i18n: i18nInstance } = useTranslation()
  const current = (i18nInstance.language?.slice(0, 2) as Locale) || 'fr'

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('localeSwitch.label')}>
      {(['fr', 'en'] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          aria-pressed={current === loc}
          className={`rounded px-2 py-1 font-sans text-xs font-bold uppercase transition-colors ${
            current === loc ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-h3 text-ink">{t('brand.name')}</p>
          <p className="mt-1 font-sans text-sm text-ink-muted">{t('brand.tagline')}</p>
        </div>

        <nav aria-label={t('footer.trainings')}>
          <p className="eyebrow">{t('footer.trainings')}</p>
          <ul className="mt-3 space-y-1.5">
            {DEPARTMENTS.map((entry) => (
              <li key={entry.value}>
                <Link to={entry.to} className="font-sans text-sm text-ink-muted hover:text-ink">{t(entry.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('nav.diplomas')}>
          <p className="eyebrow">{t('nav.diplomas')}</p>
          <ul className="mt-3 space-y-1.5">
            {LEVELS.map((entry) => (
              <li key={entry.value}>
                <Link to={entry.to} className="font-sans text-sm text-ink-muted hover:text-ink">{t(entry.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.academy')}>
          <p className="eyebrow">{t('footer.academy')}</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link to="/teachers" className="font-sans text-sm text-ink-muted hover:text-ink">{t('nav.teachers')}</Link></li>
            <li><Link to="/catalogue" className="font-sans text-sm text-ink-muted hover:text-ink">{t('nav.catalogue')}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="font-sans text-sm text-ink-faint">
            © {year} {t('brand.name')} — {t('footer.rights')}
          </p>
          <FooterLocaleSwitch />
        </div>
      </div>
    </footer>
  )
}
