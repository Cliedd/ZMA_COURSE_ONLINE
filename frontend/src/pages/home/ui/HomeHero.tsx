import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Picture, BlurFade } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'

const STATS = [
  { value: '26', key: 'parcours' },
  { value: '180', key: 'ects' },
  { value: '1 000', key: 'students' },
] as const

/** Hero de l'accueil. Suit le thème clair/sombre du site (jetons --paper/--ink) :
 * photo + dégradé vers --paper, pour rester lisible et cohérent avec le reste
 * de la page dans les deux thèmes (ne force plus le registre « scène »). */
export function HomeHero() {
  const { t } = useTranslation()

  return (
    <section className="relative isolate overflow-hidden bg-paper text-ink">
      <div className="absolute inset-0 -z-10">
        <Picture image={IMAGES.heroEnsemble} alt="" priority sizes="100vw" className="h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/10 to-transparent" />
      </div>

      <div className="container flex min-h-[74vh] max-w-4xl flex-col justify-center py-20">
        <BlurFade direction="down">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
            {t('home.eyebrow')}
          </p>
        </BlurFade>
        <BlurFade delay={0.06}>
          <h1 className="mt-5 font-serif text-display leading-[1.05] text-ink">
            {t('home.title1')} <em className="not-italic text-accent-ink">{t('home.titleEm')}</em> {t('home.title2')}
          </h1>
        </BlurFade>
        <BlurFade delay={0.12}>
          <p className="mt-6 max-w-xl font-sans text-body leading-relaxed text-ink-muted">
            {t('home.subtitle')}
          </p>
        </BlurFade>

        <BlurFade delay={0.18}>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/catalogue" className="inline-flex min-h-touch items-center gap-2 rounded bg-accent px-6 font-sans text-sm font-semibold text-scene">
              {t('home.explore')} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/auth/register" className="inline-flex min-h-touch items-center rounded border border-ink/25 px-6 font-sans text-sm font-semibold text-ink hover:bg-ink/10">
              {t('home.freeLesson')}
            </Link>
          </div>
        </BlurFade>

        <BlurFade delay={0.24}>
          <dl className="mt-12 flex flex-wrap gap-10 border-t border-ink/15 pt-7">
            {STATS.map(({ value, key }) => (
              <div key={key}>
                <dt className="sr-only">{t(`home.stats.${key}`)}</dt>
                <dd className="font-serif text-h1 text-ink">{value}</dd>
                <p className="mt-1 font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-muted">
                  {t(`home.stats.${key}`)}
                </p>
              </div>
            ))}
          </dl>
        </BlurFade>
      </div>
    </section>
  )
}
