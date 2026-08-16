import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/entities/notification'
import type { Notification } from '@/entities/notification'

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <li
      className={`flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 ${notif.read ? '' : 'bg-blue/5'}`}
    >
      {!notif.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue" aria-hidden />
      )}
      <div className={`flex-1 min-w-0 ${notif.read ? 'pl-5' : ''}`}>
        <p className="font-sans text-sm text-ink leading-snug">{notif.message}</p>
        <time className="mt-0.5 block font-sans text-xs text-ink-muted">
          {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
      {!notif.read && (
        <button
          type="button"
          onClick={() => onRead(notif.id)}
          className="shrink-0 font-sans text-[11px] text-blue underline hover:no-underline"
          aria-label={t('notifications.markRead')}
        >
          {t('notifications.markRead')}
        </button>
      )}
    </li>
  )
}

export function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const { data: notifications = [] } = useNotifications()
  const { data: unread = 0 } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const count = Math.min(unread, 99)

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t('notifications.open', { count })}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex min-h-touch min-w-touch items-center justify-center rounded-full border border-line bg-paper text-ink hover:border-ink/40 transition-colors"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {count > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue font-sans text-[10px] font-bold text-paper"
            aria-hidden
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('notifications.panelLabel')}
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded border border-line bg-paper shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-sans text-sm font-semibold text-ink">{t('notifications.title')}</h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                className="font-sans text-xs text-blue underline hover:no-underline"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center font-sans text-sm text-ink-muted">{t('notifications.empty')}</p>
          ) : (
            <ul
              className="max-h-80 overflow-y-auto"
              role="list"
              aria-label={t('notifications.list')}
            >
              {notifications.map((n) => (
                <NotifItem key={n.id} notif={n} onRead={(id) => markAsRead.mutate(id)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
