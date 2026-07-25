import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as RadixMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/shared/lib/cn'

export const Menu = RadixMenu.Root

export const MenuTrigger = forwardRef<
  ElementRef<typeof RadixMenu.Trigger>,
  ComponentPropsWithoutRef<typeof RadixMenu.Trigger>
>(({ className, ...props }, ref) => (
  <RadixMenu.Trigger
    ref={ref}
    className={cn('inline-flex min-h-touch items-center gap-2 rounded px-2 font-sans text-sm text-ink', className)}
    {...props}
  />
))
MenuTrigger.displayName = 'MenuTrigger'

export const MenuContent = forwardRef<
  ElementRef<typeof RadixMenu.Content>,
  ComponentPropsWithoutRef<typeof RadixMenu.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RadixMenu.Portal>
    <RadixMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('z-50 min-w-52 border border-line bg-surface p-1 shadow-overlay', className)}
      {...props}
    />
  </RadixMenu.Portal>
))
MenuContent.displayName = 'MenuContent'

export const MenuItem = forwardRef<
  ElementRef<typeof RadixMenu.Item>,
  ComponentPropsWithoutRef<typeof RadixMenu.Item>
>(({ className, ...props }, ref) => (
  <RadixMenu.Item
    ref={ref}
    className={cn(
      'flex min-h-touch cursor-pointer items-center gap-2 rounded px-3 font-sans text-sm text-ink-muted outline-none',
      'data-[highlighted]:bg-line/50 data-[highlighted]:text-ink',
      className,
    )}
    {...props}
  />
))
MenuItem.displayName = 'MenuItem'
