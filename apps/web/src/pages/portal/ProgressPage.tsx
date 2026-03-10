import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Paperclip, User } from 'lucide-react'
import { progressApi, type ProgressUpdate } from '../../lib/api'
import { formatDate, getInitials } from '../../lib/utils'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

// ── Circular Progress Ring ─────────────────────────────────────────────────────

function CircularRing({ pct, label }: { pct: number; label: string }) {
  const R = 54
  const C = 2 * Math.PI * R
  const offset = C - (pct / 100) * C

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="10"
          />
          <motion.circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke="var(--color-primary-500)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
      </div>
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────────────────────

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function RingSkeleton() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-36 h-36 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
    </div>
  )
}

function UpdateCardSkeleton() {
  return (
    <div className="animate-pulse flex gap-4 py-4">
      <div className="w-8 h-8 rounded-full shrink-0" style={{ background: 'var(--bg-elevated)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded w-1/4" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-4 rounded w-3/4" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-3 rounded w-1/2" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    </div>
  )
}

// ── Update Card ────────────────────────────────────────────────────────────────

function UpdateCard({ update, index }: { update: ProgressUpdate; index: number }) {
  const initials = update.user?.name ? getInitials(update.user.name) : '??'

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex gap-4 py-5"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: 'var(--color-primary-500)', color: '#fff' }}
      >
        {update.user?.avatar
          ? <img src={update.user.avatar} alt={update.user.name} className="w-full h-full rounded-full object-cover" />
          : initials
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {update.user?.name ?? 'Team'}
          </span>
          <Badge size="sm" variant="primary">{update.overallPct}% overall</Badge>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDate(update.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
          {update.body}
        </p>

        {(update.attachments ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {(update.attachments ?? []).map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-elevated)', color: 'var(--color-primary-500)' }}
              >
                <Paperclip size={11} />
                {att.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

const BREAKDOWN_BARS = [
  { key: 'designPct' as const,  label: 'Design',      color: '#a78bfa' },
  { key: 'devPct' as const,     label: 'Development', color: '#3b82f6' },
  { key: 'testingPct' as const, label: 'Testing',     color: '#22c55e' },
  { key: 'deployPct' as const,  label: 'Deploy',      color: '#f59e0b' },
]

export default function ProgressPage() {
  const [updates, setUpdates] = useState<ProgressUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { updates: data } = await progressApi.list()
      // newest first
      setUpdates(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const latest = updates[0]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
          Progress
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Real-time updates on your project milestones and completion.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: 'rgb(239 68 68 / 0.1)', color: 'var(--color-error-400)' }}>
          {error}
        </div>
      )}

      {/* Overall ring + breakdown */}
      <div
        className="rounded-2xl border p-6 mb-6"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {loading
            ? <RingSkeleton />
            : <CircularRing pct={latest?.overallPct ?? 0} label="Overall" />
          }
          <div className="flex-1 w-full space-y-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 rounded w-1/3 mb-2" style={{ background: 'var(--bg-elevated)' }} />
                  <div className="h-2 rounded" style={{ background: 'var(--bg-elevated)' }} />
                </div>
              ))
              : BREAKDOWN_BARS.map(bar => (
                <ProgressBar
                  key={bar.key}
                  label={bar.label}
                  pct={latest ? (latest[bar.key] ?? 0) : 0}
                  color={bar.color}
                />
              ))
            }
          </div>
        </div>
      </div>

      {/* Timeline feed */}
      <div>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Update History
        </h2>
        <div
          className="rounded-xl border overflow-hidden px-5"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <UpdateCardSkeleton key={i} />)
            : updates.length === 0
              ? (
                <div className="flex flex-col items-center py-14 gap-3">
                  <TrendingUp size={40} style={{ color: 'var(--text-muted)' }} />
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No updates yet</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Progress updates will appear here as your team posts them.
                  </p>
                </div>
              )
              : updates.map((u, i) => <UpdateCard key={u.id} update={u} index={i} />)
          }
        </div>
      </div>
    </div>
  )
}
