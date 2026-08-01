import { type FormEvent, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Facebook, Instagram, Youtube, Mail, MapPin, ArrowRight } from 'lucide-react'
import { toast } from '@/shared/ui'
import { DEPARTMENTS, LEVELS } from '@/shared/config/navigation'
import { setLocale, type Locale } from '@/shared/config/i18n'

const SOCIAL_LINKS = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/ZTFMusic' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/ztfmusic' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@ztfmusic' },
]

/** Puces d'accent décoratives, une par département — mêmes couleurs que l'en-tête. */
const DEPT_DOT_CLASSES = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5']

/** Sélecteur de langue FR/EN du pied de page — variante sombre. */
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
          className={`rounded px-2 py-1 font-sans text-xs font-bold uppercase transition-colors duration-brand ease-brand ${
            current === loc ? 'bg-scene-ink text-scene' : 'text-scene-ink/60 hover:text-scene-ink'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  )
}

/** Champ e-mail présentatif : aucun appel réseau, juste une confirmation locale. */
function NewsletterForm() {
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success(t('footer.newsletterToastBody'), t('footer.newsletterToastTitle'))
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="footer-newsletter-email" className="sr-only">
        {t('footer.newsletterPlaceholder')}
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        placeholder={t('footer.newsletterPlaceholder')}
        className="min-h-touch flex-1 rounded border border-scene-ink/20 bg-scene-ink/10 px-3 font-sans text-sm text-scene-ink placeholder:text-scene-ink/40 focus:border-scene-accent focus:outline-none"
      />
      <button
        type="submit"
        aria-label={t('footer.newsletterCtaAria')}
        className="grid min-h-touch min-w-touch shrink-0 place-items-center rounded bg-scene-accent text-scene transition-colors duration-brand ease-brand hover:bg-scene-accent/90"
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-scene text-scene-ink">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 space-y-5">
          <Link to="/" aria-label={t('brand.name')}>
            <img src="/brand/ztf-logo.png" alt={t('brand.name')} width={132} height={44} className="h-11 w-auto" />
          </Link>
          <p className="max-w-sm font-sans text-sm text-scene-ink/70">{t('footer.blurb')}</p>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded border border-scene-ink/15 text-scene-ink/60 transition-colors duration-brand ease-brand hover:border-scene-accent hover:text-scene-accent"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>

          <div className="max-w-sm space-y-1.5">
            <NewsletterForm />
            <p className="font-sans text-xs text-scene-ink/40">{t('footer.newsletterHint')}</p>
          </div>
        </div>

        <nav aria-label={t('footer.trainings')}>
          <p className="eyebrow text-scene-accent">{t('footer.trainings')}</p>
          <ul className="mt-3 space-y-1.5">
            {DEPARTMENTS.map((entry, i) => (
              <li key={entry.value}>
                <Link to={entry.to} className="flex items-center gap-2 font-sans text-sm text-scene-ink/70 transition-colors duration-brand ease-brand hover:text-scene-ink">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DEPT_DOT_CLASSES[i % DEPT_DOT_CLASSES.length]}`} aria-hidden />
                  {t(entry.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('nav.diplomas')}>
          <p className="eyebrow text-scene-accent">{t('nav.diplomas')}</p>
          <ul className="mt-3 space-y-1.5">
            {LEVELS.map((entry) => (
              <li key={entry.value}>
                <Link to={entry.to} className="font-sans text-sm text-scene-ink/70 transition-colors duration-brand ease-brand hover:text-scene-ink">{t(entry.labelKey)}</Link>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-5 text-scene-accent">{t('footer.academy')}</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link to="/teachers" className="font-sans text-sm text-scene-ink/70 transition-colors duration-brand ease-brand hover:text-scene-ink">{t('nav.teachers')}</Link></li>
            <li><Link to="/catalogue" className="font-sans text-sm text-scene-ink/70 transition-colors duration-brand ease-brand hover:text-scene-ink">{t('nav.catalogue')}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-scene-ink/10">
        <div className="container flex flex-wrap items-center gap-x-6 gap-y-2 py-4 font-sans text-xs text-scene-ink/50">
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-scene-accent/80" aria-hidden />
            {t('footer.address')}
          </span>
          <a href="mailto:ztfmusic@academydemusic.com" className="flex items-center gap-2 transition-colors duration-brand ease-brand hover:text-scene-ink">
            <Mail className="h-3.5 w-3.5 text-scene-accent/80" aria-hidden />
            ztfmusic@academydemusic.com
          </a>
        </div>
      </div>

      <div className="border-t border-scene-ink/10">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="font-sans text-sm text-scene-ink/50">
            © {year} {t('brand.name')} — {t('footer.rights')}
          </p>
          <FooterLocaleSwitch />
        </div>
      </div>
    </footer>
  )
}
