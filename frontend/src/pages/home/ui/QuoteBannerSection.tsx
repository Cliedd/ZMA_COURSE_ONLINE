import { useTranslation } from 'react-i18next'
import { Marquee, Picture } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'

const GALLERY = [
  IMAGES.heroStage, IMAGES.heroEnsemble, IMAGES.classroom, IMAGES.campus,
  IMAGES.campusHallway, IMAGES.levelBeginner, IMAGES.levelIntermediate, IMAGES.levelAdvanced,
  IMAGES.studioDesk, IMAGES.studioMixing, IMAGES.score, IMAGES.ensemble,
]
const GALLERY_REVERSE = [...GALLERY].reverse()

/** Bandeau citation sur photo + bande photo défilante, registre « scène ». Citation laïque et originale (home.quote.*). */
export function QuoteBannerSection() {
  const { t } = useTranslation()

  return (
    <>
      <section data-theme="dark" className="relative flex min-h-[420px] items-center overflow-hidden bg-scene sm:min-h-[500px]">
        <Picture
          image={IMAGES.studioMixing}
          alt=""
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-scene via-scene/55 to-scene/15" />
        <div className="relative z-10 max-w-3xl px-6 py-14 sm:px-10 sm:py-20">
          <span aria-hidden className="block font-serif italic leading-[0.55] text-scene-accent text-[5rem]">
            &#8220;
          </span>
          <p className="mt-3.5 font-serif text-h2 leading-snug tracking-tight text-scene-ink">
            {t('home.quote.text')}
          </p>
          <p className="mt-6 font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-scene-ink/70">
            {t('home.quote.attribution')}
          </p>
        </div>
      </section>

      <div className="space-y-2 overflow-hidden bg-paper py-2" aria-hidden="true">
        <Marquee pauseOnHover className="[--gap:0.75rem]">
          {GALLERY.map((image, i) => (
            <Picture key={i} image={image} alt="" sizes="280px" className="h-[130px] w-[190px] shrink-0 rounded-sm object-cover sm:h-[190px] sm:w-[280px]" />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--gap:0.75rem]">
          {GALLERY_REVERSE.map((image, i) => (
            <Picture key={i} image={image} alt="" sizes="280px" className="h-[130px] w-[190px] shrink-0 rounded-sm object-cover sm:h-[190px] sm:w-[280px]" />
          ))}
        </Marquee>
      </div>
    </>
  )
}
