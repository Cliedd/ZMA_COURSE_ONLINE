import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/shared/ui'
import { DEPARTMENTS, LEVELS } from '@/shared/config/navigation'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from '@/shared/theme'
import { useAuthStore } from '@/entities/session'

function TrainingsMenu() {
  const { t } = useTranslation()
  return (
    <Menu>
      <MenuTrigger className="font-semibold">
        {t('nav.catalogue')}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </MenuTrigger>
      <MenuContent className="min-w-80">
        {[...DEPARTMENTS, ...LEVELS].map((entry) => (
          <MenuItem key={entry.label} asChild>
            <Link to={entry.to}>
              <span className="text-ink">{entry.label}</span>
              <span className="ml-auto text-sm text-ink-faint">{entry.hint}</span>
            </Link>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export function Header() {
  const { t } = useTranslation()
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-paper"
      >
        {t('nav.skipToContent')}
      </a>

      <div className="container flex min-h-touch items-center gap-5 py-2">
        <Link to="/" className="shrink-0" aria-label={t('brand.name')}>
          <img src="/brand/ztf-logo.png" alt={t('brand.name')} width={132} height={44} className="h-11 w-auto" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          <TrainingsMenu />
          <Link to="/teachers" className="flex min-h-touch items-center rounded px-3 font-sans text-sm font-semibold text-ink">
            {t('nav.teachers')}
          </Link>
          <Link to="/certificates/verify" className="flex min-h-touch items-center rounded px-3 font-sans text-sm font-semibold text-ink">
            {t('nav.diplomas')}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {authenticated ? (
            <Link to="/dashboard" className="flex min-h-touch items-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper">
              {t('nav.mySpace')}
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="hidden min-h-touch items-center rounded border border-ink px-4 font-sans text-sm font-semibold text-ink sm:flex">
                {t('nav.login')}
              </Link>
              <Link to="/auth/register" className="hidden min-h-touch items-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper sm:flex">
                {t('nav.register')}
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
