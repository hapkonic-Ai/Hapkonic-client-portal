import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Activity, Download } from 'lucide-react'
import { adminApi, type AdminLog } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { formatDate } from '../../lib/utils'

const ACTION_COLORS: Record<string, string> = {
  CREATE_CLIENT: '#10b981', CREATE_PROJECT: '#10b981', CREATE_USER: '#10b981',
  UPDATE_CLIENT: '#3b82f6', UPDATE_PROJECT: '#3b82f6', UPDATE_USER: '#3b82f6',
  DELETE_CLIENT: '#ef4444', DELETE_PROJECT: '#ef4444',
  UPLOAD_DOCUMENT: '#8b5cf6', CREATE_INVOICE: '#f59e0b',
  MARK_INVOICE_PAID: '#10b981', RESET_PASSWORD: '#f97316',
}

function actionColor(action: string) {
  return ACTION_COLORS[action] ?? 'var(--text-muted)'
}

function exportCSV(logs: AdminLog[]) {
  const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP']
  const rows = logs.map(l => [
    new Date(l.createdAt).toISOString(),
    l.user?.name ?? l.userId ?? '—',
    l.action,
    l.entityType ?? '—',
    l.entityId ?? '—',
    l.ipAddress ?? '—',
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `activity-log-${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [filtered, setFiltered] = useState<AdminLog[]>([])
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  async function load(skip = 0) {
    setLoading(true)
    const { logs: data } = await adminApi.getLogs({ take: PAGE_SIZE, skip })
    if (skip === 0) setLogs(data)
    else setLogs(prev => [...prev, ...data])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(logs.filter(l => {
      const matchSearch = l.action.toLowerCase().includes(q) ||
        (l.user?.name ?? '').toLowerCase().includes(q) ||
        (l.entityType ?? '').toLowerCase().includes(q) ||
        (l.entityId ?? '').toLowerCase().includes(q)
      const matchAction = !actionFilter || l.action.includes(actionFilter.toUpperCase())
      const matchEntity = !entityFilter || (l.entityType ?? '').toLowerCase().includes(entityFilter.toLowerCase())
      return matchSearch && matchAction && matchEntity
    }))
  }, [search, actionFilter, entityFilter, logs])

  const uniqueActions = [...new Set(logs.map(l => l.action))]
  const uniqueEntities = [...new Set(logs.map(l => l.entityType).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Activity Log</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Full audit trail of admin actions</p>
        </div>
        <Button variant="secondary" leftIcon={<Download size={16} />} onClick={() => exportCSV(filtered)}>
          Export CSV
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <option value="">All actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <option value="">All entities</option>
          {uniqueEntities.map(e => <option key={e} value={e!}>{e}</option>)}
        </select>
      </div>

      {loading && logs.length === 0 ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No activity logs found.</p>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {['Time', 'User', 'Action', 'Entity', 'Entity ID', 'IP'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    style={{ borderBottom: '1px solid var(--border)' }} className="transition-colors hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={log.user.name} size="xs" />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{log.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>System</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge style={{ background: `${actionColor(log.action)}22`, color: actionColor(log.action), border: 'none' }}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{log.entityType ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {log.entityId ? log.entityId.slice(0, 8) + '…' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{log.ipAddress ?? '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => { const nextPage = page + 1; setPage(nextPage); load(nextPage * PAGE_SIZE) }} loading={loading}>
              Load more
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
