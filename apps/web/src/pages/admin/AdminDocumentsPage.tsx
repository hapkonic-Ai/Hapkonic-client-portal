import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Download, X, FileText, Filter, UploadCloud, Eye } from 'lucide-react'
import { documentsApi, clientsApi, projectsApi, type Document, type Client, type Project, type DocumentCategory } from '../../lib/api'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../components/ui/Toast'
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

const ACCEPT = '.pdf,.xls,.xlsx,.doc,.docx,.csv,.txt'
const ACCEPT_MIME = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
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

function fileIcon(mimeType?: string) {
  if (!mimeType) return <FileText size={14} />
  if (mimeType.includes('pdf')) return <FileText size={14} style={{ color: '#ef4444' }} />
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv'))
    return <FileText size={14} style={{ color: '#22c55e' }} />
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText size={14} style={{ color: '#3b82f6' }} />
  return <FileText size={14} style={{ color: 'var(--color-primary-500)' }} />
}

// ── Document Viewer ────────────────────────────────────────────────────────────

function AdminDocumentViewer({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const [csvData, setCsvData] = useState<string[][] | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const isPdf = doc.mimeType?.includes('pdf')
  const isImage = doc.mimeType?.startsWith('image/')
  const isCsv = doc.mimeType?.includes('csv') || doc.mimeType?.includes('text/plain')
  const isExcel = doc.mimeType?.includes('sheet') || doc.mimeType?.includes('excel')

  useEffect(() => {
    if (!isPdf && !isImage) return
    let url: string
    fetch(doc.fileUrl)
      .then(r => r.blob())
      .then(blob => { url = URL.createObjectURL(blob); setBlobUrl(url) })
      .catch(() => setBlobUrl(doc.fileUrl))
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [doc.fileUrl, isPdf, isImage])

  useEffect(() => {
    if (!isCsv) return
    fetch(doc.fileUrl)
      .then(r => r.text())
      .then(text => {
        const rows = text.split('\n').filter(Boolean).map(r =>
          r.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        )
        setCsvData(rows)
      })
      .catch(() => setCsvData(null))
  }, [doc.fileUrl, isCsv])

  const canPreview = isPdf || isImage || isCsv

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{doc.label}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {categoryLabel(doc.category)} · {fileSizeLabel(doc.fileSize)} · {doc.mimeType ?? 'unknown'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
            <Button size="sm" leftIcon={<Download size={14} />}>Download</Button>
          </a>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isPdf && blobUrl && (
          <iframe
            src={blobUrl}
            className="w-full h-full rounded-xl"
            title={doc.label}
            style={{ minHeight: '70vh', background: '#fff' }}
          />
        )}
        {isPdf && !blobUrl && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-sm" style={{ color: 'var(--text-muted)' }}>Loading PDF…</div>
          </div>
        )}
        {isImage && blobUrl && (
          <div className="flex items-center justify-center h-full">
            <img src={blobUrl} alt={doc.label} className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
        )}
        {isImage && !blobUrl && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
          </div>
        )}
        {isCsv && csvData && (
          <div className="overflow-auto rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {csvData[0]?.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1).map((row, ri) => (
                  <tr key={ri} className="hover:bg-[var(--bg-secondary)]" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {isCsv && !csvData && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-sm" style={{ color: 'var(--text-muted)' }}>Loading CSV data…</div>
          </div>
        )}
        {isExcel && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <FileText size={36} style={{ color: '#22c55e' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Excel files cannot be previewed in the browser.</p>
            <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Button leftIcon={<Download size={16} />}>Download to view</Button>
            </a>
          </div>
        )}
        {!canPreview && !isExcel && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
              <FileText size={36} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Preview not available for this file type.</p>
            <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Button leftIcon={<Download size={16} />}>Download to view</Button>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Drop Zone ──────────────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && ACCEPT_MIME.includes(file.type)) onFile(file)
  }, [onFile])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
      style={{
        borderColor: dragging ? 'var(--color-primary-500)' : 'var(--border-default)',
        background: dragging ? 'var(--color-primary-500)10' : 'var(--bg-secondary)',
      }}
    >
      <UploadCloud size={32} style={{ color: dragging ? 'var(--color-primary-500)' : 'var(--text-muted)' }} />
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Drop file here or click to browse</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF, Excel (.xlsx/.xls), Word (.docx/.doc), CSV — max 50 MB</p>
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={e => {
        const f = e.target.files?.[0]
        if (f) onFile(f)
        e.target.value = ''
      }} />
    </div>
  )
}

