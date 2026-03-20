import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, CalendarDays, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { meetingsApi, projectsApi, type Meeting, type Project, type MeetingType } from '../../lib/api'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'

const meetingTypeBadge: Record<MeetingType, 'info' | 'success' | 'neutral' | 'warning' | 'error'> = {
  kickoff: 'success', review: 'info', standup: 'neutral', demo: 'warning', ad_hoc: 'neutral',
}

function MeetingForm({ projects, initial, onSubmit, onClose }: {
  projects: Project[]; initial?: Partial<Meeting>
  onSubmit: (data: Record<string, unknown>) => Promise<void>; onClose: () => void
}) {
  const toLocal = (iso?: string) => iso ? new Date(iso).toISOString().slice(0, 16) : ''
  const [form, setForm] = useState({
    projectId: initial?.projectId ?? '',
    title: initial?.title ?? '',
    startTime: toLocal(initial?.startTime),
    endTime: toLocal(initial?.endTime),
    meetLink: initial?.meetLink ?? '',
    type: (initial?.type ?? 'review') as MeetingType,
    agenda: initial?.agenda ?? '',
    summary: initial?.summary ?? '',
    actionItems: initial?.actionItems ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try { await onSubmit({ ...form, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString() }) }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Meeting Title" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Sprint Review" />
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project</label>
        <select value={form.projectId} onChange={e => set('projectId', e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <option value="">Select project...</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Time" type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} required />
        <Input label="End Time" type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            {(['kickoff', 'review', 'standup', 'demo', 'ad_hoc'] as MeetingType[]).map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <Input label="Google Meet Link" value={form.meetLink} onChange={e => set('meetLink', e.target.value)} placeholder="https://meet.google.com/..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Agenda</label>
        <textarea value={form.agenda} onChange={e => set('agenda', e.target.value)} rows={3} placeholder="1. Review deliverables&#10;2. Client feedback&#10;3. Next steps"
          className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      </div>
      {initial && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Meeting Summary</label>
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={2} placeholder="Post-meeting notes..."
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Action Items</label>
            <textarea value={form.actionItems} onChange={e => set('actionItems', e.target.value)} rows={2} placeholder="- [ ] Action 1&#10;- [ ] Action 2"
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        </>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Schedule Meeting'}</Button>
      </div>
    </form>
  )
}

export default function AdminMeetingsPage() {
  const { canDelete } = usePermissions()
  const { toast } = useToast()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Meeting[]>([])
  const [search, setSearch] = useState('')
  const [upcoming, setUpcoming] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Meeting | null>(null)
  const [deleting, setDeleting] = useState<Meeting | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [{ meetings: m }, { projects: p }] = await Promise.all([meetingsApi.list(), projectsApi.list()])
      setMeetings(m); setProjects(p)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase(); const now = new Date()
    setFiltered(meetings.filter(m => {
      const matchUpcoming = !upcoming || new Date(m.startTime) > now
      const matchSearch = m.title.toLowerCase().includes(q) || (m.project?.name ?? '').toLowerCase().includes(q)
      return matchUpcoming && matchSearch
    }))
  }, [search, upcoming, meetings])

  async function handleCreate(data: Record<string, unknown>) {
    try {
      await meetingsApi.create(data as Parameters<typeof meetingsApi.create>[0])
      setShowCreate(false); await load()
      toast('Meeting scheduled', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to create meeting', 'error') }
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editing) return
    try {
      await meetingsApi.update(editing.id, data)
      setEditing(null); await load()
      toast('Meeting updated', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to update meeting', 'error') }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await meetingsApi.delete(deleting.id)
      setDeleting(null); await load()
      toast('Meeting deleted', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to delete meeting', 'error') }
  }

  function formatMeetingTime(start: string, end: string) {
    const s = new Date(start); const e = new Date(end)
    const date = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const time = `${s.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${e.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    return `${date}, ${time}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Meetings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{meetings.length} meetings scheduled</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>Schedule Meeting</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search meetings..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <button onClick={() => setUpcoming(u => !u)}
          className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: upcoming ? 'var(--primary-500)' : 'var(--bg-secondary)', color: upcoming ? '#fff' : 'var(--text-secondary)', border: `1px solid ${upcoming ? 'var(--primary-500)' : 'var(--border)'}` }}>
          Upcoming only
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No meetings found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                        {m.type && <Badge variant={meetingTypeBadge[m.type as MeetingType]}>{m.type.replace('_', ' ')}</Badge>}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{m.project?.name ?? '—'}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatMeetingTime(m.startTime, m.endTime)}</p>
                      {m.agenda && (
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{m.agenda}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {m.meetLink && (
                        <a href={m.meetLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" title="Join Meeting"><ExternalLink size={14} /></Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setEditing(m)} title="Edit"><Edit2 size={14} /></Button>
                      {canDelete && <Button variant="ghost" size="icon" onClick={() => setDeleting(m)} title="Delete"><Trash2 size={14} style={{ color: '#ef4444' }} /></Button>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Meeting" size="md">
        <MeetingForm projects={projects} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Meeting" size="md">
        {editing && <MeetingForm projects={projects} initial={editing} onSubmit={handleEdit} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Meeting" size="sm">
        {deleting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Delete <strong style={{ color: 'var(--text-primary)' }}>{deleting.title}</strong>? This cannot be undone.
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
