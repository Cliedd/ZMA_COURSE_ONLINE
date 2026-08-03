import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from 'framer-motion'
import { useUserCount } from '@/entities/user'
import { BlurFade, Skeleton } from '@/shared/ui'

const COUNT_UP_DURATION_MS = 1400

/** Anime un compte de 0 (ou de la précédente valeur affichée) jusqu'à `target`
 * une fois l'élément visible. Respecte `prefers-reduced-motion` : saute
 * directement à la valeur finale. */
function useCountUp(target: number, active: boolean): number {
  const prefersReducedMotion = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion) {
      setValue(target)
      return
    }

    let raf = 0
    let start: number | null = null
    const from = 0

    // Le timestamp reçu par le callback rAF peut avoir une origine différente de
    // `performance.now()` appelé en dehors de ce callback (observé en environnement
    // de test) : on ancre `start` sur le premier timestamp rAF plutôt qu'un appel
    // externe, pour ne jamais obtenir un `elapsed` négatif.
    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const progress = Math.min(1, Math.max(0, elapsed / COUNT_UP_DURATION_MS))
      // easeOutCubic — démarre vite, ralentit en douceur vers la valeur finale.
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, prefersReducedMotion])

  return value
}

/**
 * Compteur de preuve sociale pour la page d'accueil, avant le lancement des
 * cours : met en avant le nombre réel d'inscrits (aucune donnée inventée).
 * L'animation de comptage démarre dès que la donnée arrive (montée du
 * composant) ; l'apparition visuelle (fondu) reste liée au scroll via
 * `BlurFade`. Section autonome, pensée pour cohabiter avec un futur compte à
 * rebours de lancement — non composée dans HomePage ici, à intégrer par
 * l'appelant.
 */
export function SignupCounterSection() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useUserCount()

  const target = data?.count ?? 0
  const animated = useCountUp(target, !isPending && !isError)
  const displayValue = new Intl.NumberFormat().format(animated)

  return (
    <section className="border-t border-line bg-paper">
      <div className="container flex flex-col items-center gap-3 py-20 text-center">
        <BlurFade>
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
            {t('home.signupCounter.eyebrow')}
          </p>
          <div className="mx-auto mt-3 h-px w-11 bg-accent" />
        </BlurFade>

        <BlurFade delay={0.06}>
          {isPending ? (
            <Skeleton className="mt-6 h-[clamp(3.5rem,10vw,7rem)] w-64 rounded-[2px]" />
          ) : isError ? (
            <p className="mt-6 font-sans text-body text-ink-muted">{t('home.signupCounter.error')}</p>
          ) : (
            <p
              className="mt-4 font-serif text-[clamp(3.5rem,10vw,7rem)] leading-none text-ink tabular-nums"
              aria-live="polite"
            >
              {displayValue}
              <span className="text-accent-ink">+</span>
            </p>
          )}
        </BlurFade>

        <BlurFade delay={0.1}>
          <p className="mt-4 font-serif text-h2 text-ink">{t('home.signupCounter.title')}</p>
          <p className="mx-auto mt-3 max-w-lg font-sans text-body leading-relaxed text-ink-muted">
            {t('home.signupCounter.body')}
          </p>
        </BlurFade>
      </div>
    </section>
  )
}
