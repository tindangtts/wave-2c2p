'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'
import { Bell } from 'lucide-react'
import { BackHeader } from '@/components/layout/back-header'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const router = useRouter()
  const t = useTranslations('profile')
  const { data, mutate } = useSWR<{ notifications: Notification[] }>('/api/notifications', { dedupingInterval: 5000 })

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = useCallback(async (id: string) => {
    mutate(
      { notifications: notifications.map(n => n.id === id ? { ...n, is_read: true } : n) },
      false
    )
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }, [notifications, mutate])

  const markAllRead = useCallback(async () => {
    mutate(
      { notifications: notifications.map(n => ({ ...n, is_read: true })) },
      false
    )
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    mutate()
  }, [notifications, mutate])

  const handleNotificationPress = useCallback((n: Notification) => {
    markRead(n.id)
    if (n.deep_link) {
      router.push(n.deep_link)
    }
  }, [markRead, router])

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title={t('notificationInbox.title')} onBack={() => router.push('/home')} />

      {/* Mark all read button — only shown when there are unread */}
      {unreadCount > 0 && (
        <div className="px-4 pt-3 flex justify-end">
          <button onClick={markAllRead} className="text-sm text-accent font-medium">
            {t('notificationInbox.markAllRead')}
          </button>
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <Bell className="w-12 h-12 text-border" />
          <p className="text-base font-semibold text-foreground">{t('notificationInbox.empty')}</p>
          <p className="text-sm text-muted-foreground text-center">{t('notificationInbox.emptyBody')}</p>
        </div>
      )}

      {/* Notification list */}
      {notifications.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-4 mt-3 rounded-2xl overflow-hidden bg-white shadow-sm">
            {notifications.map((n, idx) => (
              <button
                key={n.id}
                onClick={() => handleNotificationPress(n)}
                className={[
                  "w-full text-left px-4 py-3 flex items-start gap-3",
                  idx < notifications.length - 1 ? "border-b border-border" : "",
                  !n.is_read ? "bg-brand-blue-light" : "bg-white",
                ].join(' ')}
              >
                {/* Unread indicator dot */}
                <div className={["w-2 h-2 rounded-full mt-1.5 shrink-0", !n.is_read ? "bg-accent" : "bg-transparent"].join(' ')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={["text-sm font-semibold truncate", !n.is_read ? "text-foreground" : "text-muted-foreground"].join(' ')}>
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <span className="shrink-0 text-[10px] font-bold text-white bg-accent rounded-full px-1.5 py-0.5">
                        {t('notificationInbox.unreadBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
