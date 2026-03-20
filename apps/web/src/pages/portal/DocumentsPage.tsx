import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Search, X, Download, Eye, Grid3X3, List,
  Filter, CheckCircle2, Star, File, FileImage, FileCode, FileArchive,
} from 'lucide-react'
import { documentsApi, type Document, type DocumentCategory } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
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

function FileIcon({ mimeType, size = 20 }: { mimeType?: string; size?: number }) {
  if (!mimeType) return <File size={size} />
  if (mimeType.startsWith('image/')) return <FileImage size={size} />
  if (mimeType.includes('pdf')) return <FileText size={size} />
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive size={size} />
  if (mimeType.includes('text') || mimeType.includes('json')) return <FileCode size={size} />
  return <File size={size} />
}

function docStatus(doc: Document): { label: string; color: string } {
  if (!doc.viewedAt) return { label: 'New', color: 'var(--color-primary-500)' }
  if (doc.downloadedAt) return { label: 'Downloaded', color: '#22c55e' }
  return { label: 'Viewed', color: 'var(--text-muted)' }
}

// ── Document Viewer ───────────────────────────────────────────────────────────

function DocumentViewer({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const [csvData, setCsvData] = useState<string[][] | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const isPdf = doc.mimeType?.includes('pdf')
  const isImage = doc.mimeType?.startsWith('image/')
  const isCsv = doc.mimeType?.includes('csv') || doc.mimeType?.includes('text/plain')
  const isExcel = doc.mimeType?.includes('sheet') || doc.mimeType?.includes('excel')
  const canPreview = isPdf || isImage || isCsv

  // Fetch as blob to avoid cross-origin/helmet iframe restrictions
  useEffect(() => {
    if (!isPdf && !isImage) return
    let url: string
    fetch(doc.fileUrl)
      .then(r => r.blob())
      .then(blob => {
        url = URL.createObjectURL(blob)
        setBlobUrl(url)
      })
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <div style={{ color: 'var(--color-primary-500)' }}>
            <FileIcon mimeType={doc.mimeType} size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{doc.label}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {categoryLabel(doc.category)} · {fileSizeLabel(doc.fileSize)}
            </p>
          </div>
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
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <FileIcon mimeType={doc.mimeType} size={40} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Excel files cannot be previewed in the browser.</p>
            <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Button leftIcon={<Download size={16} />}>Download to view</Button>
            </a>
          </div>
        )}
        {!canPreview && !isExcel && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
              <FileIcon mimeType={doc.mimeType} size={40} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Preview not available for this file type.</p>
            <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Button leftIcon={<Download size={16} />}>Download to view</Button>
            </a>
          </div>
        )}
      </div>

      <div
        className="px-6 py-3 flex items-center gap-6 text-xs shrink-0"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
      >
        {doc.project && <span>Project: <span style={{ color: 'var(--text-secondary)' }}>{doc.project.name}</span></span>}
        <span>Uploaded: <span style={{ color: 'var(--text-secondary)' }}>{formatDate(doc.uploadedAt)}</span></span>
        {doc.viewedAt && <span>Viewed: <span style={{ color: 'var(--text-secondary)' }}>{formatDate(doc.viewedAt)}</span></span>}
        {doc.uploadedBy && <span>By: <span style={{ color: 'var(--text-secondary)' }}>{doc.uploadedBy.name}</span></span>}
      </div>
    </motion.div>
  )
}

// ── Grid Card ─────────────────────────────────────────────────────────────────

function DocumentCard({ doc, onView, onDownload, index }: {
  doc: Document; onView: (d: Document) => void; onDownload: (d: Document) => void; index: number
}) {
  const { label, color } = docStatus(doc)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card
        className="p-4 flex flex-col gap-3 hover:shadow-lg transition-all group cursor-pointer"
        onClick={() => onView(doc)}
      >
        <div className="flex items-start justify-between">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-elevated)', color: 'var(--color-primary-500)' }}
          >
            <FileIcon mimeType={doc.mimeType} size={20} />
          </div>
          <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {doc.label}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{categoryLabel(doc.category)}</p>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{fileSizeLabel(doc.fileSize)}</span>
          <span>{formatDate(doc.uploadedAt)}</span>
        </div>
        <div
          className="flex gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ borderColor: 'var(--border-default)' }}
          onClick={e => e.stopPropagation()}
        >
          <Button size="sm" variant="ghost" className="flex-1 text-xs" leftIcon={<Eye size={11} />} onClick={() => onView(doc)}>
            Preview
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-xs" leftIcon={<Download size={11} />} onClick={() => onDownload(doc)}>
            Save
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ── List Row ──────────────────────────────────────────────────────────────────

