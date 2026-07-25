import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEPARTMENTS, LEVELS } from './navigation'

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
              <li key={entry.label}>
                <Link to={entry.to} className="font-sans text-sm text-ink-muted hover:text-ink">{entry.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('nav.diplomas')}>
          <p className="eyebrow">{t('nav.diplomas')}</p>
          <ul className="mt-3 space-y-1.5">
            {LEVELS.map((entry) => (
              <li key={entry.label}>
                <Link to={entry.to} className="font-sans text-sm text-ink-muted hover:text-ink">{entry.label}</Link>
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
        <p className="container py-4 font-sans text-sm text-ink-faint">
          © {year} {t('brand.name')} — {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
