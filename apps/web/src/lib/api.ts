// ── API Client ────────────────────────────────────────────────────────────────
// All requests attach the access token from localStorage.
// On 401, the client attempts one refresh before giving up.

const BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:4000/api/v1'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'manager' | 'client'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'delayed'
export type DocumentCategory =
  | 'contracts' | 'proposals' | 'design_assets' | 'technical_specs' | 'meeting_notes'
  | 'invoices_financials' | 'progress_reports' | 'test_reports' | 'deployment_guides'
  | 'legal' | 'miscellaneous'
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'written_off'
export type MeetingType = 'kickoff' | 'review' | 'standup' | 'demo' | 'ad_hoc'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  clientId?: string
  avatar?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  forcePasswordReset?: boolean
  client?: { id: string; companyName: string }
}

export interface Client {
  id: string
  companyName: string
  logo?: string
  industry?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  isActive: boolean
  onboardedAt?: string
  createdAt: string
  _count?: { projects: number; users: number }
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string
  status: MilestoneStatus
  targetDate?: string
  completedAt?: string
  order: number
  _count?: { comments: number }
  project?: { id: string; name: string; client?: { id: string; companyName: string } }
}

export interface Task {
  id: string
  projectId: string
  milestoneId?: string
  title: string
  description?: string
  status: TaskStatus
  assigneeId?: string
  dueDate?: string
}

export interface Project {
  id: string
  clientId: string
  name: string
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
  overallPct: number
  designPct: number
  devPct: number
  testingPct: number
  deployPct: number
  createdAt: string
  client?: { id: string; companyName: string }
  milestones?: Milestone[]
  tasks?: Task[]
}

export interface Document {
  id: string
  projectId: string
  label: string
  fileUrl: string
  fileKey: string
  category: DocumentCategory
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string
  uploadedById: string
  uploadedAt: string
  viewedAt?: string
  downloadedAt?: string
  project?: { id: string; name: string; client?: { id: string; companyName: string } }
  uploadedBy?: { id: string; name: string }
}

export interface Meeting {
  id: string
  projectId: string
  title: string
  startTime: string
  endTime: string
  meetLink?: string
  type?: MeetingType
  agenda?: string
  summary?: string
  actionItems?: string
  createdById: string
  project?: { id: string; name: string }
}

export interface Invoice {
  id: string
  clientId: string
  invoiceNumber: string
  amount: number
  status: InvoiceStatus
  dueDate: string
  paidDate?: string
  notes?: string
  pdfUrl?: string
  createdAt: string
  client?: { id: string; companyName: string }
}

export interface ProgressComment {
  id: string
  progressUpdateId: string
  userId: string
  body: string
  parentId?: string
  isDeleted: boolean
  createdAt: string
  user?: { id: string; name: string; avatar?: string }
  replies?: ProgressComment[]
}

export interface ProgressUpdate {
  id: string
  projectId: string
  userId: string
  body: string
  overallPct: number
  designPct?: number
  devPct?: number
  testingPct?: number
  deployPct?: number
  attachments: { url: string; label: string }[]
  createdAt: string
  user?: { id: string; name: string; avatar?: string }
  _count?: { comments: number; reactions: number }
  comments?: ProgressComment[]
  project?: { id: string; name: string; client?: { companyName: string } }
}

export interface MilestoneComment {
  id: string
  milestoneId: string
  userId: string
  body: string
  parentId?: string
  isResolved: boolean
  createdAt: string
  editedAt?: string
  user?: { id: string; name: string; avatar?: string }
  milestone?: { id: string; title: string; project?: { id: string; name: string; client?: { companyName: string } } }
  replies?: MilestoneComment[]
}

export interface AdminLog {
  id: string
  userId?: string
  action: string
  entityType?: string
  entityId?: string
  meta?: Record<string, unknown>
  createdAt: string
  ipAddress?: string
  user?: { id: string; name: string; email: string }
}

export interface AdminStats {
  clients: number
  projects: number
  documents: number
  invoices: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      if (!res.ok) return false
      const data = await res.json() as { accessToken: string }
      accessToken = data.accessToken
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && retry && path !== '/auth/refresh') {
    const ok = await tryRefresh()
    if (ok) return request<T>(method, path, body, false)
    accessToken = null
    window.dispatchEvent(new Event('auth:logout'))
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Request failed' } })) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? 'Request failed')
  }

  return res.json() as Promise<T>
}

