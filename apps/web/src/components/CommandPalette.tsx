import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Search,
} from 'lucide-react'

// ── Context ───────────────────────────────────────────────────────────────────

interface CommandPaletteContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  return ctx
}

// ── Navigation items ──────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  path: string
  icon: ReactNode
  shortcut?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',      label: 'Dashboard',      path: '/portal/dashboard',      icon: <LayoutDashboard size={16} /> },
  { id: 'documents',      label: 'Documents',       path: '/portal/documents',      icon: <FileText size={16} /> },
  { id: 'roadmap',        label: 'Roadmap',         path: '/portal/roadmap',        icon: <Map size={16} /> },
  { id: 'progress',       label: 'Progress',        path: '/portal/progress',       icon: <TrendingUp size={16} /> },
  { id: 'timeline',       label: 'Timeline',        path: '/portal/timeline',       icon: <GitBranch size={16} /> },
  { id: 'meetings',       label: 'Meetings',        path: '/portal/meetings',       icon: <Calendar size={16} /> },
  { id: 'invoices',       label: 'Invoices',        path: '/portal/invoices',       icon: <Receipt size={16} /> },
  { id: 'notifications',  label: 'Notifications',   path: '/portal/notifications',  icon: <Bell size={16} /> },
  { id: 'settings',       label: 'Settings',        path: '/portal/settings',       icon: <Settings size={16} /> },
]

// ── CommandPalette UI ─────────────────────────────────────────────────────────

export default function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.platform)

  // Filter items by query
  const filtered = query.trim()
    ? NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS

  // Reset state when palette opens/closes
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      // Focus input after animation frame
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Clamp activeIndex when filtered list length changes
  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(0, filtered.length - 1)))
  }, [filtered.length])

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [setOpen])

  const select = useCallback(
    (item: NavItem) => {
      setOpen(false)
      navigate(item.path)
    },
    [navigate, setOpen],
  )

  function handleKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === 0 ? Math.max(0, filtered.length - 1) : prev - 1,
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) select(item)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <motion.div
              key="cp-panel"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden pointer-events-auto"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-default)',
              }}
            >
              {/* Search input row */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <Search
                  size={16}
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveIndex(0)
                  }}
                  onKeyDown={handleKeydown}
                  placeholder="Search pages..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd
                  className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono border shrink-0"
                  style={{
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
              </div>

              {/* Results list */}
              <ul className="py-1.5 max-h-80 overflow-y-auto" role="listbox">
                {filtered.length === 0 ? (
                  <li
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No results for &ldquo;{query}&rdquo;
                  </li>
                ) : (
                  filtered.map((item, idx) => {
                    const isActive = idx === activeIndex
                    return (
                      <li key={item.id} role="option" aria-selected={isActive}>
                        <button
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => select(item)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                          style={{
                            background: isActive
                              ? 'var(--color-primary-500, rgb(99 102 241))'
                              : 'transparent',
                            color: isActive ? '#fff' : 'var(--text-primary)',
                          }}
                        >
                          {/* Icon */}
                          <span
                            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                            style={{
                              background: isActive
                                ? 'rgba(255,255,255,0.15)'
                                : 'var(--bg-secondary)',
                              color: isActive ? '#fff' : 'var(--text-secondary)',
                            }}
                          >
                            {item.icon}
                          </span>

                          {/* Label */}
                          <span className="flex-1 font-medium">{item.label}</span>

                          {/* Shortcut hint */}
                          <kbd
                            className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono border shrink-0"
                            style={{
                              borderColor: isActive
                                ? 'rgba(255,255,255,0.3)'
                                : 'var(--border-default)',
                              color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                              background: isActive
                                ? 'rgba(255,255,255,0.1)'
                                : 'var(--bg-elevated)',
                            }}
                          >
                            ↵
                          </kbd>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>

              {/* Footer hint */}
              <div
                className="flex items-center gap-4 px-4 py-2 border-t text-xs"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <span className="flex items-center gap-1">
                  <kbd className="font-mono">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono">↵</kbd> open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono">Esc</kbd> close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
