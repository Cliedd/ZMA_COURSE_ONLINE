import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? 'Activer le thème sombre' : 'Activer le thème clair'}
      className="grid min-h-touch min-w-touch place-items-center rounded border border-line text-ink-muted transition-colors duration-brand ease-brand hover:text-ink"
    >
      {resolved === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  )
}
