import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3 flex items-center pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-lg border px-3 text-sm transition-all duration-150',
              'bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'border-[var(--border-default)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--color-error-500)] focus:ring-[var(--color-error-500)]',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span
              className="absolute right-3 flex items-center"
              style={{ color: 'var(--text-muted)' }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs" style={{ color: 'var(--color-error-500)' }}>
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