function DocumentRow({ doc, onView, onDownload, index }: {
  doc: Document; onView: (d: Document) => void; onDownload: (d: Document) => void; index: number
}) {
  const { label, color } = docStatus(doc)

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer"
      style={{ borderBottom: '1px solid var(--border-default)' }}
      onClick={() => onView(doc)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div style={{ color: 'var(--color-primary-500)' }}><FileIcon mimeType={doc.mimeType} size={16} /></div>
          <div>
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{doc.label}</p>
            {doc.project && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.project.name}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><Badge variant="neutral" size="sm">{categoryLabel(doc.category)}</Badge></td>
      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fileSizeLabel(doc.fileSize)}</td>
      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(doc.uploadedAt)}</td>
      <td className="px-4 py-3"><span className="text-xs font-medium" style={{ color }}>{label}</span></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" title="Preview" onClick={() => onView(doc)}><Eye size={14} /></Button>
          <Button variant="ghost" size="icon" title="Download" onClick={() => onDownload(doc)}><Download size={14} /></Button>
        </div>
      </td>
    </motion.tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<DocumentCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<Document | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    documentsApi.list()
      .then(({ documents: d }) => setDocuments(d))
      .finally(() => setLoading(false))
  }, [])

  const filtered = (() => {
    const q = search.toLowerCase()
    return documents.filter(d => {
      const matchCat = catFilter === 'all' || d.category === catFilter
      const matchSearch = (d.label ?? '').toLowerCase().includes(q) || (d.project?.name ?? '').toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  })()

  // Group by project
  const grouped: { projectId: string; projectName: string; docs: Document[] }[] = []
  const seen = new Map<string, number>()
  for (const doc of filtered) {
    const pid = doc.project?.id ?? '__none__'
    const pname = doc.project?.name ?? 'No Project'
    if (seen.has(pid)) {
      grouped[seen.get(pid)!]!.docs.push(doc)
    } else {
      seen.set(pid, grouped.length)
      grouped.push({ projectId: pid, projectName: pname, docs: [doc] })
    }
  }

  function handleView(doc: Document) {
    setViewing(doc)
    documentsApi.download(doc.id).catch(() => {})
    setDocuments(prev => prev.map(d =>
      d.id === doc.id ? { ...d, viewedAt: d.viewedAt ?? new Date().toISOString() } : d
    ))
  }

  async function handleDownload(doc: Document) {
    try {
      const { fileUrl } = await documentsApi.download(doc.id)
      const a = window.document.createElement('a')
      a.href = fileUrl ?? doc.fileUrl; a.download = doc.label; a.target = '_blank'
      window.document.body.appendChild(a); a.click(); window.document.body.removeChild(a)
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? { ...d, downloadedAt: new Date().toISOString(), viewedAt: d.viewedAt ?? new Date().toISOString() } : d
      ))
    } catch { window.open(doc.fileUrl, '_blank') }
  }

  const newCount = documents.filter(d => !d.viewedAt).length
  const downloadedCount = documents.filter(d => d.downloadedAt).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Document Vault</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {documents.length} documents · {newCount} new · {downloadedCount} downloaded
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: viewMode === mode ? 'var(--color-primary-500)' : 'var(--bg-elevated)',
                color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {mode === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Star size={15} />, label: 'New', value: newCount, color: 'var(--color-primary-500)' },
          { icon: <Eye size={15} />, label: 'Viewed', value: documents.filter(d => d.viewedAt && !d.downloadedAt).length, color: '#a78bfa' },
          { icon: <CheckCircle2 size={15} />, label: 'Downloaded', value: downloadedCount, color: '#22c55e' },
        ].map(stat => (
          <Card key={stat.label} className="p-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}20`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search + Category filter */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48"
        />
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{
            background: showFilters || catFilter !== 'all' ? 'var(--color-primary-500)' : 'var(--bg-secondary)',
            color: showFilters || catFilter !== 'all' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${showFilters || catFilter !== 'all' ? 'var(--color-primary-500)' : 'var(--border-default)'}`,
          }}
        >
          <Filter size={14} />
          <span>Filter{catFilter !== 'all' ? `: ${categoryLabel(catFilter)}` : ''}</span>
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pb-1">
              {(['all', ...CATEGORIES] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat as DocumentCategory | 'all')}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: catFilter === cat ? 'var(--color-primary-500)' : 'var(--bg-secondary)',
                    color: catFilter === cat ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${catFilter === cat ? 'var(--color-primary-500)' : 'var(--border-default)'}`,
                  }}
                >
                  {cat === 'all' ? 'All Categories' : categoryLabel(cat as DocumentCategory)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-5 rounded w-40 mb-4 animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <FileText size={44} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No documents found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {search || catFilter !== 'all' ? 'Try clearing your filters.' : 'Documents shared with you will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ projectId, projectName, docs }) => (
            <div key={projectId}>
              {/* Project section header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-primary-500)20', color: 'var(--color-primary-500)' }}
                >
                  <FileText size={14} />
                </div>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{projectName}</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  {docs.length} {docs.length === 1 ? 'file' : 'files'}
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {docs.map((doc, i) => (
                    <DocumentCard key={doc.id} doc={doc} index={i} onView={handleView} onDownload={handleDownload} />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border-default)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }}>
                        {['Name', 'Category', 'Size', 'Uploaded', 'Status', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((doc, i) => (
                        <DocumentRow key={doc.id} doc={doc} index={i} onView={handleView} onDownload={handleDownload} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {viewing && <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  )
}
