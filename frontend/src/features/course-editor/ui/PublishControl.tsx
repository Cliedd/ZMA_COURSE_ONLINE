import { Badge, Button } from '@/shared/ui'

export interface PublishControlProps {
  published: boolean
  onTogglePublish: () => void
  onDelete: () => void
  pending?: boolean
}

/** Publication et suppression du cours, avec confirmation native avant suppression. */
export function PublishControl({ published, onTogglePublish, onDelete, pending }: PublishControlProps) {
  const handleDelete = () => {
    if (window.confirm('Supprimer définitivement ce cours ? Cette action est irréversible.')) {
      onDelete()
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="font-sans text-sm text-ink-muted">Statut :</span>
        <Badge tone={published ? 'success' : 'default'}>{published ? 'Publié' : 'Brouillon'}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" disabled={pending} onClick={onTogglePublish}>
          {published ? 'Dépublier' : 'Publier'}
        </Button>
        <Button type="button" variant="danger" disabled={pending} onClick={handleDelete}>
          Supprimer le cours
        </Button>
      </div>
    </div>
  )
}
