import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, IndianRupee, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { invoicesApi, type Invoice, type InvoiceStatus } from '../../lib/api'
import { formatDate, formatCurrency } from '../../lib/utils'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  paid:           'success',
  pending:        'warning',
  overdue:        'error',
  partially_paid: 'info',
  written_off:    'neutral',
}

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid:           'Paid',
  pending:        'Pending',
  overdue:        'Overdue',
  partially_paid: 'Partial',
  written_off:    'Written Off',
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border p-5 animate-pulse" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="h-3 rounded w-1/2 mb-3" style={{ background: 'var(--bg-elevated)' }} />
      <div className="h-7 rounded w-2/3" style={{ background: 'var(--bg-elevated)' }} />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded" style={{ background: 'var(--bg-elevated)', width: i === 0 ? '80px' : i === 5 ? '60px' : '100px' }} />
        </td>
      ))}
    </tr>
  )
}

// ── Summary Cards ──────────────────────────────────────────────────────────────

interface SummaryData {
  totalPaid: number
  totalPending: number
  totalOverdue: number
  count: number
}

function SummaryCards({ summary }: { summary: SummaryData }) {
  const items = [
    { label: 'Total Paid', value: summary.totalPaid, icon: CheckCircle, color: '#22c55e', iconBg: 'rgb(34 197 94 / 0.12)' },
    { label: 'Pending', value: summary.totalPending, icon: Clock, color: '#f59e0b', iconBg: 'rgb(245 158 11 / 0.12)' },
    { label: 'Overdue', value: summary.totalOverdue, icon: AlertCircle, color: '#ef4444', iconBg: 'rgb(239 68 68 / 0.12)' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07 }}
          className="rounded-xl border p-5"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.iconBg }}>
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(item.value)}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await invoicesApi.list()
      setInvoices(data.invoices)
      setSummary(data.summary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const isOverdue = (inv: Invoice) =>
    inv.status !== 'paid' && new Date(inv.dueDate) < new Date()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
          Invoices
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Billing history and payment status for your projects.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: 'rgb(239 68 68 / 0.1)', color: 'var(--color-error-400)' }}>
          {error}
        </div>
      )}

      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : summary ? (
        <SummaryCards summary={summary} />
      ) : null}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
                {['Invoice #', 'Project', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                : invoices.length === 0
                  ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="flex flex-col items-center py-14 gap-3">
                          <IndianRupee size={40} style={{ color: 'var(--text-muted)' }} />
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No invoices yet</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Invoices will appear here once issued.</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : invoices.map((inv, idx) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(inv.amount)}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: isOverdue(inv) ? '#ef4444' : 'var(--text-secondary)' }}
                      >
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[inv.status]} size="sm" dot>
                          {STATUS_LABEL[inv.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {inv.pdfUrl ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Download size={13} />}
                            onClick={() => window.open(inv.pdfUrl, '_blank')}
                          >
                            PDF
                          </Button>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {!loading && invoices.length > 0 && (
        <p className="text-xs mt-3 text-right" style={{ color: 'var(--text-muted)' }}>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  )
}
