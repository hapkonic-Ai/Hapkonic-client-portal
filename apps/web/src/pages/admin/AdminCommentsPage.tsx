import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, MessageSquare, CheckCircle, Send } from 'lucide-react'
import { milestonesApi, projectsApi, type MilestoneComment, type Milestone, type Project } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { formatRelativeTime } from '../../lib/utils'

export default function AdminCommentsPage() {
  const [milestones, setMilestones] = useState<(Milestone & { comments: MilestoneComment[]; project?: Project })[]>([])
  const [filtered, setFiltered] = useState<MilestoneComment[]>([])
  const [search, setSearch] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<MilestoneComment | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    setLoading(true)
    const { projects } = await projectsApi.list()
    const msPromises = projects.flatMap(p =>
      p.milestones?.map(ms => milestonesApi.get(ms.id).then(r => ({ ...r.milestone, project: p }))) ?? []
    )
    const results = await Promise.allSettled(msPromises)
    const loaded = results
      .filter((r): r is PromiseFulfilledResult<typeof milestones[0]> => r.status === 'fulfilled')
      .map(r => r.value)
    setMilestones(loaded)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    const allComments = milestones.flatMap(ms =>
      (ms.comments ?? []).map(c => ({ ...c, milestone: ms }))
    )
    setFiltered(allComments.filter(c => {
      const matchResolved = showResolved || !c.isResolved
      const matchSearch = c.body.toLowerCase().includes(q) || (c.user?.name ?? '').toLowerCase().includes(q)
      return matchResolved && matchSearch
    }))
  }, [search, showResolved, milestones])

  async function handleReply() {
    if (!replyingTo || !replyText.trim()) return
    setSending(true)
    await milestonesApi.addComment(replyingTo.milestoneId, replyText, replyingTo.id)
    setSending(false)
    setReplyingTo(null)
    setReplyText('')
    load()
  }

  async function handleResolve(comment: MilestoneComment) {
    await milestonesApi.resolveComment(comment.id)
    load()
  }

  const unresolved = filtered.filter(c => !c.isResolved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Comment Inbox</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {unresolved} unresolved comment{unresolved !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search comments..." value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={search ? <X size={16} className="cursor-pointer" onClick={() => setSearch('')} /> : undefined}
          className="flex-1 min-w-48" />
        <button onClick={() => setShowResolved(r => !r)}
          className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: showResolved ? 'var(--primary-500)' : 'var(--bg-secondary)', color: showResolved ? '#fff' : 'var(--text-secondary)', border: `1px solid ${showResolved ? 'var(--primary-500)' : 'var(--border)'}` }}>
          Show resolved
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            {showResolved ? 'No comments found.' : 'No unresolved comments. All caught up!'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment, i) => (
            <motion.div key={comment.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`p-4 ${comment.isResolved ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <Avatar name={comment.user?.name ?? 'U'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{comment.user?.name ?? 'Unknown'}</span>
                      <Badge variant="neutral" size="sm">{(comment.milestone as Milestone & { project?: Project })?.project?.name ?? 'Project'}</Badge>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>on</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{(comment.milestone as Milestone)?.title}</span>
                      {comment.isResolved && <Badge variant="success">Resolved</Badge>}
                      <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{comment.body}</p>
                    {replyingTo?.id === comment.id ? (
                      <div className="mt-3 flex gap-2">
                        <Input value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder="Write a reply..." className="flex-1" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleReply() }} />
                        <Button size="sm" onClick={handleReply} loading={sending} leftIcon={<Send size={12} />}>Reply</Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        {!comment.isResolved && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(comment)}
                              leftIcon={<MessageSquare size={12} />}>Reply</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleResolve(comment)}
                              leftIcon={<CheckCircle size={12} />}>Mark Resolved</Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
