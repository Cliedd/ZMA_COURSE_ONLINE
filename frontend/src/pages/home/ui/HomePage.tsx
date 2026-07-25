import { Link } from 'react-router-dom'
import { ArrowRight, Award, Globe2, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HomeHero } from './HomeHero'
import { DepartmentsSection } from './DepartmentsSection'
import { FeaturedCourses } from './FeaturedCourses'

const WHY = [
  { icon: Award, n: '01', titleKey: 'why1t', bodyKey: 'why1b' },
  { icon: Globe2, n: '02', titleKey: 'why2t', bodyKey: 'why2b' },
  { icon: TrendingUp, n: '03', titleKey: 'why3t', bodyKey: 'why3b' },
] as const

const WHY_TEXT: Record<string, string> = {
  why1t: 'Exigence internationale',
  why1b: 'Les méthodes et standards des grandes académies de Paris, Londres et Boston.',
  why2t: 'Identité musicale',
  why2b: 'Chaque étudiant maîtrise les standards mondiaux et développe sa propre identité.',
  why3t: 'Professionnalisation tôt',
  why3b: 'Stages, enregistrements en studio et diffusion publique dès la deuxième année.',
}

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-hidden">
      <HomeHero />
      <DepartmentsSection />
      <FeaturedCourses />

      {/* Pourquoi ZMA */}
      <section className="container grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">{t('home.whyEyebrow')}</p>
          <h2 className="mt-3 font-serif text-h1 text-ink">{t('home.whyTitle')}</h2>
          <ul className="mt-8 space-y-6">
            {WHY.map(({ icon: Icon, n, titleKey, bodyKey }) => (
              <li key={n} className="flex items-start gap-4">
                <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded border border-line text-accent-ink">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-sm text-ink-faint">{n}</p>
                  <h3 className="font-serif text-h3 text-ink">{WHY_TEXT[titleKey]}</h3>
                  <p className="mt-1 font-sans text-sm leading-relaxed text-ink-muted">{WHY_TEXT[bodyKey]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden aspect-[4/3] border border-line bg-paper lg:block" />
      </section>

      {/* CTA final */}
      <section className="border-t border-line bg-surface">
        <div className="container flex flex-col items-center gap-6 py-24 text-center">
          <h2 className="max-w-2xl font-serif text-h1 text-ink">{t('home.ctaTitle')}</h2>
          <p className="max-w-xl font-sans text-body leading-relaxed text-ink-muted">{t('home.ctaBody')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/auth/register" className="inline-flex min-h-touch items-center gap-2 rounded bg-ink px-8 font-sans text-sm font-semibold text-paper">
              {t('home.freeLesson')} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/catalogue" className="inline-flex min-h-touch items-center rounded border border-ink px-8 font-sans text-sm font-semibold text-ink">
              {t('home.explore')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
