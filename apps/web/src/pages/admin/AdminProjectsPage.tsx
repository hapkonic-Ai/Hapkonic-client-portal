import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, ChevronDown, ChevronRight, Edit2, Trash2, X, Briefcase, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { projectsApi, clientsApi, milestonesApi, progressApi, type Project, type Client, type ProjectStatus, type Milestone, type MilestoneStatus } from '../../lib/api'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'

const statusColors: Record<ProjectStatus, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  planning: 'neutral', active: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error',
}

const milestoneStatusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-emerald-500" />,
  in_progress: <Clock size={14} className="text-blue-500" />,
  not_started: <Clock size={14} style={{ color: 'var(--text-muted)' }} />,
  blocked: <AlertCircle size={14} className="text-red-500" />,
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
          {(['planning', 'active', 'on_hold', 'completed', 'cancelled'] as ProjectStatus[]).map(s => (
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
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    targetDate: initial?.targetDate?.split('T')[0] ?? '',
    status: (initial?.status ?? 'not_started') as MilestoneStatus,
  })
  const [loading, setLoading] = useState(false)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try { await onSubmit({ ...form, projectId, targetDate: form.targetDate || undefined }) }
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
      <div className="grid grid-cols-2 gap-3">
        <Input label="Target Date" type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
        {initial && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              {(['not_started', 'in_progress', 'completed', 'blocked'] as MilestoneStatus[]).map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Add Milestone'}</Button>
      </div>
    </form>
  )
}

function ProgressUpdateForm({ projectId, onSubmit, onClose }: {
  projectId: string
  onSubmit: (data: Parameters<typeof progressApi.create>[0]) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({ body: '', overallPct: 0, designPct: 0, devPct: 0, testingPct: 0, deployPct: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setN = (f: string, v: string) => setForm(p => ({ ...p, [f]: Math.min(100, Math.max(0, parseInt(v) || 0)) }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try { await onSubmit({ projectId, ...form }) }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Update Message</label>
        <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={3} required
          placeholder="Describe what was completed this week..."
          className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {([['overallPct', 'Overall %'], ['designPct', 'Design %'], ['devPct', 'Dev %'], ['testingPct', 'Testing %'], ['deployPct', 'Deploy %']] as const).map(([key, label]) => (
          <Input key={key} label={label} type="number" min={0} max={100}
            value={String(form[key])} onChange={e => setN(key, e.target.value)} />
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>Post Update</Button>
      </div>
    </form>
  )
}

function ProjectRow({ project, clients, onEdit, onDelete, onProjectUpdate }: {
  project: Project; clients: Client[]
  onEdit: (p: Project) => void; onDelete: (p: Project) => void
  onProjectUpdate: (p: Project) => void
}) {
  const { canDelete } = usePermissions()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loadingMs, setLoadingMs] = useState(false)
  const [showAddMs, setShowAddMs] = useState(false)
  const [editingMs, setEditingMs] = useState<Milestone | null>(null)
  const [deletingMs, setDeletingMs] = useState<Milestone | null>(null)
  const [showPostUpdate, setShowPostUpdate] = useState(false)

  async function loadMilestones() {
    if (milestones.length > 0) return
    setLoadingMs(true)
    const { milestones: ms } = await milestonesApi.list(project.id)
    setMilestones(ms); setLoadingMs(false)
  }

  function toggle() { if (!open) loadMilestones(); setOpen(o => !o) }

  async function addMilestone(data: Partial<Milestone>) {
    try {
      const { milestone } = await milestonesApi.create({ projectId: project.id, title: data.title!, description: data.description, targetDate: data.targetDate })
      setMilestones(prev => [...prev, milestone]); setShowAddMs(false)
      toast('Milestone added', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to add milestone', 'error') }
  }

  async function saveMilestone(data: Partial<Milestone>) {
    if (!editingMs) return
    try {
      const { milestone } = await milestonesApi.update(editingMs.id, data)
      setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m)); setEditingMs(null)
      toast('Milestone updated', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to update milestone', 'error') }
  }

  async function confirmDeleteMs() {
    if (!deletingMs) return
    try {
      await milestonesApi.delete(deletingMs.id)
      setMilestones(prev => prev.filter(m => m.id !== deletingMs.id)); setDeletingMs(null)
      toast('Milestone deleted', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to delete milestone', 'error') }
  }

  async function postUpdate(data: Parameters<typeof progressApi.create>[0]) {
    try {
      await progressApi.create(data)
      // Sync project percentage fields so the portal dashboard reflects the latest
      const { project: updated } = await projectsApi.update(project.id, {
        overallPct: data.overallPct,
        designPct: data.designPct,
        devPct: data.devPct,
        testingPct: data.testingPct,
        deployPct: data.deployPct,
      })
      onProjectUpdate(updated)
      setShowPostUpdate(false)
      toast('Progress update posted', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to post update', 'error') }
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
              <div className="h-full rounded-full" style={{ width: `${project.overallPct ?? 0}%`, background: 'var(--primary-500)' }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.overallPct ?? 0}%</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {project.endDate ? formatDate(project.endDate) : '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onEdit(project)}><Edit2 size={14} /></Button>
            {canDelete && <Button variant="ghost" size="icon" onClick={() => onDelete(project)}><Trash2 size={14} style={{ color: '#ef4444' }} /></Button>}
          </div>
        </td>
      </motion.tr>
      <AnimatePresence>
        {open && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={6} className="px-4 py-4" style={{ background: 'var(--bg-secondary)' }}>
              <div className="pl-6 space-y-4">

                {/* Milestones section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Milestones</p>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddMs(true)} leftIcon={<Plus size={12} />}>Add</Button>
                  </div>
                  {loadingMs ? (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</p>
                  ) : milestones.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No milestones yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {milestones.map(ms => (
                        <div key={ms.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg group" style={{ background: 'var(--bg-primary)' }}>
                          {milestoneStatusIcon[ms.status]}
                          <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{ms.title}</span>
                          <Badge variant={ms.status === 'completed' ? 'success' : ms.status === 'blocked' ? 'error' : ms.status === 'in_progress' ? 'info' : 'neutral'}>{ms.status.replace('_', ' ')}</Badge>
                          {ms.targetDate && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(ms.targetDate)}</span>}
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => setEditingMs(ms)} title="Edit"><Edit2 size={12} /></Button>
                            {canDelete && <Button variant="ghost" size="icon" onClick={() => setDeletingMs(ms)} title="Delete"><Trash2 size={12} style={{ color: '#ef4444' }} /></Button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showAddMs && (
                    <div className="mt-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
                      <MilestoneForm projectId={project.id} onSubmit={addMilestone} onClose={() => setShowAddMs(false)} />
                    </div>
                  )}
                  {editingMs && (
                    <div className="mt-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
                      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Edit Milestone</p>
                      <MilestoneForm projectId={project.id} initial={editingMs} onSubmit={saveMilestone} onClose={() => setEditingMs(null)} />
                    </div>
                  )}
                  {deletingMs && (
                    <div className="mt-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Delete milestone <strong style={{ color: 'var(--text-primary)' }}>{deletingMs.title}</strong>?
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setDeletingMs(null)}>Cancel</Button>
                        <Button size="sm" variant="destructive" onClick={confirmDeleteMs}>Delete</Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress update section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Progress Update</p>
                    {!showPostUpdate && (
                      <Button size="sm" variant="ghost" onClick={() => setShowPostUpdate(true)} leftIcon={<TrendingUp size={12} />}>Post Update</Button>
                    )}
                  </div>
                  {showPostUpdate && (
                    <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
                      <ProgressUpdateForm projectId={project.id} onSubmit={postUpdate} onClose={() => setShowPostUpdate(false)} />
                    </div>
                  )}
                </div>

              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

export default function AdminProjectsPage() {
  const { toast } = useToast()
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
    try {
      const [{ projects: p }, { clients: c }] = await Promise.all([projectsApi.list(), clientsApi.list()])
      setProjects(p); setClients(c)
    } catch (err) {
      toast((err as Error).message || 'Failed to load projects', 'error')
    } finally {
      setLoading(false)
    }
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
    toast('Project created', 'success')
  }

  async function handleEdit(data: Partial<Project>) {
    if (!editing) return
    const { project } = await projectsApi.update(editing.id, data)
    setProjects(prev => prev.map(p => p.id === project.id ? project : p)); setEditing(null)
    toast('Project updated', 'success')
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await projectsApi.delete(deleting.id)
      setProjects(prev => prev.filter(p => p.id !== deleting.id)); setDeleting(null)
      toast('Project deleted', 'success')
    } catch (err) {
      toast((err as Error).message || 'Failed to delete project', 'error')
    }
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
          {(['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled'] as const).map(s => (
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
                <ProjectRow key={p.id} project={p} clients={clients} onEdit={setEditing} onDelete={setDeleting}
                  onProjectUpdate={updated => setProjects(prev => prev.map(x => x.id === updated.id ? updated : x))} />
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
