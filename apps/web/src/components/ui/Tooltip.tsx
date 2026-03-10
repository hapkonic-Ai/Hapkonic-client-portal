import { useState, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: TooltipPlacement
  delay?: number
  className?: string
}

const placementStyles: Record<TooltipPlacement, { container: string; arrow: string }> = {
  top: {
    container: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-overlay)] border-t-4 border-x-4 border-x-transparent border-b-0',
  },
  bottom: {
    container: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-overlay)] border-b-4 border-x-4 border-x-transparent border-t-0',
  },
  left: {
    container: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-overlay)] border-l-4 border-y-4 border-y-transparent border-r-0',
  },
  right: {
    container: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-overlay)] border-r-4 border-y-4 border-y-transparent border-l-0',
  },
}

export function Tooltip({ content, children, placement = 'top', delay = 400, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  const p = placementStyles[placement]

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            role="tooltip"
            className={cn('absolute z-50 pointer-events-none', p.container)}
          >
            <div
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg',
                className
              )}
              style={{
                background: 'var(--bg-overlay)',
                color: 'var(--text-primary)',
              }}
            >
              {content}
            </div>
            <span className={cn('absolute w-0 h-0', p.arrow)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
