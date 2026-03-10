import { cn, getInitials } from '@/lib/utils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name?: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; iconSize: number }> = {
  xs: { container: 'w-6 h-6',   text: 'text-[9px]',  iconSize: 10 },
  sm: { container: 'w-8 h-8',   text: 'text-xs',      iconSize: 12 },
  md: { container: 'w-10 h-10', text: 'text-sm',      iconSize: 14 },
  lg: { container: 'w-12 h-12', text: 'text-base',    iconSize: 16 },
  xl: { container: 'w-16 h-16', text: 'text-lg',      iconSize: 20 },
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const s = sizeStyles[size]

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={cn('rounded-full object-cover shrink-0', s.container, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-semibold text-white gradient-primary select-none',
        s.container,
        s.text,
        className
      )}
      aria-label={name}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}