// ── Upload Form ────────────────────────────────────────────────────────────────

function UploadForm({ clients, projects, onSubmit, onClose }: {
  clients: Client[]; projects: Project[]
  onSubmit: (data: Parameters<typeof documentsApi.create>[0]) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({
    clientId: '', projectId: '', label: '',
    category: 'miscellaneous' as DocumentCategory,
  })
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string; fileKey: string; fileSize: number; mimeType: string; originalName: string
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const clientProjects = projects.filter(p => p.clientId === form.clientId)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const result = await documentsApi.upload(file)
      setUploadedFile(result)
      if (!form.label) set('label', file.name.replace(/\.[^.]+$/, ''))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadedFile) { setError('Please upload a file first'); return }
    setSubmitting(true); setError(null)
    try {
      await onSubmit({
        projectId: form.projectId,
        label: form.label,
        fileUrl: uploadedFile.fileUrl,
        fileKey: uploadedFile.fileKey,
        category: form.category,
        fileSize: uploadedFile.fileSize,
        mimeType: uploadedFile.mimeType,
      })
    } catch (err) { setError((err as Error).message) } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File drop zone or uploaded state */}
      {uploadedFile ? (
        <div
          className="flex items-center gap-3 rounded-2xl border p-4"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-elevated)' }}>
            {fileIcon(uploadedFile.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{uploadedFile.originalName}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fileSizeLabel(uploadedFile.fileSize)} · {uploadedFile.mimeType}</p>
          </div>
          <button type="button" onClick={() => setUploadedFile(null)} className="p-1 rounded-lg hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <DropZone onFile={handleFile} />
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
          Uploading…
        </div>
      )}

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
      <Input label="Document Label" value={form.label} onChange={e => set('label', e.target.value)} required placeholder="Project Brief" />
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
        <select value={form.category} onChange={e => set('category', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </select>
      </div>
      {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={submitting} disabled={!uploadedFile || uploading}>Upload Document</Button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDocumentsPage() {
  const { canDelete } = usePermissions()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Document[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<DocumentCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [deleting, setDeleting] = useState<Document | null>(null)
  const [previewing, setPreviewing] = useState<Document | null>(null)

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
    try {
      const { document } = await documentsApi.create(data)
      setDocuments(prev => [document, ...prev]); setShowUpload(false)
      toast('Document uploaded', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to add document', 'error') }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await documentsApi.delete(deleting.id)
      setDocuments(prev => prev.filter(d => d.id !== deleting.id)); setDeleting(null)
      toast('Document deleted', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to delete document', 'error') }
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
        <Button onClick={() => setShowUpload(true)} leftIcon={<Plus size={16} />}>Upload Document</Button>
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
                {['Name', 'Client', 'Category', 'Project', 'Size', 'Uploaded', 'Last Viewed', ''].map(h => (
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
                        {fileIcon(doc.mimeType)}
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.project?.client?.companyName ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant="neutral">{categoryLabel(doc.category)}</Badge></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{doc.project?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fileSizeLabel(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(doc.uploadedAt)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{doc.viewedAt ? formatDate(doc.viewedAt) : 'Never'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setPreviewing(doc)} title="Preview"><Eye size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download"><Download size={14} /></Button>
                        {canDelete && <Button variant="ghost" size="icon" onClick={() => setDeleting(doc)} title="Delete"><Trash2 size={14} style={{ color: '#ef4444' }} /></Button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md">
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

      <AnimatePresence>
        {previewing && <AdminDocumentViewer doc={previewing} onClose={() => setPreviewing(null)} />}
      </AnimatePresence>
    </div>
  )
}
