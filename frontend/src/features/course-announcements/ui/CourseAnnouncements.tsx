/**
 * Student-facing announcement list embedded in the CoursePlayer.
 * Read-only — teachers post from /teacher/courses/:courseId/announcements.
 */
import { Megaphone, Loader2 } from 'lucide-react'
import { useCourseRoom, useCourseAnnouncements } from '@/entities/announcement'
import type { Announcement } from '@/entities/announcement'

function AnnouncementItem({ msg }: { msg: Announcement }) {
  const date = new Date(msg.sentAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <li className="rounded border border-line bg-surface p-4">
      <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-muted">
        {msg.senderName}&nbsp;&mdash;&nbsp;{date}
      </p>
      <p className="mt-2 font-sans text-sm text-ink whitespace-pre-wrap">
        {msg.content ?? ''}
      </p>
    </li>
  )
}

export function CourseAnnouncements({ courseId }: { courseId: string }) {
  const { data: room, isLoading: roomLoading } = useCourseRoom(courseId)
  const { data: messages = [], isLoading: msgsLoading } = useCourseAnnouncements(room?.id)

  const isLoading = roomLoading || msgsLoading

  const sorted = [...messages]
    .filter((m) => !m.deletedAt)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  return (
    <div className="p-6">
      <h2 className="font-serif text-h3 text-ink flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-accent shrink-0" aria-hidden />
        Annonces
      </h2>

      {isLoading ? (
        <div className="flex items-center gap-2 text-ink-muted font-sans text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Chargement…
        </div>
      ) : sorted.length === 0 ? (
        <p className="font-sans text-sm text-ink-muted py-4">
          Aucune annonce pour ce cours pour l&apos;instant.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((msg) => (
            <AnnouncementItem key={msg.id} msg={msg} />
          ))}
        </ul>
      )}
    </div>
  )
}
