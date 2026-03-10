import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Briefcase, FileText, DollarSign,
  TrendingUp, TrendingDown, Activity, CheckCircle,
} from 'lucide-react'
import { adminApi, type AdminStats } from '../../lib/api'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency } from '../../lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?: string
}

function StatCard({ title, value, icon, trend, trendUp, color = 'var(--primary-500)' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{title}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trendUp ? (
                  <TrendingUp size={14} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{trend}</span>
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-xl"
            style={{ background: `${color}22`, color }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        Failed to load stats: {error}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.clients ?? 0,
      icon: <Users size={22} />,
      color: 'var(--primary-500)',
      trend: 'Active client accounts',
    },
    {
      title: 'Active Projects',
      value: stats?.projects ?? 0,
      icon: <Briefcase size={22} />,
      color: '#8b5cf6',
      trend: 'Across all clients',
    },
    {
      title: 'Documents Stored',
      value: stats?.documents ?? 0,
      icon: <FileText size={22} />,
      color: '#06b6d4',
      trend: 'In document vault',
    },
    {
      title: 'Total Invoices',
      value: stats?.invoices ?? 0,
      icon: <DollarSign size={22} />,
      color: '#10b981',
      trend: 'All time',
    },
  ]

  const invoiceCards = [
    {
      title: 'Revenue Collected',
      value: formatCurrency(stats?.totalPaid ?? 0),
      icon: <CheckCircle size={22} />,
      color: '#10b981',
      trend: 'Paid invoices',
      trendUp: true,
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats?.totalPending ?? 0),
      icon: <Activity size={22} />,
      color: '#f59e0b',
      trend: 'Awaiting payment',
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(stats?.totalOverdue ?? 0),
      icon: <TrendingDown size={22} />,
      color: '#ef4444',
      trend: 'Past due date',
      trendUp: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Overview of the Hapkonic Client Portal
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Invoice breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Financial Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {invoiceCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.07 }}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Client', href: '/admin/clients' },
            { label: 'Create Project', href: '/admin/projects' },
            { label: 'Upload Document', href: '/admin/documents' },
            { label: 'Create Invoice', href: '/admin/invoices' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </Card>

      {/* Status badges demo */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">API Online</Badge>
          <Badge variant="success">Database Connected</Badge>
          <Badge variant="info">Email Service Active</Badge>
          <Badge variant="warning">File Storage: 73% used</Badge>
        </div>
      </Card>
    </div>
  )
}