const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: User }>('/auth/login', { email, password }),
  logout: () => api.post<void>('/auth/logout'),
  refresh: () => api.post<{ accessToken: string; user: User }>('/auth/refresh'),
  me: () => api.get<{ user: User }>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) => api.post<void>('/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) => api.post<void>('/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<void>('/auth/reset-password', { email, otp, newPassword }),
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return fetch(`${BASE}/users/me/avatar`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: form,
    }).then(async r => {
      const data = await r.json()
      if (!r.ok) throw new Error(data.message ?? 'Upload failed')
      return data as { user: User }
    })
  },
  removeAvatar: () => api.delete<{ message: string }>('/users/me/avatar'),
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getUsers: () => api.get<{ users: User[] }>('/admin/users'),
  createUser: (data: {
    email: string; name: string; role: Role; clientId?: string; password: string
  }) => api.post<{ user: User }>('/admin/users', data),
  updateUser: (id: string, data: Partial<{ name: string; role: Role; clientId: string; isActive: boolean; forcePasswordReset: boolean }>) =>
    api.patch<{ user: User }>(`/admin/users/${id}`, data),
  resetUserPassword: (id: string, newPassword: string) =>
    api.post<{ message: string }>(`/admin/users/${id}/reset-password`, { newPassword }),
  getLogs: (params?: { userId?: string; action?: string; entityType?: string; take?: number; skip?: number }) => {
    const q = new URLSearchParams()
    if (params?.userId) q.set('userId', params.userId)
    if (params?.action) q.set('action', params.action)
    if (params?.entityType) q.set('entityType', params.entityType)
    if (params?.take) q.set('take', String(params.take))
    if (params?.skip) q.set('skip', String(params.skip))
    return api.get<{ logs: AdminLog[] }>(`/admin/logs${q.size ? `?${q}` : ''}`)
  },
}

// ── Clients ───────────────────────────────────────────────────────────────────

export const clientsApi = {
  list: () => api.get<{ clients: Client[] }>('/clients'),
  get: (id: string) => api.get<{ client: Client & { projects: Project[]; users: User[] } }>(`/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'isActive' | 'createdAt' | '_count' | 'onboardedAt'>) =>
    api.post<{ client: Client }>('/clients', data),
  update: (id: string, data: Partial<Client>) => api.patch<{ client: Client }>(`/clients/${id}`, data),
  deactivate: (id: string) => api.patch<{ client: Client }>(`/clients/${id}/deactivate`),
  delete: (id: string) => api.delete<void>(`/clients/${id}`),
}

// ── Projects ──────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (clientId?: string) => {
    const q = clientId ? `?clientId=${clientId}` : ''
    return api.get<{ projects: Project[] }>(`/projects${q}`)
  },
  get: (id: string) => api.get<{ project: Project }>(`/projects/${id}`),
  create: (data: {
    clientId: string; name: string; description?: string
    startDate?: string; endDate?: string; status?: ProjectStatus
  }) => api.post<{ project: Project }>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.patch<{ project: Project }>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<void>(`/projects/${id}`),
}

// ── Milestones ────────────────────────────────────────────────────────────────

export const milestonesApi = {
  list: (projectId?: string) => {
    const q = projectId ? `?projectId=${projectId}` : ''
    return api.get<{ milestones: Milestone[] }>(`/milestones${q}`)
  },
  get: (id: string) => api.get<{ milestone: Milestone & { comments: MilestoneComment[] } }>(`/milestones/${id}`),
  create: (data: {
    projectId: string; title: string; description?: string
    targetDate?: string; order?: number
  }) => api.post<{ milestone: Milestone }>('/milestones', data),
  update: (id: string, data: Partial<Milestone>) => api.patch<{ milestone: Milestone }>(`/milestones/${id}`, data),
  delete: (id: string) => api.delete<void>(`/milestones/${id}`),
  addComment: (id: string, body: string, parentId?: string) =>
    api.post<{ comment: MilestoneComment }>(`/milestones/${id}/comments`, { body, parentId }),
  resolveComment: (commentId: string) =>
    api.patch<{ comment: MilestoneComment }>(`/milestones/comments/${commentId}/resolve`),
  deleteComment: (commentId: string) =>
    api.delete<{ message: string }>(`/milestones/comments/${commentId}`),
}

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentsApi = {
  list: (params?: { projectId?: string; clientId?: string; category?: string }) => {
    const q = new URLSearchParams()
    if (params?.projectId) q.set('projectId', params.projectId)
    if (params?.clientId) q.set('clientId', params.clientId)
    if (params?.category) q.set('category', params.category)
    return api.get<{ documents: Document[] }>(`/documents${q.size ? `?${q}` : ''}`)
  },
  get: (id: string) => api.get<{ document: Document }>(`/documents/${id}`),
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE}/documents/upload`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: form,
    }).then(async r => {
      const data = await r.json()
      if (!r.ok) throw new Error(data.message ?? 'Upload failed')
      return data as { fileUrl: string; fileKey: string; fileSize: number; mimeType: string; originalName: string }
    })
  },
  create: (data: {
    projectId: string; label: string; fileUrl: string
    fileKey: string; category: DocumentCategory
    fileSize?: number; mimeType?: string
  }) => api.post<{ document: Document }>('/documents', data),
  delete: (id: string) => api.delete<void>(`/documents/${id}`),
  download: (id: string) => api.post<{ fileUrl: string }>(`/documents/${id}/download`),
}

