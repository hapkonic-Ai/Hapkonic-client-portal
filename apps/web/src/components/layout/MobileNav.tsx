import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Map, TrendingUp, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home', icon: LayoutDashboard, path: '/portal/dashboard' },
  { label: 'Docs', icon: FileText, path: '/portal/documents' },
  { label: 'Roadmap', icon: Map, path: '/portal/roadmap' },
  { label: 'Progress', icon: TrendingUp, path: '/portal/progress' },
  { label: 'More', icon: MoreHorizontal, path: '/portal/settings' },
]

export function MobileNav() {
  const location = useLocation()

  // Only show on portal routes on mobile
  if (!location.pathname.startsWith('/portal')) return null

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t pb-[env(safe-area-inset-bottom)]"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path)
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-3 gap-1 text-xs font-medium transition-colors',
              isActive ? 'text-[var(--color-primary-500)]' : 'text-[var(--text-muted)]'
            )}
          >
            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
