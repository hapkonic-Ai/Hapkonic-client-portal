import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

export function Card({ children, className, hover, glow, style, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-200',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        glow && 'hover:shadow-[0_0_20px_rgb(99_102_241_/_0.15)]',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-between pb-4 mb-4 border-b', className)}
      style={{ borderColor: 'var(--border-default)' }}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn('text-base font-semibold', className)}
      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </h3>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex items-center pt-4 mt-4 border-t', className)}
      style={{ borderColor: 'var(--border-default)' }}
    >
      {children}
    </div>
  )
}
