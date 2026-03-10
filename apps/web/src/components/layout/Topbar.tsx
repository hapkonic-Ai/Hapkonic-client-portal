import { Bell, Sun, Moon, Search, LogOut, User } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  sidebarCollapsed?: boolean
  isAdmin?: boolean
}

export function Topbar({ isAdmin }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header
      className="flex items-center justify-between h-16 px-4 lg:px-8 border-b shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Left: Search shortcut */}
      <button
        onClick={() => {
          /* command palette — Phase 13 */
        }}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-[var(--bg-elevated)]"
        style={{
          color: 'var(--text-muted)',
          borderColor: 'var(--border-default)',
          background: 'var(--bg-elevated)',
        }}
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Unread badge — Phase 12 */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-primary-500)]" />
        </motion.button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--border-default)' }}>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full gradient-primary text-white text-xs font-semibold"
            aria-label="User avatar"
          >
            {user?.name
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
