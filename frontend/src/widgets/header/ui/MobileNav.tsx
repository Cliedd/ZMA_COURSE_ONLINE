import { Menu as MenuIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/shared/ui'
import { DEPARTMENTS, LEVELS } from '@/shared/config/navigation'
import { useAuthStore } from '@/entities/session'

/** Le tiroir que le frontend actuel n'a jamais eu : sur mobile, aucune navigation n'existait. */
export function MobileNav() {
  const { t } = useTranslation()
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <Dialog>
      <DialogTrigger
        aria-label={t('nav.openMenu')}
        className="grid place-items-center rounded border border-line text-ink md:hidden"
      >
        <MenuIcon className="h-5 w-5" aria-hidden />
      </DialogTrigger>

      <DialogContent title={t('nav.menu')}>
        <nav aria-label={t('nav.menu')} className="flex h-full flex-col">
          <p className="eyebrow px-4 pt-4">{t('nav.catalogue')}</p>
          <ul>
            {DEPARTMENTS.map((entry) => (
              <li key={entry.value}>
                <DialogClose asChild>
                  <Link to={entry.to} className="flex min-h-touch items-center border-b border-line px-4 text-body text-ink">
                    {t(entry.labelKey)}
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>

          <p className="eyebrow px-4 pt-5">{t('nav.diplomas')}</p>
          <ul>
            {LEVELS.map((entry) => (
              <li key={entry.value}>
                <DialogClose asChild>
                  <Link to={entry.to} className="flex min-h-touch items-center border-b border-line px-4 text-body text-ink">
                    {t(entry.labelKey)}
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex gap-2 border-t border-line p-4">
            {authenticated ? (
              <DialogClose asChild>
                <Link to="/dashboard" className="flex min-h-touch flex-1 items-center justify-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper">
                  {t('nav.mySpace')}
                </Link>
              </DialogClose>
            ) : (
              <>
                <DialogClose asChild>
                  <Link to="/auth/login" className="flex min-h-touch flex-1 items-center justify-center rounded border border-ink px-4 font-sans text-sm font-semibold text-ink">
                    {t('nav.login')}
                  </Link>
                </DialogClose>
                <DialogClose asChild>
                  <Link to="/auth/register" className="flex min-h-touch flex-1 items-center justify-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper">
                    {t('nav.register')}
                  </Link>
                </DialogClose>
              </>
            )}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  )
}
