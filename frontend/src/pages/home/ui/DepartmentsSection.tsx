import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEPARTMENTS } from '@/shared/config/navigation'

/** Grille des cinq départements, registre clair. */
export function DepartmentsSection() {
  const { t } = useTranslation()

  return (
    <section className="container py-20">
      <div className="max-w-2xl">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-gold-ink">
          {t('home.departmentsEyebrow')}
        </p>
        <div className="mt-3 h-px w-11 bg-gold" />
        <h2 className="mt-5 font-serif text-h1 text-ink">{t('home.departmentsTitle')}</h2>
        <p className="mt-4 font-sans text-body leading-relaxed text-ink-muted">{t('home.departmentsBody')}</p>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((dept) => (
          <li key={dept.label}>
            <Link
              to={dept.to}
              className="flex min-h-touch flex-col justify-between gap-6 bg-surface p-6 transition-colors duration-brand ease-brand hover:bg-paper"
            >
              <span className="font-serif text-h3 text-ink">{dept.label}</span>
              <span className="font-sans text-sm text-ink-muted">{dept.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
