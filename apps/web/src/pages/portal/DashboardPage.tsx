import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video, Bell, ArrowRight, TrendingUp, FolderOpen, ExternalLink,
} from 'lucide-react'
import {
  projectsApi, meetingsApi, invoicesApi, notificationsApi,
  type Project, type Meeting, type Invoice, type InvoiceStatus,
} from '../../lib/api'
import { formatDate, formatCurrency } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'

// ── Helpers ────────────────────────────────────────────────────────────────────

const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  paid:           'success',
  pending:        'warning',
  overdue:        'error',
  partially_paid: 'info',
  written_off:    'neutral',
}

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid:           'Paid',
  pending:        'Pending',
  overdue:        'Overdue',
  partially_paid: 'Partial',
  written_off:    'Written Off',
}

const PROJECT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  planning:    'info',
  active:      'primary',
  on_hold:     'warning',
  completed:   'success',
  cancelled:   'neutral',
}

const PROJECT_STATUS_LABEL: Record<string, string> = {
  planning:    'Planning',
  active:      'Active',
  on_hold:     'On Hold',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

function isUpcoming(m: Meeting) {
  return new Date(m.startTime) > new Date()
}

// ── Skeleton atoms ─────────────────────────────────────────────────────────────

function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} rounded animate-pulse`} style={{ background: 'var(--bg-elevated)' }} />
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border p-5 animate-pulse" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <SkeletonLine w="w-1/2" h="h-4" />
      <div className="mt-3 space-y-2">
        <SkeletonLine w="w-1/3" h="h-2.5" />
        <SkeletonLine h="h-2" />
      </div>
    </div>
  )
}

// ── Progress Bar (inline for project card) ─────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'var(--bg-elevated)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'var(--color-primary-500)' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

// ── Project Card ───────────────────────────────────────────────────────────────

function ProjectCard({ project, index, onView }: { project: Project; index: number; onView: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </p>
        </div>
        <Badge size="sm" variant={PROJECT_STATUS_VARIANT[project.status] ?? 'neutral'}>
          {PROJECT_STATUS_LABEL[project.status] ?? project.status}
        </Badge>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-0.5">
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--text-secondary)' }}>{project.overallPct ?? 0}%</span>
        </div>
        <ProgressBar pct={project.overallPct ?? 0} />
      </div>

      <Button
        size="sm"
        variant="ghost"
        rightIcon={<ArrowRight size={13} />}
        className="self-start mt-auto"
        onClick={() => onView(project.id)}
      >
        View Project
      </Button>
    </motion.div>
  )
}

// ── Next Meeting Widget ────────────────────────────────────────────────────────

function NextMeetingWidget({ meeting }: { meeting: Meeting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl border"
      style={{
        background: 'color-mix(in srgb, var(--color-primary-500) 8%, var(--bg-surface))',
        borderColor: 'color-mix(in srgb, var(--color-primary-500) 30%, var(--border-default))',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'color-mix(in srgb, var(--color-primary-500) 18%, transparent)' }}
      >
        <Video size={18} style={{ color: 'var(--color-primary-500)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>NEXT MEETING</p>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{meeting.title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {formatDate(meeting.startTime, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {meeting.meetLink && (
        <Button
          size="sm"
          leftIcon={<ExternalLink size={13} />}
          onClick={() => window.open(meeting.meetLink, '_blank')}
        >
          Join
        </Button>
      )}
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  const loadAll = useCallback(async () => {
    // parallel loads
    projectsApi.list()
      .then(d => setProjects(d.projects))
      .catch(() => {})
      .finally(() => setLoadingProjects(false))

    meetingsApi.list()
      .then(d => setMeetings(
        d.meetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      ))
      .catch(() => {})
      .finally(() => setLoadingMeetings(false))

    invoicesApi.list()
      .then(d => setInvoices(d.invoices))
      .catch(() => {})
      .finally(() => setLoadingInvoices(false))

    notificationsApi.list()
      .then(d => setUnreadCount(d.unreadCount))
      .catch(() => {})
      .finally(() => setLoadingNotifs(false))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const now = new Date()
  const nextMeeting = meetings.find(m => isUpcoming(m))
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
              Welcome back, {firstName}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening with your projects.
            </p>
          </div>
          <div className="relative">
            <Bell size={22} style={{ color: 'var(--text-secondary)' }} />
            {!loadingNotifs && unreadCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Next Meeting */}
      {(loadingMeetings || nextMeeting) && (
        <div>
          {loadingMeetings ? (
            <div className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ) : nextMeeting ? (
            <NextMeetingWidget meeting={nextMeeting} />
          ) : null}
        </div>
      )}

      {/* Projects grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} style={{ color: 'var(--text-secondary)' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your Projects
          </h2>
          {!loadingProjects && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              {projects.length}
            </span>
          )}
        </div>

        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <Card className="text-center py-10">
            <FolderOpen size={36} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
            <p style={{ color: 'var(--text-muted)' }}>No projects yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onView={id => navigate(`/portal/roadmap?project=${id}`)} />)}
          </div>
        )}
      </section>

      {/* Bottom row: Recent Invoices */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <Button size="sm" variant="ghost" rightIcon={<ArrowRight size={13} />}>
              View all
            </Button>
          </CardHeader>

          {loadingInvoices ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="space-y-1.5">
                    <SkeletonLine w="w-28" h="h-3" />
                    <SkeletonLine w="w-20" h="h-2.5" />
                  </div>
                  <SkeletonLine w="w-16" h="h-3" />
                </div>
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={32} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No invoices yet.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
              {recentInvoices.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge size="sm" variant={INVOICE_STATUS_VARIANT[inv.status]}>
                      {INVOICE_STATUS_LABEL[inv.status]}
                    </Badge>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(inv.amount)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
