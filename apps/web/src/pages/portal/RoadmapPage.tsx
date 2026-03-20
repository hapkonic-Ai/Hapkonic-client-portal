import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flag, Circle, CheckCircle2, AlertTriangle, Clock,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, CalendarDays,
} from 'lucide-react'
import { projectsApi, milestonesApi, type Project, type Milestone, type MilestoneStatus } from '../../lib/api'
import { Badge } from '../../components/ui/Badge'

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  completed:   { label: 'Completed',   color: '#22c55e', bg: '#22c55e1a', icon: <CheckCircle2 size={13} /> },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#3b82f61a', icon: <Clock size={13} /> },
  blocked:     { label: 'Blocked',     color: '#ef4444', bg: '#ef44441a', icon: <AlertTriangle size={13} /> },
  not_started: { label: 'Not Started', color: '#94a3b8', bg: '#94a3b81a', icon: <Circle size={13} /> },
}

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#0ea5e9', '#f97316', '#14b8a6',
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getDaysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function getMonthsInRange(start: Date, end: Date) {
  const months: { date: Date; label: string; shortLabel: string }[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    months.push({
      date: new Date(cur),
      label: cur.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      shortLabel: cur.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

function getWeeksInRange(start: Date, end: Date): Date[] {
  const weeks: Date[] = []
  const cur = new Date(start)
  cur.setDate(cur.getDate() - cur.getDay())
  while (cur <= end) {
    weeks.push(new Date(cur))
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Gantt Bar ──────────────────────────────────────────────────────────────────

function GanttBar({ milestone, chartStart, dayWidth, index, color }: {
  milestone: Milestone; chartStart: Date; dayWidth: number; index: number; color: string
}) {
  if (!milestone.targetDate) return null
  const cfg = STATUS_CONFIG[milestone.status] ?? STATUS_CONFIG.not_started
  const due = new Date(milestone.targetDate)
  const est = new Date(due); est.setDate(est.getDate() - 14)
  const offsetDays = Math.max(0, getDaysBetween(chartStart, est))
  const durationDays = Math.max(getDaysBetween(est, due), 1)
  const barColor = milestone.status === 'completed' ? '#22c55e'
    : milestone.status === 'blocked' ? '#ef4444'
    : color

  const barWidth = durationDays * dayWidth
  const showLabel = barWidth > 64

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      style={{ transformOrigin: 'left' }}
      className="absolute top-1/2 -translate-y-1/2 flex items-center"
      title={`${milestone.title} — Due ${fmtDate(milestone.targetDate)}`}
    >
      {/* Bar body */}
      <div
        className="relative flex items-center overflow-hidden"
        style={{
          left: offsetDays * dayWidth,
          width: barWidth,
          height: 28,
          borderRadius: 6,
          background: `linear-gradient(90deg, ${barColor}dd, ${barColor}99)`,
          boxShadow: `0 2px 12px ${barColor}40`,
          border: `1px solid ${barColor}66`,
        }}
      >
        {/* Progress fill for in_progress */}
        {milestone.status === 'in_progress' && (
          <div
            className="absolute left-0 top-0 bottom-0 rounded-l"
            style={{ width: '45%', background: `${barColor}33` }}
          />
        )}
        {showLabel && (
          <div className="relative flex items-center gap-1.5 px-2.5 text-white" style={{ fontSize: 11, fontWeight: 600 }}>
            {cfg.icon}
            <span className="truncate" style={{ maxWidth: barWidth - 40 }}>{milestone.title}</span>
          </div>
        )}
      </div>

      {/* Due date diamond */}
      <div
        className="absolute"
        style={{
          left: (offsetDays + durationDays) * dayWidth - 6,
          width: 12, height: 12,
          background: barColor,
          transform: 'rotate(45deg)',
          boxShadow: `0 0 8px ${barColor}80`,
        }}
      />
    </motion.div>
  )
}

// ── Today line ─────────────────────────────────────────────────────────────────

function TodayLine({ chartStart, dayWidth, totalRows }: { chartStart: Date; dayWidth: number; totalRows: number }) {
  const offset = getDaysBetween(chartStart, new Date())
  if (offset < 0) return null
  return (
    <div className="absolute top-0 bottom-0 pointer-events-none z-20" style={{ left: offset * dayWidth }}>
      <div className="absolute top-0 bottom-0 w-px" style={{ background: 'rgba(239,68,68,0.7)' }} />
      <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
        TODAY
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [selectedProject, setSelectedProject] = useState<string>(searchParams.get('project') ?? 'all')
  const [zoom, setZoom] = useState<'week' | 'month'>('month')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Milestone | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const DAY_WIDTH = zoom === 'week' ? 28 : 10
  const ROW_HEIGHT = 52
  const LABEL_WIDTH = 240
  const HEADER_HEIGHT = zoom === 'week' ? 60 : 40

  useEffect(() => {
    Promise.all([projectsApi.list(), milestonesApi.list()])
      .then(([{ projects: p }, { milestones: m }]) => { setProjects(p); setMilestones(m) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = selectedProject === 'all'
    ? milestones
    : milestones.filter(m => m.projectId === selectedProject)

  const withDates = filtered.filter(m => m.targetDate)
  const dates = withDates.map(m => new Date(m.targetDate!))
  const today = new Date()

  const chartStart = dates.length > 0
    ? new Date(Math.min(...dates.map(d => { const e = new Date(d); e.setDate(e.getDate() - 28); return e.getTime() })))
    : new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const chartEnd = dates.length > 0
    ? new Date(Math.max(...dates.map(d => { const e = new Date(d); e.setDate(e.getDate() + 21); return e.getTime() })))
    : new Date(today.getFullYear(), today.getMonth() + 4, 1)

  const totalDays = getDaysBetween(chartStart, chartEnd)
  const chartWidth = Math.max(totalDays * DAY_WIDTH, 600)
  const months = getMonthsInRange(chartStart, chartEnd)
  const weeks = getWeeksInRange(chartStart, chartEnd)

  // Group by project
  const projectColorMap = Object.fromEntries(projects.map((p, i) => [p.id, PROJECT_COLORS[i % PROJECT_COLORS.length]]))

  const grouped: { project: Project | null; milestones: Milestone[]; color: string }[] = []
  if (selectedProject === 'all') {
    projects.forEach((p, i) => {
      const ms = filtered.filter(m => m.projectId === p.id)
      if (ms.length > 0) grouped.push({ project: p, milestones: ms, color: PROJECT_COLORS[i % PROJECT_COLORS.length] ?? '#6366f1' })
    })
    const orphans = filtered.filter(m => !projects.find(p => p.id === m.projectId))
    if (orphans.length > 0) grouped.push({ project: null, milestones: orphans, color: '#94a3b8' })
  } else {
    const p = projects.find(x => x.id === selectedProject)
    const i = projects.findIndex(x => x.id === selectedProject)
    grouped.push({ project: p ?? null, milestones: filtered, color: PROJECT_COLORS[i % PROJECT_COLORS.length] ?? '#6366f1' })
  }

  const totalRows = grouped.reduce((acc, g) => acc + g.milestones.length + (selectedProject === 'all' ? 1 : 0), 0)

  // Scroll to today on load
  const scrollToToday = useCallback(() => {
    if (!scrollRef.current) return
    const offset = getDaysBetween(chartStart, new Date()) * DAY_WIDTH - 200
    scrollRef.current.scrollLeft = Math.max(0, offset)
  }, [chartStart, DAY_WIDTH])

  useEffect(() => {
    if (!loading) setTimeout(scrollToToday, 100)
  }, [loading, zoom, scrollToToday])

  const statusCounts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, filtered.filter(m => m.status === k).length])
  ) as Record<MilestoneStatus, number>

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Roadmap</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} milestone{filtered.length !== 1 ? 's' : ''} · {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project filter */}
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', outline: 'none' }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Zoom toggle */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
            {(['month', 'week'] as const).map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all capitalize"
                style={{
                  background: zoom === z ? 'var(--color-primary-500)' : 'var(--bg-secondary)',
                  color: zoom === z ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {z === 'month' ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
                {z}
              </button>
            ))}
          </div>

          {/* Scroll to today */}
          <button
            onClick={scrollToToday}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            <CalendarDays size={13} />
            Today
          </button>
        </div>
      </div>

      {/* ── Status chips ── */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(STATUS_CONFIG) as [MilestoneStatus, typeof STATUS_CONFIG[MilestoneStatus]][]).map(([key, cfg]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
          >
            {cfg.icon}
            <span>{statusCounts[key]}</span>
            <span style={{ opacity: 0.7 }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* ── Gantt Chart ── */}
      {loading ? (
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: ROW_HEIGHT, borderBottom: '1px solid var(--border-default)', background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-3"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
            <Flag size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No milestones yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Milestones will appear here once your team adds them.</p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex" style={{ height: 'auto' }}>

            {/* ── Left label panel ── */}
            <div
              className="shrink-0 flex flex-col border-r"
              style={{ width: LABEL_WIDTH, borderColor: 'var(--border-default)', zIndex: 10 }}
            >
              {/* Column header */}
              <div
                className="flex items-center px-4 border-b shrink-0"
                style={{ height: HEADER_HEIGHT, background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
              >
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  Milestone
                </span>
              </div>

              {/* Rows */}
              {grouped.map(({ project, milestones: ms, color }) => (
                <div key={project?.id ?? 'orphan'}>
                  {/* Project group header */}
                  {selectedProject === 'all' && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 border-b"
                      style={{
                        background: `${color}12`,
                        borderColor: 'var(--border-default)',
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs font-bold truncate" style={{ color }}>{project?.name ?? 'Uncategorized'}</span>
                    </div>
                  )}

                  {/* Milestone rows */}
                  {ms.map((m, rowIdx) => {
                    const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.not_started
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-2.5 px-3 cursor-pointer transition-colors border-b"
                        style={{
                          height: ROW_HEIGHT,
                          borderColor: 'var(--border-default)',
                          background: selected?.id === m.id ? `${color}12` : rowIdx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)33',
                          borderLeft: selected?.id === m.id ? `3px solid ${color}` : '3px solid transparent',
                        }}
                        onClick={() => setSelected(s => s?.id === m.id ? null : m)}
                      >
                        <div style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                          {m.targetDate && (
                            <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                              Due {fmtDate(m.targetDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* ── Gantt scroll area ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-x-auto overflow-y-hidden"
              style={{ position: 'relative', scrollbarWidth: 'thin' }}
            >
              <div style={{ width: chartWidth, position: 'relative', minHeight: '100%' }}>

                {/* ── Time header ── */}
                <div
                  className="sticky top-0 border-b"
                  style={{
                    height: HEADER_HEIGHT,
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-default)',
                    zIndex: 15,
                  }}
                >
                  {zoom === 'month' ? (
                    <div className="flex h-full">
                      {months.map(({ date, shortLabel }) => {
                        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
                        const clipStart = date < chartStart ? getDaysBetween(date, chartStart) : 0
                        const clippedDays = daysInMonth - clipStart
                        const w = clippedDays * DAY_WIDTH
                        const isCurrentMonth = date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
                        return (
                          <div
                            key={shortLabel}
                            className="shrink-0 border-r flex items-center justify-center"
                            style={{
                              width: w,
                              borderColor: 'var(--border-default)',
                              color: isCurrentMonth ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                              fontWeight: isCurrentMonth ? 700 : 500,
                              fontSize: 12,
                            }}
                          >
                            {w > 30 ? shortLabel : ''}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      {/* Month row */}
                      <div className="flex border-b" style={{ height: '50%', borderColor: 'var(--border-default)' }}>
                        {months.map(({ date, shortLabel }) => {
                          const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
                          const clipStart = date < chartStart ? getDaysBetween(date, chartStart) : 0
                          const clippedDays = daysInMonth - clipStart
                          return (
                            <div
                              key={shortLabel}
                              className="shrink-0 border-r px-2 flex items-center"
                              style={{ width: clippedDays * DAY_WIDTH, borderColor: 'var(--border-default)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
                            >
                              {shortLabel}
                            </div>
                          )
                        })}
                      </div>
                      {/* Week row */}
                      <div className="flex" style={{ height: '50%' }}>
                        {weeks.map((w, i) => {
                          const isCurrentWeek = w <= today && new Date(w.getTime() + 7 * 86400000) > today
                          return (
                            <div
                              key={i}
                              className="shrink-0 border-r flex items-center justify-center"
                              style={{
                                width: 7 * DAY_WIDTH,
                                borderColor: 'var(--border-default)',
                                color: isCurrentWeek ? 'var(--color-primary-500)' : 'var(--text-muted)',
                                fontSize: 10,
                                fontWeight: isCurrentWeek ? 700 : 400,
                                background: isCurrentWeek ? 'var(--color-primary-500)10' : 'transparent',
                              }}
                            >
                              {w.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Rows ── */}
                <div style={{ position: 'relative' }}>
                  <TodayLine chartStart={chartStart} dayWidth={DAY_WIDTH} totalRows={totalRows} />

                  {/* Vertical grid lines */}
                  {zoom === 'month'
                    ? months.map(({ date }, i) => (
                        <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: getDaysBetween(chartStart, date) * DAY_WIDTH, background: 'var(--border-default)', opacity: 0.4 }} />
                      ))
                    : weeks.map((w, i) => (
                        <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: getDaysBetween(chartStart, w) * DAY_WIDTH, background: 'var(--border-default)', opacity: 0.4 }} />
                      ))
                  }

                  {grouped.map(({ project, milestones: ms, color }, gi) => (
                    <div key={project?.id ?? 'orphan'}>
                      {/* Group header spacer */}
                      {selectedProject === 'all' && (
                        <div
                          style={{
                            height: 35,
                            background: `${color}08`,
                            borderBottom: '1px solid var(--border-default)',
                          }}
                        />
                      )}

                      {/* Milestone rows */}
                      {ms.map((m, i) => (
                        <div
                          key={m.id}
                          className="relative border-b transition-colors"
                          style={{
                            height: ROW_HEIGHT,
                            borderColor: 'var(--border-default)',
                            background: selected?.id === m.id
                              ? `${color}0a`
                              : i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)1a',
                          }}
                          onClick={() => setSelected(s => s?.id === m.id ? null : m)}
                        >
                          <GanttBar
                            milestone={m}
                            chartStart={chartStart}
                            dayWidth={DAY_WIDTH}
                            index={gi * 10 + i}
                            color={color}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Milestone detail panel ── */}
      <AnimatePresence>
        {selected && (() => {
          const cfg = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.not_started
          const projectName = projects.find(p => p.id === selected.projectId)?.name
          const color = projectColorMap[selected.projectId] ?? '#6366f1'
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderLeft: `4px solid ${color}` }}
            >
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                      {projectName ?? 'Project'}
                    </span>
                    <span
                      className="text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{selected.title}</h3>
                  {selected.description && (
                    <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3">
                    {selected.targetDate && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Due Date</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{fmtDate(selected.targetDate)}</p>
                      </div>
                    )}
                    {selected.completedAt && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Completed</p>
                        <p className="text-sm font-medium" style={{ color: '#22c55e' }}>✓ {fmtDate(selected.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ── Status summary ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(STATUS_CONFIG) as [MilestoneStatus, typeof STATUS_CONFIG[MilestoneStatus]][]).map(([key, cfg]) => {
            const count = statusCounts[key]
            const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0
            return (
              <div
                key={key}
                className="rounded-2xl border p-4 flex items-center gap-3"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{count}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{cfg.label}</p>
                  <div className="mt-1.5 h-1 w-16 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cfg.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
