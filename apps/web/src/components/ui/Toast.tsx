import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  error:   <XCircle size={16} className="text-red-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
}

const COLORS: Record<ToastType, string> = {
  success: 'rgba(16,185,129,0.15)',
  error:   'rgba(239,68,68,0.15)',
  warning: 'rgba(245,158,11,0.15)',
}

const BORDER: Record<ToastType, string> = {
  success: 'rgba(16,185,129,0.3)',
  error:   'rgba(239,68,68,0.3)',
  warning: 'rgba(245,158,11,0.3)',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev.slice(-4), { id, type, message }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const success = useCallback((m: string) => toast(m, 'success'), [toast])
  const error   = useCallback((m: string) => toast(m, 'error'),   [toast])
  const warning = useCallback((m: string) => toast(m, 'warning'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-xs"
              style={{ background: COLORS[t.type], borderColor: BORDER[t.type], backdropFilter: 'blur(8px)' }}
            >
              {ICONS[t.type]}
              <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="p-0.5 rounded hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
