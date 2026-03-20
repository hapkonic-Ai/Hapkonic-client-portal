import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Power, X, Building2 } from 'lucide-react'
import { clientsApi, type Client } from '../../lib/api'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { formatDate } from '../../lib/utils'

// ── Client Form ───────────────────────────────────────────────────────────────

interface ClientFormProps {
  initial?: Partial<Client>
  onSubmit: (data: Partial<Client>) => Promise<void>
  onClose: () => void
}

function ClientForm({ initial, onSubmit, onClose }: ClientFormProps) {
  const [form, setForm] = useState({
    companyName: initial?.companyName ?? '',
    industry: initial?.industry ?? '',
    contactName: initial?.contactName ?? '',
    contactEmail: initial?.contactEmail ?? '',
    contactPhone: initial?.contactPhone ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        ...form,
        industry: form.industry || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Company Name"
        value={form.companyName}
        onChange={e => set('companyName', e.target.value)}
        required
        placeholder="Acme Corp"
      />
      <Input
        label="Industry"
        value={form.industry}
        onChange={e => set('industry', e.target.value)}
        placeholder="SaaS, E-Commerce..."
      />
      <Input
        label="Contact Name"
        value={form.contactName}
        onChange={e => set('contactName', e.target.value)}
        required
        placeholder="John Doe"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Contact Email"
          type="email"
          value={form.contactEmail}
          onChange={e => set('contactEmail', e.target.value)}
          required
          placeholder="john@example.com"
        />
        <Input
          label="Contact Phone"
          value={form.contactPhone}
          onChange={e => set('contactPhone', e.target.value)}
          placeholder="+91 98765 43210"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save Changes' : 'Create Client'}
        </Button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminClientsPage() {
  const { canDelete } = usePermissions()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [filtered, setFiltered] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteRef = useRef(false)

  async function load() {
    setLoading(true)
    try {
      const { clients: data } = await clientsApi.list()
      setClients(data)
      setFiltered(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      clients.filter(c =>
        c.companyName.toLowerCase().includes(q) ||
        (c.contactName ?? '').toLowerCase().includes(q) ||
        (c.contactEmail ?? '').toLowerCase().includes(q) ||
        (c.industry ?? '').toLowerCase().includes(q)
      )
    )
  }, [search, clients])

  async function handleCreate(data: Partial<Client>) {
    try {
      const { client } = await clientsApi.create(data as Parameters<typeof clientsApi.create>[0])
      setClients(prev => [client, ...prev])
      setShowCreate(false)
      toast('Client added', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to add client', 'error') }
  }

  async function handleEdit(data: Partial<Client>) {
    if (!editing) return
    try {
      const { client } = await clientsApi.update(editing.id, data)
      setClients(prev => prev.map(c => c.id === client.id ? client : c))
      setEditing(null)
      toast('Client updated', 'success')
    } catch (err) { toast((err as Error).message || 'Failed to update client', 'error') }
  }

  async function handleDeactivate(c: Client) {
    try {
      const { client } = await clientsApi.deactivate(c.id)
      setClients(prev => prev.map(x => x.id === client.id ? client : x))
      toast(`Client ${client.isActive ? 'activated' : 'deactivated'}`, 'success')
    } catch (err) { toast((err as Error).message || 'Failed to update client', 'error') }
  }

  async function handleDelete() {
    if (!deleting || deleteRef.current) return
    deleteRef.current = true
    try {
      await clientsApi.delete(deleting.id)
      setClients(prev => prev.filter(c => c.id !== deleting.id))
      setDeleting(null)
      setConfirmDelete(false)
      toast('Client deleted', 'success')
    } catch (err) {
      toast((err as Error).message || 'Failed to delete client', 'error')
    } finally {
      deleteRef.current = false
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search clients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search size={16} />}
        rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            {search ? 'No clients match your search.' : 'No clients yet. Add your first client.'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>Company</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>Contact</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>Industry</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-[var(--bg-secondary)]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.companyName} size="sm" />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{client.companyName}</p>
                          {client.industry && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.industry}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ color: 'var(--text-primary)' }}>{client.contactName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.contactEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      {client.industry ? (
                        <Badge variant="neutral">{client.industry}</Badge>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={client.isActive ? 'success' : 'error'}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(client)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(client)}
                          title={client.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={14} style={{ color: client.isActive ? 'var(--text-muted)' : 'var(--primary-500)' }} />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleting(client); setConfirmDelete(true) }}
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add New Client"
        size="md"
      >
        <ClientForm onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Client"
        size="md"
      >
        {editing && (
          <ClientForm
            initial={editing}
            onSubmit={handleEdit}
            onClose={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => { setDeleting(null); setConfirmDelete(false) }}
        title="Delete Client"
        size="sm"
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleting?.companyName}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setDeleting(null); setConfirmDelete(false) }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
