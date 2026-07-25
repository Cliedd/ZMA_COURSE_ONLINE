import { IMAGE_WIDTHS } from '@/design/images/manifest'
import type { ImageEntry } from '@/design/images/manifest'
import { cn } from '@/lib/cn'

export interface PictureProps {
  image: ImageEntry
  /** Indication de largeur pour le navigateur, ex. "100vw" ou "(min-width:768px) 400px, 100vw". */
  sizes: string
  /** Réservé à l'image du LCP — une seule par page. */
  priority?: boolean
  /** Remplace le texte du manifeste. Chaîne vide = image décorative. */
  alt?: string
  className?: string
}

function srcSet(base: string, extension: string): string {
  return IMAGE_WIDTHS.map((w) => `/images/${base}-${w}.${extension} ${w}w`).join(', ')
}

export function Picture({ image, sizes, priority = false, alt, className }: PictureProps) {
  const largest = IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.base, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.base, 'webp')} sizes={sizes} />
      <img
        src={`/images/${image.base}-${largest}.jpg`}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={cn('h-auto max-w-full object-cover', className)}
      />
    </picture>
  )
}
