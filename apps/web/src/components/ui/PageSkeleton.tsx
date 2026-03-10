export function PageSkeleton() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinning logo placeholder */}
        <div className="w-10 h-10 rounded-xl gradient-primary animate-pulse" />
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--color-primary-500)',
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'var(--bg-elevated)' }}
    />
  )
}
