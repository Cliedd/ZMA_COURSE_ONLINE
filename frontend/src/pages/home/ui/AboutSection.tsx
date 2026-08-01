import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Picture, BlurFade } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'

const STAT_KEYS = ['stat1', 'stat2', 'stat3', 'stat4'] as const

/** Section « About us » : présentation courte + checklist + bandeau de 4 statistiques,
 * registre clair. Deuxième section de la page d'accueil, juste après le hero sombre. */
export function AboutSection() {
  const { t } = useTranslation()
  const checklist = t('home.about.checklist', { returnObjects: true }) as string[]

  return (
    <section className="border-t border-line">
      <div className="container grid gap-14 py-20 lg:grid-cols-2 lg:items-center">
        <BlurFade direction="right" className="relative pb-12 pr-10">
          <Picture image={IMAGES.campus} sizes="(min-width: 1024px) 44vw, 90vw" className="aspect-[4/5] w-full rounded object-cover" />
          <Picture
            image={IMAGES.campusHallway}
            sizes="(min-width: 1024px) 24vw, 50vw"
            className="absolute bottom-0 right-0 aspect-square w-[56%] rounded border-8 border-surface object-cover shadow-overlay"
          />
        </BlurFade>

        <div>
          <BlurFade>
            <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
              {t('home.about.eyebrow')}
            </p>
            <div className="mt-3 h-px w-11 bg-accent" />
            <h2 className="mt-5 font-serif text-h1 text-ink">{t('home.about.title')}</h2>
            <p className="mt-4 font-sans text-body leading-relaxed text-ink-muted">{t('home.about.body')}</p>
          </BlurFade>

          <BlurFade delay={0.08}>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-sans text-sm font-medium text-ink">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-scene">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </BlurFade>
        </div>
      </div>

      <div className="border-y border-line bg-paper">
        <div className="container grid grid-cols-2 divide-x divide-line lg:grid-cols-4">
          {STAT_KEYS.map((key, i) => (
            <BlurFade key={key} delay={i * 0.06} className="px-6 py-10 text-center">
              <p className="font-serif text-h1 text-accent-ink">{t(`home.about.stats.${key}Value`)}</p>
              <p className="mt-2 font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-faint">
                {t(`home.about.stats.${key}Label`)}
              </p>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
