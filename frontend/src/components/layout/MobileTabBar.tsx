import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, LayoutDashboard, LogIn, UserPlus, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { cn } from '../../lib/utils'

const TabLink = ({ to, label, icon: Icon, active }: { to: string; label: string; icon: any; active: boolean }) => (
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

const TabButton = ({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
      active ? 'text-primary' : 'text-muted-foreground'
    )}
  >
    <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
    {label}
  </button>
)

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
      <TabLink to="/" label="Home" icon={Home} active={location.pathname === '/'} />
      <TabLink to="/catalogue" label="Courses" icon={BookOpen} active={isActive('/catalogue')} />

      {authenticated ? (
        <>
          <TabLink to={dashboardTo} label="Dashboard" icon={LayoutDashboard} active={isActive(dashboardTo)} />
          <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
            <SheetTrigger asChild>
              <TabButton label="Account" icon={() => (
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
                  <p className="text-xs text-muted-foreground capitalize">{role?.toLowerCase() ?? 'student'}</p>
                </div>
              </SheetHeader>
              <div className="p-3 pb-6 space-y-1">
                <Link
                  to={dashboardTo}
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center justify-between gap-2.5 px-3 py-3.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2.5"><LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  to="/catalogue"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center justify-between gap-2.5 px-3 py-3.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4 text-muted-foreground" /> Courses</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-3 py-3.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          <TabLink to="/auth/connexion" label="Log in" icon={LogIn} active={isActive('/auth/connexion')} />
          <TabLink to="/auth/inscription" label="Register" icon={UserPlus} active={isActive('/auth/inscription')} />
        </>
      )}
    </nav>
  )
}
