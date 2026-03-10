import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
  size?: 'sm' | 'md'
  style?: React.CSSProperties
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  default:  { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' },
  primary:  { bg: 'rgb(99 102 241 / 0.15)', text: 'var(--color-primary-400)' },
  success:  { bg: 'rgb(34 197 94 / 0.15)',  text: 'var(--color-success-400)' },
  warning:  { bg: 'rgb(245 158 11 / 0.15)', text: 'var(--color-warning-400)' },
  error:    { bg: 'rgb(239 68 68 / 0.15)',  text: 'var(--color-error-400)' },
  info:     { bg: 'rgb(59 130 246 / 0.15)', text: 'var(--color-info-400)' },
  outline:  { bg: 'transparent', text: 'var(--text-secondary)', border: 'var(--border-default)' },
  neutral:  { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)' },
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'var(--text-muted)',
  primary: 'var(--color-primary-400)',
  success: 'var(--color-success-400)',
  warning: 'var(--color-warning-400)',
  error:   'var(--color-error-400)',
  info:    'var(--color-info-400)',
  outline: 'var(--text-muted)',
  neutral: 'var(--text-muted)',
}

export function Badge({ children, variant = 'default', className, dot, size, style: inlineStyle }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-xs',
        styles.border && 'border',
        className
      )}
      style={{
        background: styles.bg,
        color: styles.text,
        borderColor: styles.border,
        ...inlineStyle,
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
