import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type DivProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col border border-line bg-surface', className)} {...props} />
))
Card.displayName = 'Card'

export const CardMedia = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('overflow-hidden', className)} {...props} />
))
CardMedia.displayName = 'CardMedia'

export const CardBody = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex-1 p-4', className)} {...props} />
))
CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<HTMLDivElement, DivProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-baseline justify-between border-t border-line p-4', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'
