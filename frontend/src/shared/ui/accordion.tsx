import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixAccordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export const Accordion = RadixAccordion.Root

export const AccordionItem = forwardRef<
  ElementRef<typeof RadixAccordion.Item>,
  ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Item ref={ref} className={cn('border-b border-line', className)} {...props} />
))
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = forwardRef<
  ElementRef<typeof RadixAccordion.Trigger>,
  ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      ref={ref}
      className={cn(
        'group flex min-h-touch flex-1 items-start justify-between gap-4 py-5 text-left font-sans text-base font-extrabold tracking-tight text-ink transition-colors hover:text-accent-ink',
        className,
      )}
      {...props}
    >
      {children}
      <Plus className="mt-1 h-4 w-4 shrink-0 text-accent-ink transition-transform duration-brand ease-brand group-data-[state=open]:rotate-45" aria-hidden />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = forwardRef<
  ElementRef<typeof RadixAccordion.Content>,
  ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className={cn(
      'overflow-hidden font-sans text-sm leading-relaxed text-ink-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className,
    )}
    {...props}
  >
    <div className="pb-5">{children}</div>
  </RadixAccordion.Content>
))
AccordionContent.displayName = 'AccordionContent'
