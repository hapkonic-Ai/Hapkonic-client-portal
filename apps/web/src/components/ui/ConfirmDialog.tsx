import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger'
  const iconColor = isDanger ? '#ef4444' : '#f59e0b'
  const iconBg = isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'
  const Icon = isDanger ? Trash2 : AlertTriangle

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>

            <div className="px-6 py-6">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: iconBg }}
              >
                <Icon size={20} style={{ color: iconColor }} />
              </div>

              {/* Text */}
              <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                  style={{ background: iconColor, color: '#fff' }}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ── useConfirm hook ───────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve?: (value: boolean) => void
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
  })

  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise(resolve => {
      setState({ open: true, ...options, resolve })
    })
  }

  function handleConfirm() {
    state.resolve?.(true)
    setState(s => ({ ...s, open: false }))
  }

  function handleCancel() {
    state.resolve?.(false)
    setState(s => ({ ...s, open: false }))
  }

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, dialog }
}
