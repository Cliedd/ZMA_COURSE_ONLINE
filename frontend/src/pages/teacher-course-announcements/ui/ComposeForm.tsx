import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'

export function ComposeForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (v: string) => void
  isPending: boolean
}) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="announcement-body" className="sr-only">
        Contenu de l&apos;annonce
      </label>
      <textarea
        id="announcement-body"
        rows={4}
        placeholder="Rédigez votre annonce…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded border border-line bg-surface px-4 py-3 font-sans text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
      />
      <button
        type="submit"
        disabled={!value.trim() || isPending}
        className="inline-flex min-h-touch items-center gap-2 rounded bg-accent px-5 font-sans text-sm font-semibold text-scene disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        Publier l&apos;annonce
      </button>
    </form>
  )
}
