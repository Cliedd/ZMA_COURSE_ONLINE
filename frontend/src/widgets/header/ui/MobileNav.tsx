import { Menu as MenuIcon, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/shared/ui'
import { DEPARTMENTS, LEVELS } from '@/shared/config/navigation'
import { useAuthStore } from '@/entities/session'

/** Puces d'accent décoratives, une par département — mêmes couleurs que le méga-menu desktop. */
const DEPT_DOT_CLASSES = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5']

/** Le tiroir que le frontend actuel n'a jamais eu : sur mobile, aucune navigation n'existait. */
export function MobileNav() {
  const { t } = useTranslation()
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <Dialog>
      <DialogTrigger
        aria-label={t('nav.openMenu')}
        className="grid place-items-center rounded border border-line text-ink transition-colors duration-brand ease-brand hover:bg-ink hover:text-paper md:hidden"
      >
        <MenuIcon className="h-5 w-5" aria-hidden />
      </DialogTrigger>

      <DialogContent title={t('nav.menu')}>
        <nav aria-label={t('nav.menu')} className="flex h-full flex-col overflow-y-auto bg-paper">
          <p className="eyebrow px-4 pt-5 text-ink-faint">{t('nav.catalogue')}</p>
          <ul>
            {DEPARTMENTS.map((entry, i) => (
              <li key={entry.value}>
                <DialogClose asChild>
                  <Link
                    to={entry.to}
                    className="flex min-h-touch items-center gap-3 border-b border-line px-4 font-sans text-body text-ink transition-colors duration-brand ease-brand active:bg-surface"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${DEPT_DOT_CLASSES[i % DEPT_DOT_CLASSES.length]}`} aria-hidden />
                    <span className="flex-1">{t(entry.labelKey)}</span>
                    <span className="text-sm text-ink-faint">{t(entry.hintKey)}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>

          <p className="eyebrow px-4 pt-5 text-ink-faint">{t('nav.diplomas')}</p>
          <ul>
            {LEVELS.map((entry) => (
              <li key={entry.value}>
                <DialogClose asChild>
                  <Link
                    to={entry.to}
                    className="flex min-h-touch items-center gap-3 border-b border-line px-4 font-sans text-body text-ink transition-colors duration-brand ease-brand active:bg-surface"
                  >
                    <span className="flex-1">{t(entry.labelKey)}</span>
                    <span className="text-sm text-ink-faint">{t(entry.hintKey)}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                  </Link>
                </DialogClose>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex gap-2 border-t border-line bg-surface p-4">
            {authenticated ? (
              <DialogClose asChild>
                <Link to="/dashboard" className="flex min-h-touch flex-1 items-center justify-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper transition-colors duration-brand ease-brand hover:bg-blue">
                  {t('nav.mySpace')}
                </Link>
              </DialogClose>
            ) : (
              <>
                <DialogClose asChild>
                  <Link to="/auth/login" className="flex min-h-touch flex-1 items-center justify-center rounded border border-ink px-4 font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:bg-ink hover:text-paper">
                    {t('nav.login')}
                  </Link>
                </DialogClose>
                <DialogClose asChild>
                  <Link to="/auth/register" className="flex min-h-touch flex-1 items-center justify-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper transition-colors duration-brand ease-brand hover:bg-blue">
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
