/** Barre de progression native, accessible, aux couleurs de marque. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  return <progress className={`progress ${className ?? ''}`} value={pct} max={100} aria-label={`${pct}%`} />
}
