import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, ChevronDown, ChevronRight, Edit2, Trash2, X, Briefcase, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { projectsApi, clientsApi, milestonesApi, type Project, type Client, type ProjectStatus, type Milestone } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'

const statusColors: Record<ProjectStatus, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  planning: 'neutral', in_progress: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error',
}

const milestoneStatusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-emerald-500" />,
  in_progress: <Clock size={14} className="text-blue-500" />,
  upcoming: <Clock size={14} style={{ color: 'var(--text-muted)' }} />,
  at_risk: <AlertCircle size={14} className="text-amber-500" />,
  delayed: <AlertCircle size={14} className="text-red-500" />,
}

function ProjectForm({ initial, clients, onSubmit, onClose }: {
  initial?: Partial<Project>; clients: Client[]
  onSubmit: (data: Partial<Project>) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    clientId: initial?.clientId ?? '',
    status: (initial?.status ?? 'planning') as ProjectStatus,
    startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
    endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try { await onSubmit({ ...form, startDate: form.startDate || undefined, endDate: form.endDate || undefined }) }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Project Name" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="SaaS Platform MVP" />
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client</label>
        <select value={form.clientId} onChange={e => set('clientId', e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <option value="">Select a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="What does this project deliver?"
          className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        <Input label="End Date" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
        <select value={form.status} onChange={e => set('status', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          {(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] as ProjectStatus[]).map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Project'}</Button>
      </div>
    </form>
  )
}

function MilestoneForm({ projectId, initial, onSubmit, onClose }: {
  projectId: string; initial?: Partial<Milestone>
  onSubmit: (data: Partial<Milestone>) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({ title: initial?.title ?? '', description: initial?.description ?? '', dueDate: initial?.dueDate?.split('T')[0] ?? '' })
  const [loading, setLoading] = useState(false)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try { await onSubmit({ ...form, projectId, dueDate: form.dueDate || undefined }) }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Milestone Title" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Design Complete" />
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      </div>
      <Input label="Due Date" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save' : 'Add Milestone'}</Button>
      </div>
    </form>
  )
}

function ProjectRow({ project, clients, onEdit, onDelete }: {
  project: Project; clients: Client[]
  onEdit: (p: Project) => void; onDelete: (p: Project) => void
}) {
  const [open, setOpen] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loadingMs, setLoadingMs] = useState(false)
  const [showAddMs, setShowAddMs] = useState(false)

  async function loadMilestones() {
    if (milestones.length > 0) return
    setLoadingMs(true)
    const { milestones: ms } = await milestonesApi.list(project.id)
    setMilestones(ms); setLoadingMs(false)
  }

  function toggle() { if (!open) loadMilestones(); setOpen(o => !o) }

  async function addMilestone(data: Partial<Milestone>) {
    const { milestone } = await milestonesApi.create({ projectId: project.id, title: data.title!, description: data.description, dueDate: data.dueDate })
    setMilestones(prev => [...prev, milestone]); setShowAddMs(false)
  }

  const client = clients.find(c => c.id === project.clientId)

  return (
    <>
      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ borderBottom: '1px solid var(--border)' }} className="transition-colors hover:bg-[var(--bg-secondary)]">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{client?.companyName ?? '—'}</td>
        <td className="px-4 py-3"><Badge variant={statusColors[project.status]}>{project.status.replace('_', ' ')}</Badge></td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: `${project.overallPct}%`, background: 'var(--primary-500)' }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.overallPct}%</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {project.endDate ? formatDate(project.endDate) : '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onEdit(project)}><Edit2 size={14} /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(project)}><Trash2 size={14} style={{ color: '#ef4444' }} /></Button>
          </div>
        </td>
      </motion.tr>
      <AnimatePresence>
        {open && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={6} className="px-4 py-3" style={{ background: 'var(--bg-secondary)' }}>
              <div className="pl-6 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Milestones</p>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddMs(true)} leftIcon={<Plus size={12} />}>Add</Button>
                </div>
                {loadingMs ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</p>
                ) : milestones.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No milestones yet.</p>
                ) : (
                  milestones.map(ms => (
                    <div key={ms.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      {milestoneStatusIcon[ms.status]}
                      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{ms.title}</span>
                      <Badge variant={ms.status === 'completed' ? 'success' : ms.status === 'at_risk' ? 'warning' : 'neutral'}>{ms.status.replace('_', ' ')}</Badge>
                      {ms.dueDate && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(ms.dueDate)}</span>}
                    </div>
                  ))
                )}
                {showAddMs && (
                  <div className="mt-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
                    <MilestoneForm projectId={project.id} onSubmit={addMilestone} onClose={() => setShowAddMs(false)} />
                  </div>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filtered, setFiltered] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState<Project | null>(null)

  async function load() {
    setLoading(true)
    const [{ projects: p }, { clients: c }] = await Promise.all([projectsApi.list(), clientsApi.list()])
    setProjects(p); setClients(c); setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(projects.filter(p => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchSearch = p.name.toLowerCase().includes(q) || (p.client?.companyName ?? '').toLowerCase().includes(q)
      return matchStatus && matchSearch
    }))
  }, [search, statusFilter, projects])

  async function handleCreate(data: Partial<Project>) {
    const { project } = await projectsApi.create(data as Parameters<typeof projectsApi.create>[0])
    setProjects(prev => [project, ...prev]); setShowCreate(false)
  }

  async function handleEdit(data: Partial<Project>) {
    if (!editing) return
    const { project } = await projectsApi.update(editing.id, data)
    setProjects(prev => prev.map(p => p.id === project.id ? project : p)); setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    await projectsApi.delete(deleting.id)
    setProjects(prev => prev.filter(p => p.id !== deleting.id)); setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{projects.length} total projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>New Project</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <div className="flex gap-1 flex-wrap">
          {(['all', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
              style={{ background: statusFilter === s ? 'var(--primary-500)' : 'var(--bg-secondary)', color: statusFilter === s ? '#fff' : 'var(--text-secondary)', border: `1px solid ${statusFilter === s ? 'var(--primary-500)' : 'var(--border)'}` }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Project', 'Client', 'Status', 'Progress', 'Deadline', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <ProjectRow key={p.id} project={p} clients={clients} onEdit={setEditing} onDelete={setDeleting} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="md">
        <ProjectForm clients={clients} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Project" size="md">
        {editing && <ProjectForm initial={editing} clients={clients} onSubmit={handleEdit} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Project" size="sm">
        {deleting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Delete <strong style={{ color: 'var(--text-primary)' }}>{deleting.name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
