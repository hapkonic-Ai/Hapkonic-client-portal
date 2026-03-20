import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, RefreshCw, X, UserCircle2, Copy, Check, Trash2 } from 'lucide-react'
import { adminApi, clientsApi, type User, type Client, type Role } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { formatRelativeTime } from '../../lib/utils'

function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const roleBadgeVariant: Record<Role, 'warning' | 'info' | 'neutral'> = {
  admin: 'warning',
  manager: 'info',
  client: 'neutral',
}

function UserForm({ initial, clients, onSubmit, onClose, isEdit }: {
  initial?: Partial<User>; clients: Client[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onClose: () => void; isEdit?: boolean
}) {
  const [form, setForm] = useState({
    email: initial?.email ?? '',
    name: initial?.name ?? '',
    role: (initial?.role ?? 'client') as Role,
    clientId: initial?.clientId ?? '',
    password: '',
    forcePasswordReset: true,
    isActive: initial?.isActive ?? true,
  })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const data: Record<string, unknown> = { name: form.name, role: form.role, clientId: form.role === 'client' ? form.clientId || undefined : undefined }
      if (!isEdit) { data['email'] = form.email; data['password'] = form.password }
      else { data['isActive'] = form.isActive; data['forcePasswordReset'] = form.forcePasswordReset }
      await onSubmit(data)
    } catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Jane Smith" />
      {!isEdit && <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="jane@company.com" />}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
        <div className="grid grid-cols-3 gap-2">
          {(['admin', 'manager', 'client'] as Role[]).map(r => (
            <button key={r} type="button" onClick={() => set('role', r)}
              className="py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all"
              style={{ background: form.role === r ? 'var(--primary-500)' : 'var(--bg-secondary)', color: form.role === r ? '#fff' : 'var(--text-secondary)', border: `1px solid ${form.role === r ? 'var(--primary-500)' : 'var(--border)'}` }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {form.role === 'client' && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assign to Client</label>
          <select value={form.clientId} onChange={e => set('clientId', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>
      )}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Temporary Password</label>
          <div className="flex gap-2">
            <Input value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 8 characters" className="flex-1" />
            <Button type="button" variant="secondary" size="sm" onClick={() => set('password', generatePassword())}>Generate</Button>
            {form.password && (
              <Button type="button" variant="ghost" size="icon" onClick={async () => { await navigator.clipboard.writeText(form.password); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </Button>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>User will be required to change this on first login.</p>
        </div>
      )}
      {isEdit && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Account active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.forcePasswordReset} onChange={e => set('forcePasswordReset', e.target.checked)} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Force password reset</span>
          </label>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [resetting, setResetting] = useState<User | null>(null)
  const [resetPw, setResetPw] = useState('')
  const [deleting, setDeleting] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [{ users: u }, { clients: c }] = await Promise.all([adminApi.getUsers(), clientsApi.list()])
    setUsers(u); setClients(c); setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      return matchRole && matchSearch
    }))
  }, [search, roleFilter, users])

  async function handleCreate(data: Record<string, unknown>) {
    const { user } = await adminApi.createUser(data as Parameters<typeof adminApi.createUser>[0])
    setUsers(prev => [user, ...prev]); setShowCreate(false)
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editing) return
    const { user } = await adminApi.updateUser(editing.id, data)
    setUsers(prev => prev.map(u => u.id === user.id ? user : u)); setEditing(null)
  }

  async function handleReset() {
    if (!resetting || resetPw.length < 8) return
    await adminApi.resetUserPassword(resetting.id, resetPw)
    setResetting(null); setResetPw('')
  }

  async function handleDelete() {
    if (!deleting || deleteConfirm !== deleting.name) return
    setDeleteLoading(true); setDeleteError(null)
    try {
      await adminApi.deleteUser(deleting.id)
      setUsers(prev => prev.filter(u => u.id !== deleting.id))
      setDeleting(null); setDeleteConfirm('')
    } catch (err) {
      setDeleteError((err as Error).message)
    } finally { setDeleteLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{users.length} users across all roles</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>Add User</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <div className="flex gap-1">
          {(['all', 'admin', 'manager', 'client'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
              style={{ background: roleFilter === r ? 'var(--primary-500)' : 'var(--bg-secondary)', color: roleFilter === r ? '#fff' : 'var(--text-secondary)', border: `1px solid ${roleFilter === r ? 'var(--primary-500)' : 'var(--border)'}` }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <UserCircle2 size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                {['User', 'Role', 'Client', 'Status', 'Last Login', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)' }} className="transition-colors hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.client?.companyName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                        {user.forcePasswordReset && <Badge variant="warning">Reset required</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(user)} title="Edit"><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setResetting(user); setResetPw('') }} title="Reset Password"><RefreshCw size={14} /></Button>
                        {user.role !== 'admin' && (
                          <Button variant="ghost" size="icon" onClick={() => { setDeleting(user); setDeleteConfirm(''); setDeleteError(null) }} title="Delete User"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <Trash2 size={14} />
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create User" size="md">
        <UserForm clients={clients} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit User" size="md">
        {editing && <UserForm initial={editing} clients={clients} onSubmit={handleEdit} onClose={() => setEditing(null)} isEdit />}
      </Modal>
      <Modal isOpen={!!resetting} onClose={() => setResetting(null)} title="Reset Password" size="sm">
        {resetting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Reset password for <strong style={{ color: 'var(--text-primary)' }}>{resetting.name}</strong>.
            </p>
            <div className="flex gap-2">
              <Input label="New Password" value={resetPw} onChange={e => setResetPw(e.target.value)} placeholder="Min 8 characters" className="flex-1" />
              <Button type="button" variant="secondary" size="sm" className="self-end" onClick={() => setResetPw(generatePassword())}>Generate</Button>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setResetting(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReset} disabled={resetPw.length < 8}>Reset Password</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Delete User" size="sm">
        {deleting && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-sm font-medium text-red-500">This action is permanent and cannot be undone.</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                All comments, reactions, and notifications for this user will be removed. Documents they uploaded will remain but lose author attribution.
              </p>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              To confirm, type <strong style={{ color: 'var(--text-primary)' }}>{deleting.name}</strong> below:
            </p>
            <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={deleting.name} autoFocus />
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} loading={deleteLoading}
                disabled={deleteConfirm !== deleting.name}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
