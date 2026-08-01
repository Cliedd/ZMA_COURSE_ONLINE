import { Users2, Mic2, GraduationCap, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FEATURES = [
  { key: 'feature1', icon: Mic2, chipBg: 'bg-dept-1/15', chipText: 'text-dept-1' },
  { key: 'feature2', icon: Users2, chipBg: 'bg-dept-2/15', chipText: 'text-dept-2' },
  { key: 'feature3', icon: Award, chipBg: 'bg-dept-5/15', chipText: 'text-dept-5' },
  { key: 'feature4', icon: GraduationCap, chipBg: 'bg-dept-4/15', chipText: 'text-dept-4' },
] as const

/** Grille des 4 raisons de choisir ZMA, registre « scène » (sombre), comme le collaborateur. */
export function WhyChooseUsSection() {
  const { t } = useTranslation()

  return (
    <section data-theme="dark" className="bg-scene py-14 text-scene-ink sm:py-20 md:py-24">
      <div className="container">
        <div className="max-w-md">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-scene-accent">
            {t('home.whyChooseUs.eyebrow')}
          </p>
          <h2 className="mt-3 font-serif text-h1 text-scene-ink">{t('home.whyChooseUs.title')}</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px bg-scene-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon, chipBg, chipText }) => (
            <div key={key} className="bg-scene p-6 sm:p-8">
              <div className={`grid h-10 w-10 place-items-center rounded ${chipBg} ${chipText}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-serif text-h3 text-scene-ink">
                {t(`home.whyChooseUs.features.${key}Title`)}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-scene-ink/65">
                {t(`home.whyChooseUs.features.${key}Body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
