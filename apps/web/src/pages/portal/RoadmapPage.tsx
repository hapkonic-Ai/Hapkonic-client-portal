import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Flag, Circle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { projectsApi, milestonesApi, type Project, type Milestone, type MilestoneStatus } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', color: '#22c55e', icon: <CheckCircle2 size={12} /> },
  in_progress: { label: 'In Progress', color: '#3b82f6', icon: <Circle size={12} /> },
  at_risk: { label: 'At Risk', color: '#f59e0b', icon: <AlertTriangle size={12} /> },
  delayed: { label: 'Delayed', color: '#ef4444', icon: <AlertTriangle size={12} /> },
  upcoming: { label: 'Upcoming', color: '#6b7280', icon: <Clock size={12} /> },
}

// ── Gantt helpers ─────────────────────────────────────────────────────────────

function getDaysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function getWeeksInRange(start: Date, end: Date): Date[] {
  const weeks: Date[] = []
  const cur = new Date(start)
  cur.setDate(cur.getDate() - cur.getDay()) // start of week
  while (cur <= end) {
    weeks.push(new Date(cur))
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
}

function getMonthsInRange(start: Date, end: Date): { date: Date; label: string }[] {
  const months: { date: Date; label: string }[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    months.push({
      date: new Date(cur),
      label: cur.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

// ── Gantt Bar Row ─────────────────────────────────────────────────────────────

function GanttRow({ milestone, chartStart, dayWidth, index }: {
  milestone: Milestone; chartStart: Date; dayWidth: number; index: number
}) {
  if (!milestone.dueDate) return null
  const cfg = STATUS_CONFIG[milestone.status as MilestoneStatus] ?? STATUS_CONFIG.upcoming
  const due = new Date(milestone.dueDate)
  // estimate start: 14 days before due (since we don't have a real start date)
  const est = new Date(due); est.setDate(est.getDate() - 14)
  const offsetDays = getDaysBetween(chartStart, est)
  const durationDays = Math.max(getDaysBetween(est, due), 1)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center h-10 relative"
      style={{ minWidth: '100%' }}
    >
      <div
        className="absolute h-6 rounded-full flex items-center px-2 gap-1 text-xs font-medium text-white truncate overflow-hidden"
        style={{
          left: Math.max(0, offsetDays) * dayWidth,
          width: durationDays * dayWidth,
          background: cfg.color,
          boxShadow: `0 2px 8px ${cfg.color}40`,
          minWidth: 24,
        }}
        title={milestone.title}
      >
        {durationDays * dayWidth > 60 && (
          <>
            {cfg.icon}
            <span className="truncate">{milestone.title}</span>
          </>
        )}
      </div>
      {/* Due date marker */}
      <div
        className="absolute top-1 w-0.5 h-8 opacity-40"
        style={{ left: (offsetDays + durationDays) * dayWidth - 0.5, background: cfg.color }}
      />
    </motion.div>
  )
}

// ── Today marker ──────────────────────────────────────────────────────────────

function TodayMarker({ chartStart, dayWidth }: { chartStart: Date; dayWidth: number }) {
  const todayOffset = getDaysBetween(chartStart, new Date())
  if (todayOffset < 0) return null
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
      style={{ left: todayOffset * dayWidth, background: '#ef4444' }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [zoom, setZoom] = useState<'week' | 'month'>('month')
  const [loading, setLoading] = useState(true)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const DAY_WIDTH = zoom === 'week' ? 30 : 10

  useEffect(() => {
    Promise.all([projectsApi.list(), milestonesApi.list()])
      .then(([{ projects: p }, { milestones: m }]) => { setProjects(p); setMilestones(m) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = selectedProject === 'all'
    ? milestones
    : milestones.filter(m => m.projectId === selectedProject)

  const withDates = filtered.filter(m => m.dueDate)

  // Compute chart range
  const dates = withDates.map(m => new Date(m.dueDate!))
  const today = new Date()
  const chartStart = dates.length > 0
    ? new Date(Math.min(...dates.map(d => { const e = new Date(d); e.setDate(e.getDate() - 21); return e.getTime() })))
    : new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const chartEnd = dates.length > 0
    ? new Date(Math.max(...dates.map(d => { const e = new Date(d); e.setDate(e.getDate() + 14); return e.getTime() })))
    : new Date(today.getFullYear(), today.getMonth() + 3, 1)

  const totalDays = getDaysBetween(chartStart, chartEnd)
  const chartWidth = totalDays * DAY_WIDTH

  const months = getMonthsInRange(chartStart, chartEnd)
  const weeks = getWeeksInRange(chartStart, chartEnd)

  // Group milestones by project for label rows
  const grouped: { project: Project | null; milestones: Milestone[] }[] = []
  if (selectedProject === 'all') {
    projects.forEach(p => {
      const ms = filtered.filter(m => m.projectId === p.id)
      if (ms.length > 0) grouped.push({ project: p, milestones: ms })
    })
    const orphans = filtered.filter(m => !projects.find(p => p.id === m.projectId))
    if (orphans.length > 0) grouped.push({ project: null, milestones: orphans })
  } else {
    grouped.push({ project: projects.find(p => p.id === selectedProject) ?? null, milestones: filtered })
  }

  const ROW_HEIGHT = 40
  const LABEL_WIDTH = 220
  const HEADER_HEIGHT = zoom === 'month' ? 32 : 56

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Roadmap</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} milestones across {projects.length} projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={() => setZoom(z => z === 'month' ? 'week' : 'month')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            {zoom === 'month' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
            {zoom === 'month' ? 'Week view' : 'Month view'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="w-0.5 h-3 bg-red-500 rounded-full" />Today
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
      ) : filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <Flag size={44} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No milestones to display</p>
        </Card>
      ) : (
        <Card className="overflow-hidden" style={{ padding: 0 }}>
          <div className="flex" style={{ overflow: 'hidden' }}>
            {/* Left labels panel */}
            <div className="shrink-0 border-r" style={{ width: LABEL_WIDTH, borderColor: 'var(--border-default)' }}>
              {/* Header spacer */}
              <div
                className="border-b px-4 flex items-center"
                style={{ height: HEADER_HEIGHT, borderColor: 'var(--border-default)', background: 'var(--bg-secondary)' }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>MILESTONE</span>
              </div>
              {/* Rows */}
              {grouped.map(({ project, milestones: ms }) => (
                <div key={project?.id ?? 'orphan'}>
                  {selectedProject === 'all' && (
                    <div
                      className="px-4 py-1.5 text-xs font-semibold"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}
                    >
                      {project?.name ?? 'Uncategorized'}
                    </div>
                  )}
                  {ms.map(m => {
                    const cfg = STATUS_CONFIG[m.status as MilestoneStatus] ?? STATUS_CONFIG.upcoming
                    return (
                      <div
                        key={m.id}
                        className="flex items-center px-3 gap-2 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
                        style={{ height: ROW_HEIGHT, borderBottom: '1px solid var(--border-default)' }}
                        onClick={() => setExpandedMilestone(e => e === m.id ? null : m.id)}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                        <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Gantt chart area */}
            <div
              className="overflow-x-auto flex-1"
              ref={scrollRef}
              style={{ position: 'relative' }}
            >
              <div style={{ width: Math.max(chartWidth, 400), position: 'relative' }}>
                {/* Time header */}
                <div
                  className="sticky top-0 border-b"
                  style={{ height: HEADER_HEIGHT, background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', zIndex: 5 }}
                >
                  {zoom === 'month' ? (
                    <div className="flex h-full relative">
                      {months.map(({ date, label }) => {
                        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
                        const clipStart = date < chartStart ? getDaysBetween(date, chartStart) : 0
                        const clippedDays = daysInMonth - clipStart
                        return (
                          <div
                            key={label}
                            className="border-r flex items-center px-2 text-xs font-medium shrink-0"
                            style={{
                              width: clippedDays * DAY_WIDTH,
                              borderColor: 'var(--border-default)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {label}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full relative flex-col justify-end">
                      <div className="flex h-1/2 border-b" style={{ borderColor: 'var(--border-default)' }}>
                        {months.slice(0, 1).map(({ label }) => (
                          <div key={label} className="px-2 flex items-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {label}
                          </div>
                        ))}
                      </div>
                      <div className="flex h-1/2">
                        {weeks.map(w => (
                          <div
                            key={w.toISOString()}
                            className="border-r flex items-center px-1 text-[10px] shrink-0"
                            style={{ width: 7 * DAY_WIDTH, borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                          >
                            {w.toLocaleDateString('en-IN', { day: 'numeric' })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rows + today marker */}
                <div style={{ position: 'relative' }}>
                  <TodayMarker chartStart={chartStart} dayWidth={DAY_WIDTH} />

                  {/* Grid lines */}
                  {(zoom === 'month' ? months : weeks).map(({ date } = {} as any, i) => {
                    const item = zoom === 'month' ? months[i] : { date: weeks[i] }
                    const d = item?.date ?? new Date()
                    const offset = getDaysBetween(chartStart, d)
                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px"
                        style={{ left: offset * DAY_WIDTH, background: 'var(--border-default)', opacity: 0.5 }}
                      />
                    )
                  })}

                  {grouped.map(({ project, milestones: ms }) => (
                    <div key={project?.id ?? 'orphan'}>
                      {selectedProject === 'all' && (
                        <div
                          style={{
                            height: 28,
                            background: 'var(--bg-elevated)',
                            borderBottom: '1px solid var(--border-default)',
                          }}
                        />
                      )}
                      {ms.map((m, i) => (
                        <div
                          key={m.id}
                          style={{ height: ROW_HEIGHT, borderBottom: '1px solid var(--border-default)', position: 'relative' }}
                        >
                          <GanttRow milestone={m} chartStart={chartStart} dayWidth={DAY_WIDTH} index={i} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Milestone detail drawer */}
      {expandedMilestone && (() => {
        const m = milestones.find(x => x.id === expandedMilestone)
        if (!m) return null
        const cfg = STATUS_CONFIG[m.status as MilestoneStatus] ?? STATUS_CONFIG.upcoming
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                    <Badge variant="neutral" size="sm" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                      {cfg.label}
                    </Badge>
                  </div>
                  {m.description && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{m.description}</p>
                  )}
                  {m.dueDate && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      Due: {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {m.completedAt && (
                    <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
                      ✓ Completed: {new Date(m.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setExpandedMilestone(null)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
                >
                  Close
                </button>
              </div>
            </Card>
          </motion.div>
        )
      })()}

      {/* Kanban-style status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = filtered.filter(m => m.status === key).length
          return (
            <Card key={key} className="p-3 text-center">
              <div className="w-6 h-6 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                {cfg.icon}
              </div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{count}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cfg.label}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
