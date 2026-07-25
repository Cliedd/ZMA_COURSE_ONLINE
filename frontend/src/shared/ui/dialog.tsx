import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export const Dialog = RadixDialog.Root
export const DialogClose = RadixDialog.Close

export const DialogTrigger = forwardRef<
  ElementRef<typeof RadixDialog.Trigger>,
  ComponentPropsWithoutRef<typeof RadixDialog.Trigger>
>(({ className, ...props }, ref) => (
  <RadixDialog.Trigger ref={ref} className={cn('min-h-touch min-w-touch', className)} {...props} />
))
DialogTrigger.displayName = 'DialogTrigger'

interface DialogContentProps extends ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  /** Nom accessible du dialogue. Obligatoire : sans lui, le dialogue est anonyme. */
  title: string
  /** Masque le titre visuellement tout en le laissant aux lecteurs d'écran. */
  hideTitle?: boolean
  children: ReactNode
}

/**
 * Radix fournit le piège de focus, la fermeture par Échap, le verrouillage
 * du défilement de fond et les attributs ARIA. Rien de tout cela n'est réécrit ici.
 */
export const DialogContent = forwardRef<ElementRef<typeof RadixDialog.Content>, DialogContentProps>(
  ({ className, title, hideTitle = false, children, ...props }, ref) => (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-scene/60" />
      <RadixDialog.Content
        ref={ref}
        className={cn('fixed inset-0 z-50 flex flex-col bg-paper shadow-overlay', className)}
        {...props}
        // Ces dialogues n'ont pas de description : on le déclare explicitement à Radix,
        // qui sinon référence un id de description inexistant et avertit en console.
        aria-describedby={undefined}
      >
        <div className="flex items-center justify-between border-b border-line p-3">
          <RadixDialog.Title className={cn('font-serif text-h3 text-ink', hideTitle && 'sr-only')}>
            {title}
          </RadixDialog.Title>
          <RadixDialog.Close
            aria-label="Fermer"
            className="grid min-h-touch min-w-touch place-items-center rounded border border-line text-ink-muted"
          >
            <X className="h-4 w-4" aria-hidden />
          </RadixDialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
)
DialogContent.displayName = 'DialogContent'
