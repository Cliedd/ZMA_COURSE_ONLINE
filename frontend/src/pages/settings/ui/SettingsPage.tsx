import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAuthStore } from '@/entities/session'
import { useTheme } from '@/shared/theme'
import { cn } from '@/shared/lib/cn'
import type { Theme } from '@/shared/theme'

export function SettingsPage() {
  const { t } = useTranslation()
  const email = useAuthStore((s) => s.email)
  const role = useAuthStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme } = useTheme()

  const themes: Array<{ v: Theme; label: string }> = [
    { v: 'light', label: t('settings.themeLight') },
    { v: 'dark', label: t('settings.themeDark') },
    { v: 'system', label: t('settings.themeSystem') },
  ]

  return (
    <div>
      <Breadcrumb items={[{ label: t('settings.title') }]} />
      <div className="container max-w-2xl py-8">
        <h1 className="font-serif text-h1 text-ink">{t('settings.title')}</h1>

        <section className="mt-8 border border-line bg-surface p-6">
          <h2 className="font-serif text-h3 text-ink">{t('settings.account')}</h2>
          <dl className="mt-4 space-y-2 font-sans text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">{t('settings.email')}</dt><dd className="text-ink">{email}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{t('settings.role')}</dt><dd className="text-ink capitalize">{role?.toLowerCase()}</dd></div>
          </dl>
          <button onClick={() => { logout(); window.location.href = '/auth/login' }} className="mt-5 inline-flex min-h-touch items-center rounded border border-danger px-5 font-sans text-sm font-semibold text-danger hover:bg-danger hover:text-paper">
            {t('settings.logout')}
          </button>
        </section>

        <section className="mt-6 border border-line bg-surface p-6">
          <h2 className="font-serif text-h3 text-ink">{t('settings.appearance')}</h2>
          <p className="mt-3 font-sans text-sm text-ink-muted">{t('settings.theme')}</p>
          <div className="mt-3 flex gap-2">
            {themes.map(({ v, label }) => (
              <button key={v} onClick={() => setTheme(v)} aria-pressed={theme === v}
                className={cn('min-h-touch rounded border px-4 font-sans text-sm', theme === v ? 'border-ink bg-ink text-paper' : 'border-line text-ink-muted hover:text-ink')}>
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
