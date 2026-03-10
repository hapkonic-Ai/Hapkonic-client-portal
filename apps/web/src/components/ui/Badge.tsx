import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  default:  { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' },
  primary:  { bg: 'rgb(99 102 241 / 0.15)', text: 'var(--color-primary-400)' },
  success:  { bg: 'rgb(34 197 94 / 0.15)',  text: 'var(--color-success-400)' },
  warning:  { bg: 'rgb(245 158 11 / 0.15)', text: 'var(--color-warning-400)' },
  error:    { bg: 'rgb(239 68 68 / 0.15)',  text: 'var(--color-error-400)' },
  info:     { bg: 'rgb(59 130 246 / 0.15)', text: 'var(--color-info-400)' },
  outline:  { bg: 'transparent', text: 'var(--text-secondary)', border: 'var(--border-default)' },
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'var(--text-muted)',
  primary: 'var(--color-primary-400)',
  success: 'var(--color-success-400)',
  warning: 'var(--color-warning-400)',
  error:   'var(--color-error-400)',
  info:    'var(--color-info-400)',
  outline: 'var(--text-muted)',
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        styles.border && 'border',
        className
      )}
      style={{
        background: styles.bg,
        color: styles.text,
        borderColor: styles.border,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColors[variant] }}
        />
      )}
      {children}
    </span>
  )
}
