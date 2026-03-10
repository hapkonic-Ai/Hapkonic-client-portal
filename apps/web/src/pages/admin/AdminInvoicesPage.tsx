import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, DollarSign, CheckCircle, Clock, AlertCircle, Edit2 } from 'lucide-react'
import { invoicesApi, clientsApi, projectsApi, type Invoice, type Client, type Project, type InvoiceStatus } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { formatDate, formatCurrency } from '../../lib/utils'

const statusBadge: Record<InvoiceStatus, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  paid: 'success', pending: 'warning', overdue: 'error', partially_paid: 'info', written_off: 'neutral',
}

function InvoiceForm({ clients, projects, onSubmit, onClose }: {
  clients: Client[]; projects: Project[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({ clientId: '', projectId: '', invoiceNumber: '', amount: '', currency: 'INR', dueDate: '', description: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))
  const clientProjects = projects.filter(p => p.clientId === form.clientId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try { await onSubmit({ ...form, amount: parseFloat(form.amount), projectId: form.projectId || undefined }) }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client</label>
        <select value={form.clientId} onChange={e => { set('clientId', e.target.value); set('projectId', '') }} required
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <option value="">Select client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
        </select>
      </div>
      {form.clientId && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project (optional)</label>
          <select value={form.projectId} onChange={e => set('projectId', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="">No specific project</option>
            {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Invoice Number" value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} required placeholder="INV-2025-001" />
        <Input label="Due Date" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Amount" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required placeholder="150000" />
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Currency</label>
          <select value={form.currency} onChange={e => set('currency', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      <Input label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Phase 2 development milestone" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Invoice</Button>
      </div>
    </form>
  )
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Invoice[]>([])
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, totalOverdue: 0, count: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<Invoice | null>(null)
  const [newStatus, setNewStatus] = useState<InvoiceStatus>('paid')

  async function load() {
    setLoading(true)
    const [{ invoices: inv, summary: s }, { clients: c }, { projects: p }] = await Promise.all([
      invoicesApi.list(), clientsApi.list(), projectsApi.list(),
    ])
    setInvoices(inv); setSummary(s); setClients(c); setProjects(p); setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(invoices.filter(inv => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      const matchSearch = inv.invoiceNumber.toLowerCase().includes(q) || (inv.client?.companyName ?? '').toLowerCase().includes(q)
      return matchStatus && matchSearch
    }))
  }, [search, statusFilter, invoices])

  async function handleCreate(data: Record<string, unknown>) {
    const { invoice } = await invoicesApi.create(data as Parameters<typeof invoicesApi.create>[0])
    setInvoices(prev => [invoice, ...prev]); setShowCreate(false)
  }

  async function handleStatusUpdate() {
    if (!updatingStatus) return
    const { invoice } = await invoicesApi.updateStatus(updatingStatus.id, newStatus)
    setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i)); setUpdatingStatus(null)
  }

  const statCards = [
    { label: 'Collected', value: formatCurrency(summary.totalPaid), icon: <CheckCircle size={18} />, color: '#10b981' },
    { label: 'Pending', value: formatCurrency(summary.totalPending), icon: <Clock size={18} />, color: '#f59e0b' },
    { label: 'Overdue', value: formatCurrency(summary.totalOverdue), icon: <AlertCircle size={18} />, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Invoices</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{invoices.length} total invoices</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>Create Invoice</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <div className="flex gap-1 flex-wrap">
          {(['all', 'pending', 'paid', 'overdue', 'partially_paid', 'written_off'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
              style={{ background: statusFilter === s ? 'var(--primary-500)' : 'var(--bg-secondary)', color: statusFilter === s ? '#fff' : 'var(--text-secondary)', border: `1px solid ${statusFilter === s ? 'var(--primary-500)' : 'var(--border)'}` }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No invoices found.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Invoice #', 'Client', 'Amount', 'Status', 'Due Date', 'Paid On', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid var(--border)' }} className="transition-colors hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{inv.client?.companyName ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(inv.amount, inv.currency)}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge[inv.status]}>{inv.status.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3 text-xs" style={{ color: new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? '#ef4444' : 'var(--text-muted)' }}>
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{inv.paidAt ? formatDate(inv.paidAt) : '—'}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" onClick={() => { setUpdatingStatus(inv); setNewStatus(inv.status) }} title="Update Status">
                        <Edit2 size={14} />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice" size="md">
        <InvoiceForm clients={clients} projects={projects} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={!!updatingStatus} onClose={() => setUpdatingStatus(null)} title="Update Invoice Status" size="sm">
        {updatingStatus && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Invoice <strong style={{ color: 'var(--text-primary)' }}>{updatingStatus.invoiceNumber}</strong>
              {' '}— {formatCurrency(updatingStatus.amount, updatingStatus.currency)}
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as InvoiceStatus)}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                {(['pending', 'paid', 'overdue', 'partially_paid', 'written_off'] as InvoiceStatus[]).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setUpdatingStatus(null)}>Cancel</Button>
              <Button onClick={handleStatusUpdate}>Update Status</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
