import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlurFade } from '@/shared/ui'

/**
 * Date de lancement fixe des cours, codée en dur.
 *
 * Calculée comme "maintenant + 60 jours (1440 heures)" au moment de l'implémentation
 * de ce composant (2026-08-02), PAS recalculée à chaque rendu / pour chaque visiteur :
 * un calcul relatif au chargement de page ferait dériver l'échéance dans le temps et
 * le compte à rebours n'atteindrait jamais réellement zéro pour des visiteurs arrivant
 * à des moments différents. Le lancement est un instant fixe et partagé par tous.
 */
const LAUNCH_AT = new Date('2026-10-01T00:00:00Z')

export interface CountdownBreakdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  reached: boolean
}

/** Décompose l'écart entre `now` et `target` en jours/heures/minutes/secondes,
 * plafonné à zéro une fois l'échéance atteinte ou dépassée. Fonction pure, testée
 * indépendamment du rendu et du timer. */
export function computeCountdown(target: Date, now: Date): CountdownBreakdown {
  const diffMs = target.getTime() - now.getTime()

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, reached: true }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, reached: false }
}

function useCountdown(target: Date): CountdownBreakdown {
  const [breakdown, setBreakdown] = useState(() => computeCountdown(target, new Date()))

  useEffect(() => {
    const id = window.setInterval(() => {
      setBreakdown(computeCountdown(target, new Date()))
    }, 1000)
    return () => window.clearInterval(id)
  }, [target])

  return breakdown
}

const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const

/** Section « compte à rebours » de la page d'accueil : annonce l'ouverture prochaine
 * de la boutique de cours, avant tout lancement réel. Placée juste après
 * `SignupCounterSection`, tout en haut de la page (juste après le hero), pour que
 * l'urgence soit visible sans scroll. */
export function LaunchCountdownSection() {
  const { t } = useTranslation()
  const { days, hours, minutes, seconds, reached } = useCountdown(LAUNCH_AT)

  return (
    <section data-theme="dark" className="bg-scene py-14 text-scene-ink sm:py-20 md:py-24">
      <div className="container flex flex-col items-center text-center">
        <BlurFade>
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-scene-accent">
            {t('home.countdown.eyebrow')}
          </p>
          <h2 className="mt-3 font-serif text-h1 text-scene-ink">
            {reached ? t('home.countdown.readyTitle') : t('home.countdown.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-body leading-relaxed text-scene-ink/65">
            {t('home.countdown.body')}
          </p>
        </BlurFade>

        <BlurFade delay={0.08} className="mt-10 w-full max-w-2xl">
          <div
            className="grid grid-cols-4 gap-px bg-scene-ink/15"
            role="group"
            aria-label={t('home.countdown.accessibleLabel')}
          >
            {UNITS.map((unit) => (
              <div key={unit} className="flex flex-col items-center bg-scene px-2 py-6 sm:px-4 sm:py-8">
                <span
                  className="font-serif text-h1 tabular-nums text-scene-ink"
                  aria-live="off"
                  data-testid={`countdown-${unit}`}
                >

                  {String({ days, hours, minutes, seconds }[unit]).padStart(2, '0')}
                </span>
                <span className="mt-2 font-sans text-xs font-bold uppercase tracking-[0.16em] text-scene-ink/60">
                  {t(`home.countdown.units.${unit}`)}
                </span>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
