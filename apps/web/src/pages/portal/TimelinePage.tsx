import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, AlertTriangle, Clock, ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react'
import { milestonesApi, type Milestone, type MilestoneStatus, type MilestoneComment } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  completed:   '#22c55e',
  in_progress: '#3b82f6',
  at_risk:     '#f59e0b',
  delayed:     '#ef4444',
  upcoming:    'var(--text-muted)',
}

const STATUS_VARIANT: Record<MilestoneStatus, BadgeVariant> = {
  completed:   'success',
  in_progress: 'info',
  at_risk:     'warning',
  delayed:     'error',
  upcoming:    'neutral',
}

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  completed:   'Completed',
  in_progress: 'In Progress',
  at_risk:     'At Risk',
  delayed:     'Delayed',
  upcoming:    'Upcoming',
}

const ALL_STATUSES: MilestoneStatus[] = ['completed', 'in_progress', 'at_risk', 'delayed', 'upcoming']

function StatusIcon({ status, size = 20 }: { status: MilestoneStatus; size?: number }) {
  const color = STATUS_COLOR[status]
  if (status === 'completed') return <CheckCircle2 size={size} style={{ color }} />
  if (status === 'in_progress') return <Clock size={size} style={{ color }} />
  if (status === 'at_risk' || status === 'delayed') return <AlertTriangle size={size} style={{ color }} />
  return <Circle size={size} style={{ color }} />
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function MilestoneSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
        <div className="w-px flex-1 mt-1" style={{ background: 'var(--bg-elevated)' }} />
      </div>
      <div className="flex-1 pb-8 space-y-2">
        <div className="h-4 rounded w-1/2" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-3 rounded w-2/3" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    </div>
  )
}

// ── Comment Form ───────────────────────────────────────────────────────────────

function CommentForm({ milestoneId, onAdded }: { milestoneId: string; onAdded: (c: MilestoneComment) => void }) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    try {
      setSubmitting(true)
      setError(null)
      const { comment } = await milestonesApi.addComment(milestoneId, body.trim())
      onAdded(comment)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Add a comment…"
        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
      />
      <Button type="submit" size="sm" loading={submitting} leftIcon={<Send size={13} />}>
        Post
      </Button>
      {error && <span className="text-xs self-center" style={{ color: 'var(--color-error-400)' }}>{error}</span>}
    </form>
  )
}

// ── Milestone Node ─────────────────────────────────────────────────────────────

interface MilestoneNodeProps {
  milestone: Milestone & { comments?: MilestoneComment[] }
  index: number
  isLast: boolean
}

function MilestoneNode({ milestone, index, isLast }: MilestoneNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<MilestoneComment[]>(milestone.comments ?? [])
  const color = STATUS_COLOR[milestone.status]
  const commentCount = milestone._count?.comments ?? comments.length

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-4"
    >
      {/* Left: icon + connecting line */}
      <div className="flex flex-col items-center shrink-0" style={{ width: '32px' }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center border-2 z-10"
          style={{
            background: `color-mix(in srgb, ${color} 15%, var(--bg-surface))`,
            borderColor: color,
          }}
        >
          <StatusIcon status={milestone.status} size={16} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ background: 'var(--border-default)', minHeight: '40px' }} />
        )}
      </div>

      {/* Right: content */}
      <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-6'}`}>
        <div
          className="rounded-xl border p-4 cursor-pointer transition-colors"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {milestone.title}
                </span>
                <Badge size="sm" variant={STATUS_VARIANT[milestone.status]} dot>
                  {STATUS_LABEL[milestone.status]}
                </Badge>
              </div>
              {milestone.dueDate && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Due {formatDate(milestone.dueDate)}
                  {milestone.completedAt && ` · Completed ${formatDate(milestone.completedAt)}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {commentCount > 0 && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  <MessageSquare size={11} />
                  {commentCount}
                </span>
              )}
              {expanded ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 rounded-xl border p-4"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
              >
                {milestone.description && (
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {milestone.description}
                  </p>
                )}

                {/* Comments */}
                {comments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'var(--color-primary-500)', color: '#fff' }}
                        >
                          {c.user?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div
                          className="flex-1 rounded-lg px-3 py-2 text-xs"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                        >
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {c.user?.name ?? 'User'}
                          </span>
                          <span className="ml-2 opacity-60">{formatDate(c.createdAt, { month: 'short', day: 'numeric' })}</span>
                          <p className="mt-0.5">{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <CommentForm
                  milestoneId={milestone.id}
                  onAdded={c => setComments(prev => [...prev, c])}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | MilestoneStatus

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { milestones: data } = await milestonesApi.list()
      setMilestones(data.sort((a, b) => a.order - b.order))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load milestones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const tabs: FilterTab[] = ['all', ...ALL_STATUSES]
  const displayed = filter === 'all' ? milestones : milestones.filter(m => m.status === filter)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
          Timeline
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Project milestone tracker with status and discussion.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: 'rgb(239 68 68 / 0.1)', color: 'var(--color-error-400)' }}>
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize"
            style={{
              background: filter === tab
                ? (tab === 'all' ? 'var(--color-primary-500)' : `color-mix(in srgb, ${STATUS_COLOR[tab as MilestoneStatus]} 20%, transparent)`)
                : 'var(--bg-elevated)',
              color: filter === tab
                ? (tab === 'all' ? '#fff' : STATUS_COLOR[tab as MilestoneStatus])
                : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: filter === tab && tab !== 'all'
                ? `color-mix(in srgb, ${STATUS_COLOR[tab as MilestoneStatus]} 40%, transparent)`
                : 'transparent',
            }}
          >
            {tab === 'all' ? 'All' : STATUS_LABEL[tab as MilestoneStatus]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <MilestoneSkeleton key={i} />)
          : displayed.length === 0
            ? (
              <div
                className="rounded-xl border p-12 flex flex-col items-center text-center"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
              >
                <Clock size={40} style={{ color: 'var(--text-muted)' }} className="mb-3" />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No milestones</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {filter === 'all' ? 'No milestones have been created yet.' : `No ${STATUS_LABEL[filter as MilestoneStatus].toLowerCase()} milestones.`}
                </p>
              </div>
            )
            : displayed.map((m, i) => (
              <MilestoneNode
                key={m.id}
                milestone={m}
                index={i}
                isLast={i === displayed.length - 1}
              />
            ))
        }
      </div>
    </div>
  )
}
