import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAuthStore } from '@/entities/session'
import { useMyProfile, useUpdateProfile } from '@/entities/user'
import { AvatarUpload } from '@/features/profile-editor/ui/AvatarUpload'
import { Input, Skeleton, toast } from '@/shared/ui'

function initials(first: string | null, last: string | null, email: string | null): string {
  if (first || last) {
    return `${(first ?? '').charAt(0)}${(last ?? '').charAt(0)}`.toUpperCase()
  }
  return (email ?? '?').charAt(0).toUpperCase()
}

export function TeacherSettingsPage() {
  const { t } = useTranslation()
  const email = useAuthStore((s) => s.email)
  const role = useAuthStore((s) => s.role)

  const { data: profile, isLoading } = useMyProfile()
  const updateProfile = useUpdateProfile()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '')
      setLastName(profile.lastName ?? '')
      setBio(profile.bio ?? '')
      setPhoneNumber(profile.phoneNumber ?? '')
      setAvatarUrl(profile.avatarUrl ?? null)
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({
        firstName: firstName || null,
        lastName: lastName || null,
        bio: bio || null,
        phoneNumber: phoneNumber || null,
        avatarUrl,
      })
      toast.success(t('teacherSettings.saveSuccess'))
    } catch {
      toast.error(t('teacherSettings.saveError'))
    }
  }

  const userInitials = initials(
    profile?.firstName ?? null,
    profile?.lastName ?? null,
    email,
  )

  const breadcrumb = [
    { label: t('teacherDashboard.breadcrumb'), to: '/teacher' },
    { label: t('teacherSettings.breadcrumb') },
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumb} />
      <div className="container max-w-2xl py-8">
        <h1 className="font-serif text-h1 text-ink">{t('teacherSettings.title')}</h1>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-6">
            <div className="flex justify-center">
              <AvatarUpload
                avatarUrl={avatarUrl}
                initials={userInitials}
                onSuccess={(url) => setAvatarUrl(url)}
              />
            </div>

            <section className="border border-line bg-surface p-6">
              <h2 className="font-serif text-h3 text-ink">{t('teacherSettings.sectionAccount')}</h2>
              <dl className="mt-3 space-y-2 font-sans text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">{t('teacherSettings.email')}</dt>
                  <dd className="text-ink">{email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">{t('teacherSettings.role')}</dt>
                  <dd className="text-ink capitalize">{role?.toLowerCase()}</dd>
                </div>
              </dl>
            </section>

            <section className="border border-line bg-surface p-6">
              <h2 className="font-serif text-h3 text-ink">{t('teacherSettings.sectionProfile')}</h2>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block font-sans text-sm text-ink-muted">{t('teacherSettings.firstName')}</span>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('teacherSettings.firstNamePlaceholder')}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-sans text-sm text-ink-muted">{t('teacherSettings.lastName')}</span>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('teacherSettings.lastNamePlaceholder')}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block font-sans text-sm text-ink-muted">{t('teacherSettings.bio')}</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    placeholder={t('teacherSettings.bioPlaceholder')}
                    className="min-h-touch w-full rounded border border-line bg-surface px-3 py-2 font-sans text-body text-ink placeholder:text-ink-faint"
                  />
                  <span className="mt-1 block font-sans text-xs text-ink-faint">
                    {bio.length}/1000
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1 block font-sans text-sm text-ink-muted">{t('teacherSettings.phone')}</span>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t('teacherSettings.phonePlaceholder')}
                  />
                </label>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="inline-flex min-h-touch items-center rounded bg-ink px-6 font-sans text-sm font-semibold text-paper disabled:opacity-50"
              >
                {updateProfile.isPending ? t('teacherSettings.saving') : t('teacherSettings.save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
