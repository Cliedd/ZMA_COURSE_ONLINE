import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Picture, BlurFade } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'

const LEVELS = [
  { n: '01', key: 'beginner', image: IMAGES.levelBeginner, dept: 'bg-dept-1' },
  { n: '02', key: 'intermediate', image: IMAGES.levelIntermediate, dept: 'bg-dept-2' },
  { n: '03', key: 'advanced', image: IMAGES.levelAdvanced, dept: 'bg-dept-4' },
] as const

/** Trois vignettes marketing « Beginner / Intermediate / Advanced », purement
 * présentationnelles — aucun champ backend ne correspond à ce découpage, contrairement
 * aux départements/niveaux réels (`COURSE_LEVELS`). Le CTA renvoie vers le catalogue
 * complet plutôt qu'un filtre inventé. */
export function ProgrammesByLevelSection() {
  const { t } = useTranslation()

  return (
    <section className="border-t border-line bg-paper py-20">
      <div className="container">
        <BlurFade className="max-w-2xl">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
            {t('home.programmesByLevel.eyebrow')}
          </p>
          <div className="mt-3 h-px w-11 bg-accent" />
          <h2 className="mt-5 font-serif text-h1 text-ink">{t('home.programmesByLevel.title')}</h2>
        </BlurFade>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {LEVELS.map(({ n, key, image, dept }, i) => (
            <BlurFade key={key} delay={i * 0.08}>
              <article className="flex h-full flex-col overflow-hidden rounded border border-line bg-surface transition-transform duration-brand ease-brand hover:-translate-y-1 hover:shadow-overlay">
                <Picture image={image} sizes="(min-width: 640px) 33vw, 90vw" className="aspect-[16/10] w-full object-cover" />
                <div className={`h-1.5 ${dept}`} />
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">{n}</p>
                  <h3 className="mt-2 font-serif text-h3 text-ink">{t(`home.programmesByLevel.${key}.title`)}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
                    {t(`home.programmesByLevel.${key}.body`)}
                  </p>
                  <Link
                    to="/catalogue"
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 font-sans text-sm font-semibold text-accent-ink"
                  >
                    {t('home.explore')} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
