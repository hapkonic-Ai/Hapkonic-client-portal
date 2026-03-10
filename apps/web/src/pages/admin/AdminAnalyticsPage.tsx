import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import {
  adminApi,
  clientsApi,
  projectsApi,
  invoicesApi,
  type AdminStats,
  type Client,
  type Project,
} from '../../lib/api'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvoiceSummary {
  totalPaid: number
  totalPending: number
  totalOverdue: number
  count: number
}

type DateRange = '7d' | '30d' | '90d'

// ── Helpers ───────────────────────────────────────────────────────────────────

function projectStatusVariant(status: Project['status']): 'success' | 'primary' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'completed':  return 'success'
    case 'in_progress': return 'primary'
    case 'planning':   return 'info' as 'primary'
    case 'on_hold':    return 'warning'
    case 'cancelled':  return 'error'
    default:           return 'neutral'
  }
}

function projectStatusLabel(status: Project['status']): string {
  switch (status) {
    case 'in_progress': return 'In Progress'
    case 'on_hold':     return 'On Hold'
    case 'completed':   return 'Completed'
    case 'planning':    return 'Planning'
    case 'cancelled':   return 'Cancelled'
    default:            return status
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{ background: `${color}22`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

interface BarChartRowProps {
  label: string
  value: number
  total: number
  color: string
  icon: React.ReactNode
}

function BarChartRow({ label, value, total, color, icon }: BarChartRowProps) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color }}>{icon}</span>
          {label}
        </span>
        <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {formatCurrency(value)}
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {pct.toFixed(1)}% of total
      </p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      adminApi.getStats(),
      clientsApi.list(),
      projectsApi.list(),
      invoicesApi.list(),
    ])
      .then(([statsData, clientsData, projectsData, invoicesData]) => {
        setStats(statsData)
        setClients(clientsData.clients)
        setProjects(projectsData.projects)
        setInvoiceSummary(invoicesData.summary)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl animate-pulse"
              style={{ background: 'var(--bg-secondary)' }}
            />
          ))}
        </div>
        <div className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-64 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-4 rounded-xl border"
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
      >
        Failed to load analytics: {error}
      </div>
    )
  }

  const revenueTotal =
    (invoiceSummary?.totalPaid ?? 0) +
    (invoiceSummary?.totalPending ?? 0) +
    (invoiceSummary?.totalOverdue ?? 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            Analytics
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Portal usage and revenue overview
          </p>
        </div>

        {/* Date range selector */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: dateRange === opt.value ? 'var(--bg-surface)' : 'transparent',
                color: dateRange === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: dateRange === opt.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Clients',
            value: stats?.clients ?? 0,
            icon: <Users size={20} />,
            color: 'var(--color-primary-500, rgb(99 102 241))',
            subtitle: 'Registered accounts',
          },
          {
            title: 'Active Projects',
            value: stats?.projects ?? 0,
            icon: <Briefcase size={20} />,
            color: '#8b5cf6',
            subtitle: 'Across all clients',
          },
          {
            title: 'Documents Stored',
            value: stats?.documents ?? 0,
            icon: <FileText size={20} />,
            color: '#06b6d4',
            subtitle: 'In document vault',
          },
          {
            title: 'Total Revenue',
            value: formatCurrency(stats?.totalPaid ?? 0),
            icon: <DollarSign size={20} />,
            color: '#10b981',
            subtitle: 'Paid invoices',
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* ── Revenue breakdown ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle>Revenue Breakdown</CardTitle>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Total: {formatCurrency(revenueTotal)}
            </span>
          </CardHeader>

          <div className="space-y-5">
            <BarChartRow
              label="Collected"
              value={invoiceSummary?.totalPaid ?? 0}
              total={revenueTotal}
              color="#10b981"
              icon={<CheckCircle size={14} />}
            />
            <BarChartRow
              label="Pending"
              value={invoiceSummary?.totalPending ?? 0}
              total={revenueTotal}
              color="#f59e0b"
              icon={<Clock size={14} />}
            />
            <BarChartRow
              label="Overdue"
              value={invoiceSummary?.totalOverdue ?? 0}
              total={revenueTotal}
              color="#ef4444"
              icon={<AlertCircle size={14} />}
            />
          </div>
        </Card>
      </motion.div>

      {/* ── Client engagement table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Client Engagement</CardTitle>
            <Badge variant="neutral">{clients.length} clients</Badge>
          </CardHeader>

          {clients.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>
              No clients found.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: 'var(--border-default)' }}
                  >
                    {['Client', 'Projects', 'Documents', 'Last Active'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-6 py-2 font-medium text-xs uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, i) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.04 }}
                      className="border-b last:border-0 transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ borderColor: 'var(--border-default)' }}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'var(--color-primary-500, rgb(99 102 241))' }}
                          >
                            {client.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {client.companyName}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {client.contactEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="primary">{client._count?.projects ?? 0}</Badge>
                      </td>
                      <td className="px-6 py-3">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {/* documents not in _count, show users as a proxy */}
                          {client._count?.users ?? 0} users
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span style={{ color: 'var(--text-muted)' }}>
                          {client.onboardedAt
                            ? formatDate(client.onboardedAt)
                            : formatDate(client.createdAt)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Project health overview ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Project Health</CardTitle>
            <Badge variant="neutral">{projects.length} projects</Badge>
          </CardHeader>

          {projects.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>
              No projects found.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.48 + i * 0.04 }}
                  className="flex items-center gap-4"
                >
                  {/* Project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {project.name}
                      </p>
                      <Badge variant={projectStatusVariant(project.status)} size="sm">
                        {projectStatusLabel(project.status)}
                      </Badge>
                    </div>
                    {project.client && (
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        {project.client.companyName}
                      </p>
                    )}

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--bg-secondary)' }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              project.overallPct >= 100
                                ? '#10b981'
                                : project.overallPct >= 50
                                ? 'var(--color-primary-500, rgb(99 102 241))'
                                : '#f59e0b',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${project.overallPct ?? 0}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 + i * 0.04 }}
                        />
                      </div>
                      <span
                        className="text-xs font-semibold tabular-nums w-9 text-right shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {project.overallPct ?? 0}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
