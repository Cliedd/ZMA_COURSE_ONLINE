import { useState, forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, LayoutDashboard, LogIn, UserPlus, LogOut, ChevronRight, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/entities/session'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { cn } from '@/lib/utils'

type TabIcon = LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>

const TabLink = ({ to, label, icon: Icon, active }: { to: string; label: string; icon: TabIcon; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
      active ? 'text-primary' : 'text-muted-foreground'
    )}
  >
    <Icon className={cn('h-[22px] w-[22px]', active && 'fill-primary/15')} strokeWidth={active ? 2.4 : 2} />
    {label}
  </Link>
)

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: TabIcon
  active: boolean
}

const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ label, icon: Icon, active, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
      {label}
    </button>
  )
)
TabButton.displayName = 'TabButton'

export const MobileTabBar = () => {
  const location = useLocation()
  const { email, role, isAuthenticated, logout: storeLogout } = useAuthStore()
  const authenticated = isAuthenticated()
  const [accountOpen, setAccountOpen] = useState(false)

  const dashboardTo = role === 'TEACHER' ? '/teacher' : role === 'ADMIN' ? '/admin' : '/dashboard'
  const initials = email ? email.slice(0, 2).toUpperCase() : 'ZM'
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const logout = () => { setAccountOpen(false); storeLogout(); window.location.href = '/auth/connexion' }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[150] flex md:hidden items-stretch border-t border-border bg-white/95 backdrop-blur-xl pb-safe dark:bg-background/95"
      style={{ height: 'var(--tab-bar-h)' }}
    >
      <TabLink to="/" label="Accueil" icon={Home} active={location.pathname === '/'} />
      <TabLink to="/catalogue" label="Cours" icon={BookOpen} active={isActive('/catalogue')} />

      {authenticated ? (
        <>
          <TabLink to={dashboardTo} label="Tableau de bord" icon={LayoutDashboard} active={isActive(dashboardTo)} />
          <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
            <SheetTrigger asChild>
              <TabButton label="Compte" icon={() => (
                <Avatar className="h-[22px] w-[22px] ring-2 ring-primary/25">
                  <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
              )} active={accountOpen} onClick={() => setAccountOpen(true)} />
            </SheetTrigger>
            <SheetContent side="bottom" className="pb-safe">
              <SheetHeader className="flex flex-row items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate">{email}</SheetTitle>
                  <p className="text-xs text-muted-foreground capitalize">{role?.toLowerCase() ?? 'étudiant'}</p>
                </div>
              </SheetHeader>
              <div className="p-3 pb-6 space-y-1">
                <Link
                  to={dashboardTo}
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center justify-between gap-2.5 px-3 py-3.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2.5"><LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Tableau de bord</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/catalogue"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center justify-between gap-2.5 px-3 py-3.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4 text-muted-foreground" /> Cours</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-3 py-3.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          <TabLink to="/auth/connexion" label="Connexion" icon={LogIn} active={isActive('/auth/connexion')} />
          <TabLink to="/auth/inscription" label="S'inscrire" icon={UserPlus} active={isActive('/auth/inscription')} />
        </>
      )}
    </nav>
  )
}