// ── Meetings ──────────────────────────────────────────────────────────────────

export const meetingsApi = {
  list: (params?: { projectId?: string; upcoming?: boolean }) => {
    const q = new URLSearchParams()
    if (params?.projectId) q.set('projectId', params.projectId)
    if (params?.upcoming) q.set('upcoming', 'true')
    return api.get<{ meetings: Meeting[] }>(`/meetings${q.size ? `?${q}` : ''}`)
  },
  get: (id: string) => api.get<{ meeting: Meeting }>(`/meetings/${id}`),
  create: (data: {
    projectId: string; title: string; startTime: string; endTime: string
    meetLink?: string; type?: MeetingType; agenda?: string
  }) => api.post<{ meeting: Meeting }>('/meetings', data),
  update: (id: string, data: Partial<Meeting>) => api.patch<{ meeting: Meeting }>(`/meetings/${id}`, data),
  delete: (id: string) => api.delete<void>(`/meetings/${id}`),
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export const invoicesApi = {
  list: (params?: { clientId?: string; status?: InvoiceStatus }) => {
    const q = new URLSearchParams()
    if (params?.clientId) q.set('clientId', params.clientId)
    if (params?.status) q.set('status', params.status)
    return api.get<{
      invoices: Invoice[]
      summary: { totalPaid: number; totalPending: number; totalOverdue: number; count: number }
    }>(`/invoices${q.size ? `?${q}` : ''}`)
  },
  get: (id: string) => api.get<{ invoice: Invoice }>(`/invoices/${id}`),
  create: (data: {
    projectId?: string; clientId: string; invoiceNumber: string
    amount: number; currency?: string; dueDate: string
    description?: string; notes?: string; pdfUrl?: string
  }) => api.post<{ invoice: Invoice }>('/invoices', data),
  updateStatus: (id: string, status: InvoiceStatus, notes?: string) =>
    api.patch<{ invoice: Invoice }>(`/invoices/${id}/status`, { status, notes }),
  delete: (id: string) => api.delete<void>(`/invoices/${id}`),
}

// ── Progress ──────────────────────────────────────────────────────────────────

export const progressApi = {
  list: (projectId?: string) => {
    const q = projectId ? `?projectId=${projectId}` : ''
    return api.get<{ updates: ProgressUpdate[] }>(`/progress${q}`)
  },
  get: (id: string) => api.get<{ update: ProgressUpdate }>(`/progress/${id}`),
  create: (data: {
    projectId: string; body: string; overallPct: number
    designPct?: number; devPct?: number; testingPct?: number; deployPct?: number
    attachments?: { url: string; label: string }[]
  }) => api.post<{ update: ProgressUpdate }>('/progress', data),
  update: (id: string, data: Partial<ProgressUpdate>) => api.patch<{ update: ProgressUpdate }>(`/progress/${id}`, data),
  delete: (id: string) => api.delete<void>(`/progress/${id}`),
  addComment: (id: string, body: string, parentId?: string) =>
    api.post<{ comment: ProgressComment }>(`/progress/${id}/comments`, { body, parentId }),
  deleteComment: (commentId: string) =>
    api.delete<{ message: string }>(`/progress/comments/${commentId}`),
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'meeting_reminder' | 'new_document' | 'progress_update'
  | 'new_comment' | 'mention' | 'payment_due' | 'milestone_reached'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export const notificationsApi = {
  list: () => api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
  markRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>('/notifications/read-all'),
}

export default api
