import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Occupe la place finale du contenu : aucun décalage de mise en page au chargement. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-testid="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse bg-line', className)}
      {...props}
    />
  )
}
