import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MessageSquare, CheckCircle, Send, TrendingUp, ChevronDown, ChevronUp, Filter, Trash2 } from 'lucide-react'
import {
  milestonesApi, progressApi,
  type MilestoneComment, type Milestone, type ProgressUpdate, type ProgressComment,
} from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { formatRelativeTime } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import { useConfirm } from '../../components/ui/ConfirmDialog'

type Tab = 'milestone' | 'progress'

type MilestoneWithComments = Milestone & {
  comments: MilestoneComment[]
}

export default function AdminCommentsPage() {
  const { error: toastError } = useToast()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [tab, setTab] = useState<Tab>('progress')

  // ── Milestone state ───────────────────────────────────────────────────────
  const [milestones, setMilestones] = useState<MilestoneWithComments[]>([])
  const [showResolved, setShowResolved] = useState(false)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<MilestoneComment | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  // ── Progress state ────────────────────────────────────────────────────────
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([])
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null)
  const [progressReplyingTo, setProgressReplyingTo] = useState<ProgressComment | null>(null)
  const [progressReplyText, setProgressReplyText] = useState('')
  const [progressSending, setProgressSending] = useState(false)

  // ── Shared state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // ── Load ──────────────────────────────────────────────────────────────────
  async function loadMilestones() {
    const { milestones: all } = await milestonesApi.list()
    const withComments = all.filter(ms => (ms._count?.comments ?? 0) > 0)
    const results = await Promise.allSettled(
      withComments.map(ms => milestonesApi.get(ms.id).then(r => ({
        ...r.milestone,
        project: ms.project,
        comments: r.milestone.comments ?? [],
      })))
    )
    const loaded = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<MilestoneWithComments>).value)
    setMilestones(loaded)
  }

  async function loadProgress() {
    const { updates } = await progressApi.list()
    setProgressUpdates(updates.filter(u => (u._count?.comments ?? 0) > 0))
  }

  async function load() {
    setLoading(true)
    try {
      await Promise.all([loadMilestones(), loadProgress()])
    } catch {
      toastError('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Derived project lists ─────────────────────────────────────────────────
  const milestoneProjects = useMemo(() => {
    const map = new Map<string, string>()
    milestones.forEach(ms => {
      if (ms.project) map.set(ms.project.id, ms.project.name)
    })
    return Array.from(map.entries())
  }, [milestones])

  const progressProjects = useMemo(() => {
    const map = new Map<string, string>()
    progressUpdates.forEach(u => {
      if (u.project) map.set(u.project.id, u.project.name)
    })
    return Array.from(map.entries())
  }, [progressUpdates])

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredMilestones = useMemo(() => {
    const q = search.toLowerCase()
    return milestones.filter(ms => {
      if (projectFilter !== 'all' && ms.project?.id !== projectFilter) return false
      const visibleComments = ms.comments.filter(c => showResolved || !c.isResolved)
      if (visibleComments.length === 0) return false
      if (!q) return true
      return (
        ms.title.toLowerCase().includes(q) ||
        ms.project?.name.toLowerCase().includes(q) ||
        visibleComments.some(c => c.body.toLowerCase().includes(q) || (c.user?.name ?? '').toLowerCase().includes(q))
      )
    })
  }, [milestones, search, showResolved, projectFilter])

  const filteredProgress = useMemo(() => {
    const q = search.toLowerCase()
    return progressUpdates.filter(u => {
      if (projectFilter !== 'all' && u.project?.id !== projectFilter) return false
      if (!q) return true
      return (
        u.body.toLowerCase().includes(q) ||
        u.project?.name.toLowerCase().includes(q) ||
        (u.comments ?? []).some(c =>
          c.body.toLowerCase().includes(q) || (c.user?.name ?? '').toLowerCase().includes(q)
        )
      )
    })
  }, [progressUpdates, search, projectFilter])

  // ── Counts ────────────────────────────────────────────────────────────────
  const milestoneUnresolved = milestones.reduce(
    (acc, ms) => acc + ms.comments.filter(c => !c.isResolved).length, 0
  )
  const progressCommentCount = progressUpdates.reduce(
    (acc, u) => acc + (u._count?.comments ?? 0), 0
  )

  const activeProjects = tab === 'milestone' ? milestoneProjects : progressProjects

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleMilestoneReply() {
    if (!replyingTo || !replyText.trim()) return
    setSending(true)
    try {
      await milestonesApi.addComment(replyingTo.milestoneId, replyText, replyingTo.id)
      setReplyingTo(null)
      setReplyText('')
      await loadMilestones()
    } catch {
      toastError('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  async function handleMilestoneResolve(comment: MilestoneComment) {
    try {
      await milestonesApi.resolveComment(comment.id)
      await loadMilestones()
    } catch {
      toastError('Failed to resolve comment')
    }
  }

  async function handleProgressReply() {
    if (!progressReplyingTo || !progressReplyText.trim()) return
    setProgressSending(true)
    try {
      await progressApi.addComment(progressReplyingTo.progressUpdateId, progressReplyText, progressReplyingTo.id)
      setProgressReplyingTo(null)
      setProgressReplyText('')
      await loadProgress()
    } catch {
      toastError('Failed to send reply')
    } finally {
      setProgressSending(false)
    }
  }

  async function handleDeleteMilestoneComment(commentId: string) {
    const ok = await confirm({
      title: 'Delete Comment',
      message: 'This comment will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete',
    })
    if (!ok) return
    try {
      await milestonesApi.deleteComment(commentId)
      await loadMilestones()
    } catch {
      toastError('Failed to delete comment')
    }
  }

  async function handleDeleteProgressComment(commentId: string) {
    const ok = await confirm({
      title: 'Delete Comment',
      message: 'This comment will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete',
    })
    if (!ok) return
    try {
      await progressApi.deleteComment(commentId)
      await loadProgress()
    } catch {
      toastError('Failed to delete comment')
    }
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Comment Inbox</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Review and reply to client comments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-elevated)' }}>
        {([
          { id: 'progress' as Tab, label: 'Progress Comments', count: progressCommentCount, icon: TrendingUp },
          { id: 'milestone' as Tab, label: 'Milestone Comments', count: milestoneUnresolved, icon: MessageSquare },
        ] as const).map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setProjectFilter('all') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === id ? 'var(--bg-surface)' : 'transparent',
              color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Icon size={14} />
            {label}
            {count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--color-primary-500)', color: '#fff' }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex gap-3 flex-wrap items-center">
        <Input
          placeholder="Search comments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48"
        />

        {/* Project filter */}
        {activeProjects.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <button
              onClick={() => setProjectFilter('all')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: projectFilter === 'all' ? 'var(--color-primary-500)' : 'var(--bg-elevated)',
                color: projectFilter === 'all' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              All
            </button>
            {activeProjects.map(([id, name]) => (
              <button
                key={id}
                onClick={() => setProjectFilter(id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: projectFilter === id ? 'var(--color-primary-500)' : 'var(--bg-elevated)',
                  color: projectFilter === id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {tab === 'milestone' && (
          <button
            onClick={() => setShowResolved(r => !r)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={{
              background: showResolved ? 'var(--color-primary-500)' : 'transparent',
              color: showResolved ? '#fff' : 'var(--text-secondary)',
              borderColor: showResolved ? 'var(--color-primary-500)' : 'var(--border-default)',
            }}
          >
            Show resolved
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : tab === 'progress' ? (
        <ProgressCommentsSection
          updates={filteredProgress}
          expandedUpdate={expandedUpdate}
          setExpandedUpdate={setExpandedUpdate}
          progressReplyingTo={progressReplyingTo}
          setProgressReplyingTo={setProgressReplyingTo}
          progressReplyText={progressReplyText}
          setProgressReplyText={setProgressReplyText}
          handleProgressReply={handleProgressReply}
          progressSending={progressSending}
          handleDeleteComment={handleDeleteProgressComment}
        />
      ) : (
        <MilestoneCommentsSection
          milestones={filteredMilestones}
          showResolved={showResolved}
          expandedMilestone={expandedMilestone}
          setExpandedMilestone={setExpandedMilestone}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          handleReply={handleMilestoneReply}
          sending={sending}
          handleResolve={handleMilestoneResolve}
          handleDeleteComment={handleDeleteMilestoneComment}
        />
      )}
    </div>
  )
}

// ── Progress Comments Section ─────────────────────────────────────────────────

function ProgressCommentsSection({
  updates, expandedUpdate, setExpandedUpdate,
  progressReplyingTo, setProgressReplyingTo,
  progressReplyText, setProgressReplyText,
  handleProgressReply, progressSending, handleDeleteComment,
}: {
  updates: ProgressUpdate[]
  expandedUpdate: string | null
  setExpandedUpdate: (id: string | null) => void
  progressReplyingTo: ProgressComment | null
  setProgressReplyingTo: (c: ProgressComment | null) => void
  progressReplyText: string
  setProgressReplyText: (t: string) => void
  handleProgressReply: () => void
  progressSending: boolean
  handleDeleteComment: (id: string) => void
}) {
  if (updates.length === 0) {
    return (
      <Card className="p-12 text-center">
        <TrendingUp size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>No client comments on progress updates yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {updates.map((update, i) => {
        const isExpanded = expandedUpdate === update.id
        const comments = update.comments ?? []
        return (
          <motion.div key={update.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="overflow-hidden p-0">
              <button
                className="w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-[var(--bg-elevated)]"
                onClick={() => setExpandedUpdate(isExpanded ? null : update.id)}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-primary-500)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="neutral" size="sm">{update.project?.name ?? 'Project'}</Badge>
                    {update.project?.client?.companyName && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · {update.project.client.companyName}
                      </span>
                    )}
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                      {formatRelativeTime(update.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{update.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
                      Overall {update.overallPct}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {comments.length} client comment{comments.length !== 1 ? 's' : ''}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                      : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: 'var(--border-default)' }}>
                      {comments.length === 0
                        ? <p className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
                        : comments.map(comment => (
                          <ProgressCommentCard key={comment.id} comment={comment}
                            replyingTo={progressReplyingTo} setReplyingTo={setProgressReplyingTo}
                            replyText={progressReplyText} setReplyText={setProgressReplyText}
                            handleReply={handleProgressReply} sending={progressSending}
                            handleDelete={handleDeleteComment}
                          />
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function ProgressCommentCard({
  comment, replyingTo, setReplyingTo, replyText, setReplyText, handleReply, sending, handleDelete,
}: {
  comment: ProgressComment
  replyingTo: ProgressComment | null
  setReplyingTo: (c: ProgressComment | null) => void
  replyText: string
  setReplyText: (t: string) => void
  handleReply: () => void
  sending: boolean
  handleDelete: (id: string) => void
}) {
  return (
    <div className="flex items-start gap-3 pl-2 group">
      <Avatar name={comment.user?.name ?? 'U'} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {comment.user?.name ?? 'Client'}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(comment.createdAt)}</span>
          <button
            onClick={() => handleDelete(comment.id)}
            className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{comment.body}</p>
        {(comment.replies ?? []).length > 0 && (
          <div className="mt-2 pl-3 space-y-2 border-l-2" style={{ borderColor: 'var(--border-default)' }}>
            {(comment.replies ?? []).map(reply => (
              <div key={reply.id} className="flex items-start gap-2">
                <Avatar name={reply.user?.name ?? 'U'} size="sm" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{reply.user?.name ?? 'Team'}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {replyingTo?.id === comment.id ? (
          <div className="mt-2 flex gap-2">
            <Input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..." className="flex-1"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleReply() }} />
            <Button size="sm" onClick={handleReply} loading={sending} leftIcon={<Send size={12} />}>Reply</Button>
            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="mt-1"
            onClick={() => setReplyingTo(comment)} leftIcon={<MessageSquare size={12} />}>
            Reply
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Milestone Comments Section ────────────────────────────────────────────────

function MilestoneCommentsSection({
  milestones, showResolved, expandedMilestone, setExpandedMilestone,
  replyingTo, setReplyingTo, replyText, setReplyText, handleReply, sending, handleResolve, handleDeleteComment,
}: {
  milestones: MilestoneWithComments[]
  showResolved: boolean
  expandedMilestone: string | null
  setExpandedMilestone: (id: string | null) => void
  replyingTo: MilestoneComment | null
  setReplyingTo: (c: MilestoneComment | null) => void
  replyText: string
  setReplyText: (t: string) => void
  handleReply: () => void
  sending: boolean
  handleResolve: (c: MilestoneComment) => void
  handleDeleteComment: (id: string) => void
}) {
  if (milestones.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>
          {showResolved ? 'No comments found.' : 'No unresolved milestone comments. All caught up!'}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {milestones.map((ms, i) => {
        const isExpanded = expandedMilestone === ms.id
        const visibleComments = ms.comments.filter(c => showResolved || !c.isResolved)
        const unresolvedCount = ms.comments.filter(c => !c.isResolved).length

        return (
          <motion.div key={ms.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="overflow-hidden p-0">
              {/* Milestone header */}
              <button
                className="w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-[var(--bg-elevated)]"
                onClick={() => setExpandedMilestone(isExpanded ? null : ms.id)}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <MessageSquare size={16} style={{ color: 'var(--color-primary-500)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {ms.project && <Badge variant="neutral" size="sm">{ms.project.name}</Badge>}
                    {ms.project?.client?.companyName && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · {ms.project.client.companyName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ms.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {unresolvedCount > 0 && (
                      <span className="text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
                        {unresolvedCount} unresolved
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {ms.comments.length} comment{ms.comments.length !== 1 ? 's' : ''}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                      : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>
              </button>

              {/* Expanded comments */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: 'var(--border-default)' }}>
                      {visibleComments.length === 0
                        ? <p className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>No comments to show.</p>
                        : visibleComments.map(comment => (
                          <MilestoneCommentCard
                            key={comment.id}
                            comment={comment}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleReply={handleReply}
                            sending={sending}
                            handleResolve={handleResolve}
                            handleDelete={handleDeleteComment}
                          />
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function MilestoneCommentCard({
  comment, replyingTo, setReplyingTo, replyText, setReplyText, handleReply, sending, handleResolve, handleDelete,
}: {
  comment: MilestoneComment
  replyingTo: MilestoneComment | null
  setReplyingTo: (c: MilestoneComment | null) => void
  replyText: string
  setReplyText: (t: string) => void
  handleReply: () => void
  sending: boolean
  handleResolve: (c: MilestoneComment) => void
  handleDelete: (id: string) => void
}) {
  return (
    <div className={`flex items-start gap-3 pl-2 group ${comment.isResolved ? 'opacity-50' : ''}`}>
      <Avatar name={comment.user?.name ?? 'U'} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {comment.user?.name ?? 'Unknown'}
          </span>
          {comment.isResolved && <Badge variant="success" size="sm">Resolved</Badge>}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatRelativeTime(comment.createdAt)}
          </span>
          <button
            onClick={() => handleDelete(comment.id)}
            className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{comment.body}</p>

        {replyingTo?.id === comment.id ? (
          <div className="mt-2 flex gap-2">
            <Input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..." className="flex-1"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleReply() }} />
            <Button size="sm" onClick={handleReply} loading={sending} leftIcon={<Send size={12} />}>Reply</Button>
            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
          </div>
        ) : !comment.isResolved && (
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(comment)}
              leftIcon={<MessageSquare size={12} />}>Reply</Button>
            <Button size="sm" variant="ghost" onClick={() => handleResolve(comment)}
              leftIcon={<CheckCircle size={12} />}>Mark Resolved</Button>
          </div>
        )}
      </div>
    </div>
  )
}
