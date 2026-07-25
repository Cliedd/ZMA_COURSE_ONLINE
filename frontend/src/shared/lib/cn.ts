import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge ne connaît pas nos tailles de police personnalisées (tokens de la tâche 3) :
// sans cet ajout, `text-eyebrow` est classé comme une couleur de texte et se fait écraser
// par toute classe `text-{tone}` combinée (ex. Badge tone="accent").
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-display', 'text-h1', 'text-h2', 'text-h3', 'text-body', 'text-eyebrow'],
    },
  },
})

export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
