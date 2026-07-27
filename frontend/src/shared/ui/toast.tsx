import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore, type ToastItem } from './toast-store'

function Toast({ item }: { item: ToastItem }) {
  const removeToast = useToastStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(item.id)
    }, item.duration ?? 4000)

    return () => clearTimeout(timer)
  }, [item, removeToast])

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden />,
    error: <AlertCircle className="h-5 w-5 text-danger shrink-0" aria-hidden />,
    info: <Info className="h-5 w-5 text-blue shrink-0" aria-hidden />,
    warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0" aria-hidden />,
  }

  const borders = {
    success: 'border-l-4 border-l-success',
    error: 'border-l-4 border-l-danger',
    info: 'border-l-4 border-l-blue',
    warning: 'border-l-4 border-l-warning',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg bg-paper p-4 shadow-lg border border-line ${borders[item.type]}`}
      role="status"
      aria-live="polite"
    >
      {icons[item.type]}
      <div className="flex-1 text-sm">
        {item.title && <p className="font-semibold text-ink">{item.title}</p>}
        <p className="font-sans text-ink-muted leading-snug">{item.message}</p>
      </div>
      <button
        onClick={() => removeToast(item.id)}
        className="rounded p-1 text-ink-faint hover:bg-line hover:text-ink transition-colors"
        aria-label="Fermer la notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2 p-4 sm:max-w-md"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}
