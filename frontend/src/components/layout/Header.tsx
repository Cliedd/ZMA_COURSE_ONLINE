import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, Music, LogOut, BookOpen, User, ChevronDown, LayoutDashboard, CheckCheck, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import { notificationApi } from '../../services/api'
import type { Notification } from '../../types'
import { cn } from '../../lib/utils'

export const Header = () => {
  const location = useLocation()
  const { email, role, isAuthenticated, logout: storeLogout } = useAuthStore()
  const authenticated = isAuthenticated()
  const { unreadCount } = useNotifications()
  const queryClient = useQueryClient()
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const openNotifications = async () => {
    const opening = !notifOpen
    setNotifOpen(opening)
    if (opening) {
      setNotifLoading(true)
      try {
        const data = await notificationApi.getAll()
        setNotifs(data)
      } catch { /* ignore */ } finally {
        setNotifLoading(false)
      }
    }
  }

  const markAllRead = async () => {
    await notificationApi.markAllAsRead().catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
  }

  const logout = () => { storeLogout(); window.location.href = '/auth/connexion' }
  const initials = email ? email.slice(0, 2).toUpperCase() : 'ZM'

  // Route "Dashboard" to the right space based on role
  const dashboardTo = role === 'TEACHER' ? '/teacher' : role === 'ADMIN' ? '/admin' : '/dashboard'

  const NAV = [
    { to: '/catalogue',   label: 'Courses',    icon: BookOpen },
    { to: dashboardTo,    label: 'Dashboard',  icon: LayoutDashboard },
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-white/95 backdrop-blur-xl border-b border-border/50 shadow-sm dark:bg-background/95"
        : "bg-white/80 backdrop-blur-md border-b border-border/30 dark:bg-background/80"
    )}>
      <div className="container flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero shadow-md shadow-primary/30">
            <Music className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-base font-black text-foreground tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              ZTF <span className="text-primary">Music</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Academy</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/')
            return (
              <Link
                key={label}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {authenticated ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifications}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-white dark:bg-card shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                      <p className="text-xs font-semibold">Notifications</p>
                      {notifs.some(n => !n.read) && (
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <CheckCheck className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : notifs.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No notifications</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-border">
                          {notifs.map(n => (
                            <li
                              key={n.id}
                              className={cn(
                                'px-4 py-3 text-sm hover:bg-muted/30 transition-colors',
                                !n.read && 'bg-primary/5 border-l-2 border-l-primary'
                              )}
                            >
                              <p className={cn('leading-snug', !n.read && 'font-medium')}>{n.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium max-w-[110px] truncate">{email}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", userMenu && "rotate-180")} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-border bg-white dark:bg-card shadow-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-border bg-muted/30">
                      <p className="text-xs font-semibold truncate">{email}</p>
                      <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{role?.toLowerCase() ?? 'student'}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to={dashboardTo}
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                      </Link>
                      <Link
                        to="/catalogue"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> Courses
                      </Link>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/connexion">
                <Button variant="ghost" size="sm" className="text-sm font-medium">Log in</Button>
              </Link>
              <Link to="/auth/inscription">
                <Button size="sm" className="gap-1.5 text-sm font-semibold">
                  <User className="h-3.5 w-3.5" /> Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
