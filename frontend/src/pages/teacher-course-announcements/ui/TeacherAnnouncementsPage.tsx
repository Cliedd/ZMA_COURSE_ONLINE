import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Megaphone, ChevronLeft } from 'lucide-react'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { Skeleton } from '@/shared/ui'
import { useCourseById } from '@/entities/course'
import {
  useCourseRoom,
  useEnsureRoom,
  useCourseAnnouncements,
  usePostAnnouncement,
  useDeleteAnnouncement,
} from '@/entities/announcement'
import { announcementApi } from '@/entities/announcement/api/announcementApi'
import { AnnouncementCard } from './AnnouncementCard'
import { ComposeForm } from './ComposeForm'

export function TeacherAnnouncementsPage() {
  const { courseId } = useParams<{ courseId: string }>()

  const { data: course, isLoading: courseLoading } = useCourseById(courseId)
  const { data: room, isLoading: roomLoading, refetch: refetchRoom } = useCourseRoom(courseId)
  const ensureRoom = useEnsureRoom()

  const roomId = room?.id
  const { data: messages = [], isLoading: msgsLoading } = useCourseAnnouncements(roomId)
  const postAnnouncement = usePostAnnouncement(roomId)
  const deleteAnnouncement = useDeleteAnnouncement(roomId)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [postingWithCreate, setPostingWithCreate] = useState(false)

  const loading = courseLoading || roomLoading

  const handlePost = (content: string) => {
    if (roomId) {
      postAnnouncement.mutate(content)
      return
    }
    // Room doesn't exist yet — create it first, then post
    setPostingWithCreate(true)
    ensureRoom.mutate(
      { courseId: courseId ?? '', courseName: course?.title ?? '' },
      {
        onSuccess: async (newRoom) => {
          try {
            await announcementApi.postMessage(newRoom.id, content)
            await refetchRoom()
          } finally {
            setPostingWithCreate(false)
          }
        },
        onError: () => setPostingWithCreate(false),
      },
    )
  }

  const handleDelete = (messageId: string) => {
    setDeletingId(messageId)
    deleteAnnouncement.mutate(messageId, {
      onSettled: () => setDeletingId(null),
    })
  }

  const sorted = [...messages]
    .filter((m) => !m.deletedAt)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  if (loading) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Annonces du cours' }]} />
        <div className="container py-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: course?.title ?? 'Cours', to: `/teacher/courses/${courseId}/edit` },
          { label: 'Annonces' },
        ]}
      />
      <div className="container py-8">
        <div className="mb-6">
          <Link
            to={`/teacher/courses/${courseId}/edit`}
            className="inline-flex items-center gap-1 font-sans text-sm text-ink-muted hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Retour à l&apos;éditeur
          </Link>
        </div>

        <h1 className="font-serif text-h1 text-ink flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-accent shrink-0" aria-hidden />
          Annonces&nbsp;&mdash;&nbsp;{course?.title}
        </h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          Publiez des annonces visibles par tous les étudiants inscrits à ce cours.
        </p>

        <section className="mt-8 rounded border border-line bg-surface p-6">
          <h2 className="font-serif text-h3 text-ink mb-4">Nouvelle annonce</h2>
          <ComposeForm
            onSubmit={handlePost}
            isPending={postAnnouncement.isPending || postingWithCreate}
          />
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-h3 text-ink mb-4">
            Annonces publiées
            {sorted.length > 0 && (
              <span className="ml-2 font-sans text-sm font-normal text-ink-muted">
                ({sorted.length})
              </span>
            )}
          </h2>

          {msgsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="font-sans text-sm text-ink-muted py-6 text-center border border-line rounded bg-surface">
              Aucune annonce pour ce cours. Publiez-en une ci-dessus.
            </p>
          ) : (
            <div className="space-y-3">
              {sorted.map((msg) => (
                <AnnouncementCard
                  key={msg.id}
                  msg={msg}
                  onDelete={() => handleDelete(msg.id)}
                  deleting={deletingId === msg.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
