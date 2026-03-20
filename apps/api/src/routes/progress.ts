import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const progressRouter = Router()
progressRouter.use(authenticate)

const createUpdateSchema = z.object({
  projectId: z.string().cuid(),
  body: z.string().min(1),
  overallPct: z.number().int().min(0).max(100),
  designPct: z.number().int().min(0).max(100).optional(),
  devPct: z.number().int().min(0).max(100).optional(),
  testingPct: z.number().int().min(0).max(100).optional(),
  deployPct: z.number().int().min(0).max(100).optional(),
  attachments: z.array(z.object({ url: z.string(), label: z.string() })).optional(),
})

const commentSchema = z.object({
  body: z.string().min(1),
  parentId: z.string().cuid().optional(),
})

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
})

// GET /progress?projectId=xxx
progressRouter.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.query as { projectId?: string }
    const updates = await prisma.progressUpdate.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, client: { select: { companyName: true } } } },
        _count: { select: { comments: true, reactions: true } },
        reactions: true,
        comments: {
          where: { parentId: null, isDeleted: false },
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: {
              where: { isDeleted: false },
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
      },
    })
    res.json({ updates })
  } catch (err) { next(err) }
})

// GET /progress/:id
progressRouter.get('/:id', async (req, res, next) => {
  try {
    const update = await prisma.progressUpdate.findUnique({
      where: { id: req.params['id'] },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        reactions: true,
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            replies: { include: { reactions: true } },
            reactions: true,
          },
        },
      },
    })
    if (!update) throw new AppError(404, 'Update not found', 'NOT_FOUND')
    res.json({ update })
  } catch (err) { next(err) }
})

// POST /progress
progressRouter.post('/', authorize('admin', 'manager'), validate(createUpdateSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createUpdateSchema>
    const update = await prisma.progressUpdate.create({
      data: { ...data, userId: req.user!.userId, attachments: data.attachments ?? [] },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
    res.status(201).json({ update })
  } catch (err) { next(err) }
})

// PATCH /progress/:id
progressRouter.patch('/:id', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const update = await prisma.progressUpdate.update({
      where: { id: req.params['id'] },
      data: req.body as never,
    })
    res.json({ update })
  } catch (err) { next(err) }
})

// DELETE /progress/:id
progressRouter.delete('/:id', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    await prisma.progressUpdate.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Update deleted' })
  } catch (err) { next(err) }
})

// POST /progress/:id/comments
progressRouter.post('/:id/comments', validate(commentSchema), async (req, res, next) => {
  try {
    const { body, parentId } = req.body as z.infer<typeof commentSchema>
    const comment = await prisma.progressComment.create({
      data: { progressUpdateId: req.params['id'], userId: req.user!.userId, body, parentId },
    })
    res.status(201).json({ comment })
  } catch (err) { next(err) }
})

// DELETE /progress/comments/:commentId
progressRouter.delete('/comments/:commentId', async (req, res, next) => {
  try {
    const comment = await prisma.progressComment.findUnique({ where: { id: req.params['commentId'] } })
    if (!comment) throw new AppError(404, 'Comment not found', 'NOT_FOUND')
    const isOwner = comment.userId === req.user!.userId
    const isAdminOrManager = req.user!.role === 'admin' || req.user!.role === 'manager'
    if (!isOwner && !isAdminOrManager) throw new AppError(403, 'Not allowed', 'FORBIDDEN')
    await prisma.progressComment.update({ where: { id: req.params['commentId'] }, data: { isDeleted: true } })
    res.json({ message: 'Comment deleted' })
  } catch (err) { next(err) }
})

// POST /progress/:id/reactions
progressRouter.post('/:id/reactions', validate(reactionSchema), async (req, res, next) => {
  try {
    const { emoji } = req.body as z.infer<typeof reactionSchema>
    const reaction = await prisma.progressReaction.upsert({
      where: { progressUpdateId_userId_emoji: { progressUpdateId: req.params['id'], userId: req.user!.userId, emoji } },
      create: { progressUpdateId: req.params['id'], userId: req.user!.userId, emoji },
      update: {},
    })
    res.status(201).json({ reaction })
  } catch (err) { next(err) }
})

// DELETE /progress/:id/reactions/:emoji
progressRouter.delete('/:id/reactions/:emoji', async (req, res, next) => {
  try {
    await prisma.progressReaction.delete({
      where: { progressUpdateId_userId_emoji: { progressUpdateId: req.params['id']!, userId: req.user!.userId, emoji: req.params['emoji']! } },
    })
    res.json({ message: 'Reaction removed' })
  } catch (err) { next(err) }
})
