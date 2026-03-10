import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Calendar,
  UserCog,
  MessageSquare,
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Clients', icon: Users, path: '/admin/clients' },
  { label: 'Projects', icon: FolderKanban, path: '/admin/projects' },
  { label: 'Documents', icon: FileText, path: '/admin/documents' },
  { label: 'Invoices', icon: Receipt, path: '/admin/invoices' },
  { label: 'Meetings', icon: Calendar, path: '/admin/meetings' },
  { label: 'Users', icon: UserCog, path: '/admin/users' },
  { label: 'Comments', icon: MessageSquare, path: '/admin/comments' },
  { label: 'Activity Log', icon: Activity, path: '/admin/activity' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation()

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full border-r overflow-hidden"
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-default)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-16 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-amber-500/20">
          <Shield size={16} className="text-amber-400" />
        </div>
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <p
            className="font-semibold text-sm"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}
          >
            Admin Panel
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Hapkonic
          </p>
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {adminNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive ? 'text-white' : 'hover:bg-white/5'
                  )}
                  style={{ color: isActive ? 'white' : 'var(--text-secondary)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute inset-0 rounded-lg bg-amber-500/80"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <item.icon size={18} className="relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
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
