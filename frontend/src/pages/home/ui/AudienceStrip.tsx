import { useTranslation } from 'react-i18next'
import { Picture } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'

const DEPT_BG = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

const TILES = [
  { key: 'children', image: IMAGES.levelBeginner, deptBg: DEPT_BG[0] },
  { key: 'teenagers', image: IMAGES.ensemble, deptBg: DEPT_BG[1] },
  { key: 'adults', image: IMAGES.levelAdvanced, deptBg: DEPT_BG[4] },
  { key: 'private', image: IMAGES.levelIntermediate, deptBg: DEPT_BG[2] },
] as const

/** Bande de 4 tuiles « pour qui » — enfants / ados / adultes / cours particuliers. */
export function AudienceStrip() {
  const { t } = useTranslation()

  return (
    <section className="border-y border-line" aria-labelledby="audience-heading">
      <h2 id="audience-heading" className="sr-only">
        {t('home.audience.title')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map(({ key, image, deptBg }) => (
          <div key={key} className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden p-6 sm:min-h-[320px] sm:p-8">
            <Picture
              image={image}
              alt=""
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-scene/90 via-scene/25 to-transparent" />
            <span className={`absolute right-6 top-6 h-2.5 w-2.5 rounded-full ${deptBg}`} aria-hidden />
            <h3 className="relative font-serif text-h3 leading-none text-scene-ink">
              {t(`home.audience.items.${key}.title`)}
            </h3>
            <p className="relative mt-3 font-sans text-sm leading-relaxed text-scene-ink/85">
              {t(`home.audience.items.${key}.body`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
