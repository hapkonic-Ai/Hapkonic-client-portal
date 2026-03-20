import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Map,
  TrendingUp,
  GitBranch,
  Calendar,
  Receipt,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/portal/dashboard' },
  { label: 'Documents', icon: FileText, path: '/portal/documents' },
  { label: 'Roadmap', icon: Map, path: '/portal/roadmap' },
  { label: 'Progress', icon: TrendingUp, path: '/portal/progress' },
  { label: 'Timeline', icon: GitBranch, path: '/portal/timeline' },
  { label: 'Meetings', icon: Calendar, path: '/portal/meetings' },
  { label: 'Invoices', icon: Receipt, path: '/portal/invoices' },
  { label: 'Notifications', icon: Bell, path: '/portal/notifications' },
  { label: 'Settings', icon: Settings, path: '/portal/settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full border-r overflow-hidden"
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-default)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b shrink-0"
           style={{ borderColor: 'var(--border-default)' }}>
        <img src="/hapkonic-logo-removebg-preview.png" alt="Hapkonic" className="w-8 h-8 object-contain shrink-0" />
        <motion.span
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
          className="font-semibold text-sm overflow-hidden whitespace-nowrap"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}
        >
          Hapkonic
        </motion.span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'text-white'
                      : 'hover:bg-white/5'
                  )}
                  style={{
                    color: isActive ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg gradient-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <item.icon
                    size={18}
                    className="relative z-10 shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <motion.span
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full border bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-md"
        style={{ borderColor: 'var(--border-default)' }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.div>
  )
}
