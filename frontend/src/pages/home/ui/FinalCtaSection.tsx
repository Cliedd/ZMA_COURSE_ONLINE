import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Bandeau CTA final avant le footer. Contenu dans `home.finalCta.*` (i18n). */
export function FinalCtaSection() {
  const { t } = useTranslation()

  return (
    <section className="border-t border-line bg-surface">
      <div className="container flex flex-col items-center gap-6 py-24 text-center">
        <h2 className="max-w-2xl font-serif text-h1 text-ink">{t('home.finalCta.title')}</h2>
        <p className="max-w-xl font-sans text-body leading-relaxed text-ink-muted">{t('home.finalCta.body')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/auth/register"
            className="inline-flex min-h-touch items-center gap-2 rounded bg-ink px-8 font-sans text-sm font-semibold text-paper"
          >
            {t('home.freeLesson')} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/catalogue"
            className="inline-flex min-h-touch items-center rounded border border-ink px-8 font-sans text-sm font-semibold text-ink"
          >
            {t('home.explore')}
          </Link>
        </div>
      </div>
    </section>
  )
}
