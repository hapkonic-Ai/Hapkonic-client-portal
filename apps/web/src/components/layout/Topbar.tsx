import { useEffect, useRef, useState } from 'react'
import { Bell, Sun, Moon, Search, LogOut, User, Menu, Check, CheckCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCommandPalette } from '@/components/CommandPalette'
import { notificationsApi, type Notification } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface TopbarProps {
  sidebarCollapsed?: boolean
  isAdmin?: boolean
  onMobileMenuToggle?: () => void
}

const notifTypeIcon: Record<string, string> = {
  meeting_reminder: '📅',
  new_document: '📄',
  progress_update: '📊',
  new_comment: '💬',
  mention: '@',
  payment_due: '💳',
  milestone_reached: '🏁',
}

export function Topbar({ isAdmin, onMobileMenuToggle }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { setOpen: openCommandPalette } = useCommandPalette()

  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const hasLoaded = useRef(false)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  async function loadNotifications() {
    if (hasLoaded.current) return
    setNotifLoading(true)
    try {
      const { notifications: n, unreadCount: c } = await notificationsApi.list()
      setNotifications(n)
      setUnreadCount(c)
      hasLoaded.current = true
    } catch {
      // ignore
    } finally {
      setNotifLoading(false)
    }
  }

  function toggleNotif() {
    const next = !notifOpen
    setNotifOpen(next)
    if (next) loadNotifications()
  }

  async function markRead(n: Notification) {
    if (n.isRead) return
    try {
      await notificationsApi.markRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch { /* ignore */ }
    if (n.link) {
      navigate(n.link)
      setNotifOpen(false)
    }
  }

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* ignore */ }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header
      className="flex items-center justify-between h-16 px-4 lg:px-8 border-b shrink-0"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      {/* Mobile menu toggle (admin) */}
      {onMobileMenuToggle && (
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg mr-2 hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Left: Search shortcut */}
      <button
        onClick={() => openCommandPalette(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-[var(--bg-elevated)]"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border-default)', background: 'var(--bg-elevated)' }}
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd
          className="ml-4 px-1.5 py-0.5 rounded text-xs font-mono border"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleNotif}
            className="relative p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Notifications
                    {unreadCount > 0 && (
                      <span
                        className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: 'var(--color-primary-500)' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-[var(--bg-elevated)]"
                        style={{ color: 'var(--text-muted)' }}
                        title="Mark all as read"
                      >
                        <CheckCheck size={13} />
                        All read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-1 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifLoading ? (
                    <div className="space-y-2 p-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ borderBottom: '1px solid var(--border-default)' }}
                      >
                        <span className="text-base mt-0.5 shrink-0">{notifTypeIcon[n.type] ?? '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                            >
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="shrink-0 w-2 h-2 rounded-full" style={{ background: 'var(--color-primary-500)' }} />
                            )}
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <Check size={13} className="mt-1 shrink-0" style={{ color: 'var(--color-primary-500)' }} />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar + logout */}
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--border-default)' }}>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden gradient-primary text-white text-xs font-semibold shrink-0"
            aria-label="User avatar"
          >
            {user?.avatar
              ? <img src={user.avatar} alt={user?.name ?? 'avatar'} className="w-full h-full object-cover" />
              : user?.name
                ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : <User size={14} />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
              {isAdmin ? 'Admin' : user?.role ?? 'client'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Log out"
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
