import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CalendarDays, FileText, CreditCard, TrendingUp, CheckCheck, Inbox } from 'lucide-react'
import { notificationsApi } from '../../lib/api'
import { formatRelativeTime } from '../../lib/utils'
import { Button } from '../../components/ui/Button'

// ── Notification type ─────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  link?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getIcon(type: string) {
  if (type.includes('meeting') || type.includes('MEETING')) return <CalendarDays size={16} />
  if (type.includes('document') || type.includes('DOCUMENT')) return <FileText size={16} />
  if (type.includes('invoice') || type.includes('INVOICE')) return <CreditCard size={16} />
  if (type.includes('progress') || type.includes('PROGRESS')) return <TrendingUp size={16} />
  return <Bell size={16} />
}

function groupNotifications(notifications: Notification[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())

  const today: Notification[] = []
  const thisWeek: Notification[] = []
  const earlier: Notification[] = []

  for (const n of notifications) {
    const d = new Date(n.createdAt)
    if (d >= startOfToday) today.push(n)
    else if (d >= startOfWeek) thisWeek.push(n)
    else earlier.push(n)
  }

  return { today, thisWeek, earlier }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full shrink-0" style={{ background: 'var(--bg-elevated)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded w-1/3" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-3 rounded w-2/3" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-2.5 rounded w-1/4" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    </div>
  )
}

// ── Notification Row ───────────────────────────────────────────────────────────

interface NotificationRowProps {
  notification: Notification
  onRead: (id: string) => void
}

function NotificationRow({ notification: n, onRead }: NotificationRowProps) {
  async function handleClick() {
    if (!n.isRead) {
      onRead(n.id)
      try {
        await notificationsApi.markRead(n.id)
      } catch { /* ignore */ }
    }
    if (n.link) window.location.href = n.link
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={handleClick}
      className="flex gap-3 px-4 py-3.5 cursor-pointer transition-colors relative"
      style={{
        background: n.isRead ? 'transparent' : 'color-mix(in srgb, var(--color-primary-500) 6%, transparent)',
        borderBottom: '1px solid var(--border-default)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
      onMouseLeave={e => {
        e.currentTarget.style.background = n.isRead
          ? 'transparent'
          : 'color-mix(in srgb, var(--color-primary-500) 6%, transparent)'
      }}
    >
      {/* Unread dot */}
      {!n.isRead && (
        <span
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--color-primary-500)' }}
        />
      )}

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: n.isRead ? 'var(--bg-elevated)' : 'color-mix(in srgb, var(--color-primary-500) 15%, transparent)',
          color: n.isRead ? 'var(--text-muted)' : 'var(--color-primary-500)',
        }}
      >
        {getIcon(n.type)}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug"
          style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}
        >
          {n.title}
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {n.body}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          {formatRelativeTime(n.createdAt)}
        </p>
      </div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────────

function Section({ title, notifications, onRead }: {
  title: string
  notifications: Notification[]
  onRead: (id: string) => void
}) {
  if (notifications.length === 0) return null
  return (
    <div>
      <p
        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
      >
        {title}
      </p>
      <AnimatePresence>
        {notifications.map(n => (
          <NotificationRow key={n.id} notification={n} onRead={onRead} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { notifications: data } = await notificationsApi.list()
      setNotifications(
        (data as Notification[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    try {
      setMarkingAll(true)
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { /* ignore */ } finally {
      setMarkingAll(false)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const { today, thisWeek, earlier } = groupNotifications(notifications)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            loading={markingAll}
            leftIcon={<CheckCheck size={14} />}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: 'rgb(239 68 68 / 0.1)', color: 'var(--color-error-400)' }}>
          {error}
        </div>
      )}

      {/* Notification list */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Inbox size={44} style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No notifications</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          <>
            <Section title="Today" notifications={today} onRead={handleMarkRead} />
            <Section title="This Week" notifications={thisWeek} onRead={handleMarkRead} />
            <Section title="Earlier" notifications={earlier} onRead={handleMarkRead} />
          </>
        )}
      </div>
    </div>
  )
}
