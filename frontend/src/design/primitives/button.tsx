import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded font-sans font-semibold transition-colors duration-brand ease-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-paper hover:opacity-90',
        secondary: 'border border-ink text-ink hover:bg-ink hover:text-paper',
        ghost: 'text-ink-muted hover:bg-line/50 hover:text-ink',
        danger: 'bg-danger text-paper hover:opacity-90',
      },
      size: {
        sm: 'min-h-touch px-3 text-sm',
        md: 'min-h-touch px-5 text-sm',
        lg: 'min-h-touch px-7 text-body',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button'
    return <Component ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  },
)
Button.displayName = 'Button'
