import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { AdminSidebar, adminNavItems } from '@/components/layout/AdminSidebar'
import { Topbar } from '@/components/layout/Topbar'
import { WalkthroughModal } from '@/components/ui/WalkthroughModal'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((p) => !p)}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden border-r overflow-hidden"
              style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-default)' }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between h-16 px-4 border-b shrink-0"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <div className="flex items-center gap-3">
                  <img src="/hapkonic-logo-removebg-preview.png" alt="Hapkonic" className="w-8 h-8 object-contain shrink-0" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Admin Panel</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hapkonic</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-2">
                  {adminNavItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                            isActive ? 'text-white' : 'hover:bg-white/5'
                          )}
                          style={{ color: isActive ? 'white' : 'var(--text-secondary)' }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="mobile-admin-active"
                              className="absolute inset-0 rounded-lg bg-amber-500/80"
                              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            />
                          )}
                          <item.icon size={18} className="relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                          <span className="relative z-10">{item.label}</span>
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          isAdmin
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <WalkthroughModal />
    </div>
  )
}
