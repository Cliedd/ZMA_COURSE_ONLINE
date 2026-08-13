import { ChevronDown, User as UserIcon, BookOpen, Settings, LogOut, LayoutDashboard, Shield, Languages, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, MenuContent, MenuItem, MenuTrigger, toast } from '@/shared/ui'
import { DEPARTMENTS, LEVELS } from '@/shared/config/navigation'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from '@/shared/theme'
import { useAuthStore } from '@/entities/session'
import { setLocale, type Locale } from '@/shared/config/i18n'

/** Petit sélecteur de langue FR/EN, aligné sur le style du bascule de thème. */
function LocaleSwitch() {
  const { t, i18n: i18nInstance } = useTranslation()
  const current = (i18nInstance.language?.slice(0, 2) as Locale) || 'fr'
  const other: Locale = current === 'fr' ? 'en' : 'fr'

  return (
    <button
      type="button"
      onClick={() => setLocale(other)}
      aria-label={t('localeSwitch.switchTo', { lang: t(`localeSwitch.${other}`) })}
      title={t('localeSwitch.switchTo', { lang: t(`localeSwitch.${other}`) })}
      className="flex min-h-touch min-w-touch items-center justify-center gap-1 rounded-full border border-line px-2.5 font-sans text-xs font-bold uppercase text-ink hover:border-ink/40 transition-colors"
    >
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      {current}
    </button>
  )
}

/** Puces d'accent décoratives, une par département — jamais utilisées comme couleur de texte. */
const DEPT_DOT_CLASSES = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5']

function TrainingsMenu() {
  const { t } = useTranslation()
  return (
    <Menu>
      <MenuTrigger className="font-semibold text-ink transition-colors duration-brand ease-brand hover:text-blue data-[state=open]:text-blue">
        {t('nav.catalogue')}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </MenuTrigger>
      <MenuContent className="min-w-80">
        <p className="eyebrow px-3 pb-1 pt-2 text-ink-faint">{t('footer.trainings')}</p>
        {DEPARTMENTS.map((entry, i) => (
          <MenuItem key={entry.value} asChild>
            <Link to={entry.to}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${DEPT_DOT_CLASSES[i % DEPT_DOT_CLASSES.length]}`} aria-hidden />
              <span className="text-ink">{t(entry.labelKey)}</span>
              <span className="ml-auto text-sm text-ink-faint">{t(entry.hintKey)}</span>
            </Link>
          </MenuItem>
        ))}
        <p className="eyebrow px-3 pb-1 pt-3 text-ink-faint">{t('nav.diplomas')}</p>
        {LEVELS.map((entry) => (
          <MenuItem key={entry.value} asChild>
            <Link to={entry.to}>
              <span className="text-ink">{t(entry.labelKey)}</span>
              <span className="ml-auto text-sm text-ink-faint">{t(entry.hintKey)}</span>
            </Link>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

function UserMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.email)
  const role = useAuthStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)

  const initial = email ? email.charAt(0).toUpperCase() : 'U'

  const handleLogout = () => {
    logout()
    toast.info(t('nav.logoutToastBody'), t('nav.logoutToastTitle'))
    navigate('/')
  }

  return (
    <Menu>
      <MenuTrigger className="flex min-h-touch items-center gap-2.5 rounded-full border border-line bg-paper px-3 py-1.5 hover:border-ink/40 transition-all shadow-sm">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue font-sans text-xs font-bold text-paper shadow-inner">
          {initial}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-paper" />
        </div>
        <span className="hidden font-sans text-sm font-semibold text-ink sm:inline max-w-[120px] truncate">
          {email?.split('@')[0] || t('nav.mySpace')}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
      </MenuTrigger>

      <MenuContent className="w-56 p-1">
        <div className="border-b border-line px-3 py-2">
          <p className="font-sans text-xs font-semibold text-ink truncate">{email}</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded bg-blue/10 px-2 py-0.5 font-sans text-[10px] font-bold text-blue uppercase">
            <Shield className="h-3 w-3" />
            {role || t('nav.roleStudent')}
          </div>
        </div>

        <MenuItem asChild>
          <Link to="/dashboard" className="flex items-center gap-2.5 py-2">
            <LayoutDashboard className="h-4 w-4 text-ink-muted" />
            <span>{t('nav.dashboard')}</span>
          </Link>
        </MenuItem>

        <MenuItem asChild>
          <Link to="/my-courses" className="flex items-center gap-2.5 py-2">
            <BookOpen className="h-4 w-4 text-ink-muted" />
            <span>{t('nav.myCourses')}</span>
          </Link>
        </MenuItem>

        {role === 'TEACHER' && (
          <>
            <MenuItem asChild>
              <Link to="/teacher" className="flex items-center gap-2.5 py-2">
                <UserIcon className="h-4 w-4 text-ink-muted" />
                <span>{t('nav.teacherSpace')}</span>
              </Link>
            </MenuItem>
            <MenuItem asChild>
              <Link to="/teacher/students" className="flex items-center gap-2.5 py-2">
                <Users className="h-4 w-4 text-ink-muted" />
                <span>{t('nav.teacherStudents')}</span>
              </Link>
            </MenuItem>
          </>
        )}

        {role === 'ADMIN' && (
          <MenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2.5 py-2">
              <Shield className="h-4 w-4 text-ink-muted" />
              <span>{t('nav.administration')}</span>
            </Link>
          </MenuItem>
        )}

        <MenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2.5 py-2">
            <Settings className="h-4 w-4 text-ink-muted" />
            <span>{t('nav.settingsLink')}</span>
          </Link>
        </MenuItem>

        <div className="my-1 border-t border-line" />

        <MenuItem asChild>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 py-2 text-danger hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('nav.logout')}</span>
          </button>
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export function Header() {
  const { t } = useTranslation()
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-paper/85">
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
          <Link
            to="/teachers"
            className="flex min-h-touch items-center rounded px-3 font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:text-blue"
          >
            {t('nav.teachers')}
          </Link>
          <Link
            to="/certificates/verify"
            className="flex min-h-touch items-center rounded px-3 font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:text-blue"
          >
            {t('nav.diplomas')}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitch />
          <ThemeToggle />
          {authenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden min-h-touch items-center rounded border border-ink px-4 font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:bg-ink hover:text-paper sm:flex"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/auth/register"
                className="hidden min-h-touch items-center rounded bg-ink px-4 font-sans text-sm font-semibold text-paper transition-colors duration-brand ease-brand hover:bg-blue sm:flex"
              >
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
