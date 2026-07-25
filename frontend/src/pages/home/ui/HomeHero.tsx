import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Picture } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'

const STATS = [
  { value: '26', key: 'parcours' },
  { value: '180', key: 'ects' },
  { value: '1 000', key: 'students' },
] as const

/** Hero de l'accueil, registre « scène » (sombre). La seule surface sombre de la page. */
export function HomeHero() {
  const { t } = useTranslation()

  return (
    <section data-theme="dark" className="relative isolate overflow-hidden bg-scene text-scene-ink">
      <div className="absolute inset-0 -z-10">
        <Picture image={IMAGES.heroStage} alt="" priority sizes="100vw" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-scene via-scene/85 to-scene/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-scene via-transparent to-transparent" />
      </div>

      <div className="container flex min-h-[74vh] max-w-4xl flex-col justify-center py-20">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-gold">
          {t('home.eyebrow')}
        </p>
        <h1 className="mt-5 font-serif text-display leading-[1.05] text-scene-ink">
          {t('home.title1')} <em className="not-italic text-gold">{t('home.titleEm')}</em> {t('home.title2')}
        </h1>
        <p className="mt-6 max-w-xl font-sans text-body leading-relaxed text-scene-ink/70">
          {t('home.subtitle')}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/catalogue" className="inline-flex min-h-touch items-center gap-2 rounded bg-gold px-6 font-sans text-sm font-semibold text-scene">
            {t('home.explore')} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/auth/register" className="inline-flex min-h-touch items-center rounded border border-scene-ink/25 px-6 font-sans text-sm font-semibold text-scene-ink hover:bg-scene-ink/10">
            {t('home.freeLesson')}
          </Link>
        </div>

        <dl className="mt-12 flex flex-wrap gap-10 border-t border-scene-ink/15 pt-7">
          {STATS.map(({ value, key }) => (
            <div key={key}>
              <dt className="sr-only">{t(`home.stats.${key}`)}</dt>
              <dd className="font-serif text-h1 text-scene-ink">{value}</dd>
              <p className="mt-1 font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-scene-ink/50">
                {t(`home.stats.${key}`)}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
