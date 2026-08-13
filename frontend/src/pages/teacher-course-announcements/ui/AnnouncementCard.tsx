import { Trash2, Loader2 } from 'lucide-react'
import type { Announcement } from '@/entities/announcement'

export function AnnouncementCard({
  msg,
  onDelete,
  deleting,
}: {
  msg: Announcement
  onDelete: () => void
  deleting: boolean
}) {
  const date = new Date(msg.sentAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="rounded border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-muted">
            {msg.senderName}&nbsp;&mdash;&nbsp;{date}
          </p>
          <p className="mt-2 font-sans text-body text-ink whitespace-pre-wrap">
            {msg.content ?? ''}
          </p>
        </div>
        <button
          type="button"
          aria-label="Supprimer l'annonce"
          onClick={onDelete}
          disabled={deleting}
          className="shrink-0 rounded p-1.5 text-ink-muted hover:text-danger disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    </article>
  )
}
