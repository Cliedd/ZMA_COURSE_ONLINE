import { useState } from 'react'
import { cn } from '../../lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackGradient?: string
  containerClassName?: string
}

/**
 * Image with animated skeleton placeholder while loading.
 * On error shows a gradient fallback (no broken image icon).
 */
export const LazyImage = ({
  src,
  alt = '',
  className,
  containerClassName,
  fallbackGradient = 'linear-gradient(135deg, #1a3a6e 0%, #06111f 100%)',
  ...props
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div
      className={cn('relative overflow-hidden', containerClassName)}
      style={error ? { background: fallbackGradient } : undefined}
    >
      {/* Skeleton shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}

      {!error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  )
}
