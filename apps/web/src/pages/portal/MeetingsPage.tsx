import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Calendar, ChevronDown, ChevronUp, Clock, ExternalLink,
  ListChecks, FileText, Zap,
} from 'lucide-react'
import { meetingsApi, type Meeting, type MeetingType } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<MeetingType, string> = {
  kickoff: '#22c55e',
  review:  '#3b82f6',
  standup: '#a78bfa',
  demo:    '#f59e0b',
  ad_hoc:  '#6b7280',
}

const TYPE_LABEL: Record<MeetingType, string> = {
  kickoff: 'Kickoff',
  review:  'Review',
  standup: 'Standup',
  demo:    'Demo',
  ad_hoc:  'Ad-hoc',
}

function isUpcoming(m: Meeting) {
  return new Date(m.startTime) > new Date()
}

function getCountdown(startTime: string): string | null {
  const diff = new Date(startTime).getTime() - Date.now()
  if (diff <= 0 || diff > 24 * 60 * 60 * 1000) return null
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function MeetingCardSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden animate-pulse"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ background: 'var(--bg-elevated)' }} />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-4 rounded w-1/3" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-3 rounded w-1/2" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-3 rounded w-1/4" style={{ background: 'var(--bg-elevated)' }} />
        </div>
      </div>
    </div>
  )
}

// ── Next Meeting Hero ──────────────────────────────────────────────────────────

function NextMeetingHero({ meeting }: { meeting: Meeting }) {
  const color = meeting.type ? TYPE_COLORS[meeting.type] : TYPE_COLORS.ad_hoc
  const countdown = getCountdown(meeting.startTime)

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden mb-6"
      style={{
        background: `linear-gradient(135deg, var(--bg-surface) 0%, color-mix(in srgb, ${color} 8%, var(--bg-surface)) 100%)`,
        borderColor: `color-mix(in srgb, ${color} 40%, var(--border-default))`,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${color} 20%, transparent)` }}
        >
          <Video size={22} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            NEXT MEETING
          </p>
          <h2 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {meeting.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(meeting.startTime, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {meeting.project && (
              <span className="ml-2 opacity-70">· {meeting.project.name}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {countdown && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}
            >
              <Zap size={12} />
              {countdown}
            </motion.div>
          )}
          {meeting.meetLink && (
            <Button
              size="sm"
              leftIcon={<Video size={14} />}
              onClick={() => window.open(meeting.meetLink, '_blank')}
            >
              Join
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Meeting Card ───────────────────────────────────────────────────────────────

function MeetingCard({ meeting, index }: { meeting: Meeting; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const color = meeting.type ? TYPE_COLORS[meeting.type] : TYPE_COLORS.ad_hoc
  const past = !isUpcoming(meeting)
  const countdown = getCountdown(meeting.startTime)
  const hasSummary = !!(meeting.summary || meeting.actionItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: past ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex">
        {/* colored left stripe */}
        <div className="w-1 shrink-0" style={{ background: color }} />

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {meeting.title}
                </span>
                {meeting.type && (
                  <Badge size="sm" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                    {TYPE_LABEL[meeting.type]}
                  </Badge>
                )}
                {countdown && (
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge size="sm" variant="warning">
                      <Clock size={10} />
                      {countdown}
                    </Badge>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  {formatDate(meeting.startTime, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                {meeting.project && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    · {meeting.project.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!past && meeting.meetLink && (
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<ExternalLink size={13} />}
                  onClick={() => window.open(meeting.meetLink, '_blank')}
                >
                  Join
                </Button>
              )}
              {hasSummary && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
                >
                  {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {expanded ? 'Less' : 'More'}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {expanded && hasSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 pt-4 space-y-3 border-t"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {meeting.summary && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        <FileText size={12} /> Summary
                      </p>
                      <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                        {meeting.summary}
                      </p>
                    </div>
                  )}
                  {meeting.actionItems && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        <ListChecks size={12} /> Action Items
                      </p>
                      <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                        {meeting.actionItems}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { meetings: data } = await meetingsApi.list()
      // sort by startTime ascending
      setMeetings(data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const now = new Date()
  const nextMeeting = meetings.find(m => new Date(m.startTime) > now)
  const displayed = filter === 'upcoming'
    ? meetings.filter(m => new Date(m.startTime) > now)
    : meetings

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
          Meetings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Your scheduled sessions and their recordings.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: 'rgb(239 68 68 / 0.1)', color: 'var(--color-error-400)' }}>
          {error}
        </div>
      )}

      {/* Next meeting hero */}
      {!loading && nextMeeting && <NextMeetingHero meeting={nextMeeting} />}

      {/* Filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        {(['upcoming', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: filter === f ? 'var(--color-primary-500)' : 'var(--bg-elevated)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {f === 'upcoming' ? 'Upcoming' : 'All Meetings'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MeetingCardSkeleton key={i} />)
          : displayed.length === 0
            ? (
              <Card className="flex flex-col items-center py-12 text-center">
                <Calendar size={40} style={{ color: 'var(--text-muted)' }} className="mb-3" />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No meetings found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {filter === 'upcoming' ? 'No upcoming meetings scheduled.' : 'No meetings recorded yet.'}
                </p>
              </Card>
            )
            : displayed.map((m, i) => <MeetingCard key={m.id} meeting={m} index={i} />)
        }
      </div>
    </div>
  )
}
