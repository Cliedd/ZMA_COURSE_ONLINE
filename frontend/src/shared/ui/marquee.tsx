import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  reverse?: boolean
  pauseOnHover?: boolean
  children: ReactNode
  /** Nombre de répétitions du contenu — assure un défilement continu sans trou. */
  repeat?: number
}

/** Bande défilante en boucle, ported du design du collaborateur (magicui/marquee). */
export function Marquee({ className, reverse = false, pauseOnHover = false, children, repeat = 4, ...props }: MarqueeProps) {
  return (
    <div {...props} className={cn('group flex gap-[--gap] overflow-hidden [--gap:1rem]', className)}>
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn(
            'flex shrink-0 animate-marquee flex-row justify-around gap-[--gap]',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
