import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from '@/shared/ui'
import { uploadAvatar } from '../api/avatarApi'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ACCEPTED = 'image/jpeg,image/png,image/webp'

interface AvatarUploadProps {
  avatarUrl?: string | null
  initials: string
  onSuccess: (url: string) => void
}

export function AvatarUpload({ avatarUrl, initials, onSuccess }: AvatarUploadProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('La photo doit faire moins de 5 Mo.')
      return
    }
    setLoading(true)
    try {
      const newUrl = await uploadAvatar(file)
      onSuccess(newUrl)
      toast.success('Photo de profil mise à jour.')
    } catch {
      toast.error('Erreur lors du téléchargement de la photo.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label="Changer la photo de profil"
        onClick={() => inputRef.current?.click()}
        className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-line bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        disabled={loading}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif text-h2 text-paper">
            {initials}
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <Loader2 className="h-6 w-6 animate-spin text-paper" aria-hidden="true" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="font-sans text-sm text-accent underline-offset-2 hover:underline disabled:opacity-50"
      >
        Changer la photo
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
