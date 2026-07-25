import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const badge = cva('inline-flex items-center font-sans text-eyebrow font-bold uppercase', {
  variants: {
    tone: {
      default: 'text-ink-muted',
      // --accent mesure 2,53:1 sur fond clair : jamais pour du texte (spec § 5.1)
      accent: 'text-accent-ink',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    },
  },
  defaultVariants: { tone: 'default' },
})

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone, ...props }, ref) => (
  <span ref={ref} className={cn(badge({ tone }), className)} {...props} />
))
Badge.displayName = 'Badge'
