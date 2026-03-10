import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Download, X, FileText, Filter } from 'lucide-react'
import { documentsApi, clientsApi, projectsApi, type Document, type Client, type Project, type DocumentCategory } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'

const CATEGORIES: DocumentCategory[] = [
  'contracts', 'proposals', 'design_assets', 'technical_specs', 'meeting_notes',
  'invoices_financials', 'progress_reports', 'test_reports', 'deployment_guides',
  'legal', 'miscellaneous',
]

function categoryLabel(cat: DocumentCategory) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function fileSizeLabel(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadForm({ clients, projects, onSubmit, onClose }: {
  clients: Client[]; projects: Project[]
  onSubmit: (data: Parameters<typeof documentsApi.create>[0]) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({
    clientId: '', projectId: '', label: '', fileUrl: '', fileKey: '',
    category: 'miscellaneous' as DocumentCategory, fileSize: '', mimeType: 'application/pdf',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const clientProjects = projects.filter(p => p.clientId === form.clientId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      await onSubmit({
        projectId: form.projectId,
        label: form.label,
        fileUrl: form.fileUrl,
        fileKey: form.fileKey || form.fileUrl.split('/').pop() || 'file',
        category: form.category,
        fileSize: parseInt(form.fileSize) || undefined,
        mimeType: form.mimeType || undefined,
      })
    } catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client</label>
        <select value={form.clientId} onChange={e => { set('clientId', e.target.value); set('projectId', '') }} required
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
          <option value="">Select client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
        </select>
      </div>
      {form.clientId && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project</label>
          <select value={form.projectId} onChange={e => set('projectId', e.target.value)} required
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
            <option value="">Select project...</option>
            {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <Input label="Document Label" value={form.label} onChange={e => set('label', e.target.value)} required placeholder="Project Brief.pdf" />
      <Input label="File URL" value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} required placeholder="https://utfs.io/f/..." />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
          </select>
        </div>
        <Input label="MIME Type" value={form.mimeType} onChange={e => set('mimeType', e.target.value)} placeholder="application/pdf" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>Add Document</Button>
      </div>
    </form>
  )
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Document[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<DocumentCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [deleting, setDeleting] = useState<Document | null>(null)

  async function load() {
    setLoading(true)
    const [{ documents: d }, { clients: c }, { projects: p }] = await Promise.all([
      documentsApi.list(), clientsApi.list(), projectsApi.list(),
    ])
    setDocuments(d); setClients(c); setProjects(p); setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(documents.filter(d => {
      const matchCat = catFilter === 'all' || d.category === catFilter
      const matchSearch = (d.label ?? '').toLowerCase().includes(q) || (d.project?.name ?? '').toLowerCase().includes(q)
      return matchCat && matchSearch
    }))
  }, [search, catFilter, documents])

  async function handleCreate(data: Parameters<typeof documentsApi.create>[0]) {
    const { document } = await documentsApi.create(data)
    setDocuments(prev => [document, ...prev]); setShowUpload(false)
  }

  async function handleDelete() {
    if (!deleting) return
    await documentsApi.delete(deleting.id)
    setDocuments(prev => prev.filter(d => d.id !== deleting.id)); setDeleting(null)
  }

  async function handleDownload(doc: Document) {
    const { fileUrl } = await documentsApi.download(doc.id)
    window.open(fileUrl ?? doc.fileUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Documents</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{documents.length} documents in vault</p>
        </div>
        <Button onClick={() => setShowUpload(true)} leftIcon={<Plus size={16} />}>Add Document</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value as DocumentCategory | 'all')}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No documents found.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border-default)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }}>
                {['Name', 'Category', 'Project', 'Size', 'Uploaded', 'Last Viewed', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((doc, i) => (
                  <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid var(--border-default)' }} className="transition-colors hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} style={{ color: 'var(--color-primary-500)' }} />
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="neutral">{categoryLabel(doc.category)}</Badge></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.project?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fileSizeLabel(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(doc.uploadedAt)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{doc.viewedAt ? formatDate(doc.viewedAt) : 'Never'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download"><Download size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(doc)} title="Delete"><Trash2 size={14} style={{ color: '#ef4444' }} /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Add Document" size="md">
        <UploadForm clients={clients} projects={projects} onSubmit={handleCreate} onClose={() => setShowUpload(false)} />
      </Modal>
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete Document" size="sm">
        {deleting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Delete <strong style={{ color: 'var(--text-primary)' }}>{deleting.label}</strong>? This cannot be undone.
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
