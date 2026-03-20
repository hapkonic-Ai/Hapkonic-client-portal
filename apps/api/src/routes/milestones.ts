import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const milestonesRouter = Router()
milestonesRouter.use(authenticate)

const createSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).optional(),
  targetDate: z.string().optional(),
  order: z.number().int().optional(),
})

const updateSchema = createSchema.omit({ projectId: true }).partial()

const commentSchema = z.object({
  body: z.string().min(1),
  parentId: z.string().cuid().optional(),
})

// GET /milestones?projectId=xxx
milestonesRouter.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.query as { projectId?: string }
    const milestones = await prisma.milestone.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { order: 'asc' },
      include: {
        tasks: { orderBy: { order: 'asc' } },
        _count: { select: { comments: true } },
        project: { select: { id: true, name: true, client: { select: { id: true, companyName: true } } } },
      },
    })
    res.json({ milestones })
  } catch (err) { next(err) }
})

// GET /milestones/:id
milestonesRouter.get('/:id', async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: req.params['id'] },
      include: {
        tasks: { orderBy: { order: 'asc' } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
            replies: {
              include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
            },
          },
        },
      },
    })
    if (!milestone) throw new AppError(404, 'Milestone not found', 'NOT_FOUND')
    res.json({ milestone })
  } catch (err) { next(err) }
})

// POST /milestones
milestonesRouter.post('/', authorize('admin', 'manager'), validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>
    const milestone = await prisma.milestone.create({
      data: { ...data, targetDate: data.targetDate ? new Date(data.targetDate) : undefined },
    })
    res.status(201).json({ milestone })
  } catch (err) { next(err) }
})

// PATCH /milestones/:id
milestonesRouter.patch('/:id', authorize('admin', 'manager'), validate(updateSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof updateSchema>
    const milestone = await prisma.milestone.update({
      where: { id: req.params['id'] },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        completedAt: data.status === 'completed' ? new Date() : undefined,
        completedBy: data.status === 'completed' ? req.user!.userId : undefined,
      },
    })
    res.json({ milestone })
  } catch (err) { next(err) }
})

// DELETE /milestones/:id
milestonesRouter.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await prisma.milestone.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Milestone deleted' })
  } catch (err) { next(err) }
})

// POST /milestones/:id/comments
milestonesRouter.post('/:id/comments', validate(commentSchema), async (req, res, next) => {
  try {
    const { body, parentId } = req.body as z.infer<typeof commentSchema>
    const comment = await prisma.milestoneComment.create({
      data: {
        milestoneId: req.params['id'],
        userId: req.user!.userId,
        body,
        parentId,
      },
      include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
    })
    res.status(201).json({ comment })
  } catch (err) { next(err) }
})

// PATCH /milestones/comments/:commentId/resolve
milestonesRouter.patch('/comments/:commentId/resolve', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const comment = await prisma.milestoneComment.update({
      where: { id: req.params['commentId'] },
      data: { isResolved: true },
    })
    res.json({ comment })
  } catch (err) { next(err) }
})

// DELETE /milestones/comments/:commentId
milestonesRouter.delete('/comments/:commentId', async (req, res, next) => {
  try {
    const comment = await prisma.milestoneComment.findUnique({ where: { id: req.params['commentId'] } })
    if (!comment) throw new AppError(404, 'Comment not found', 'NOT_FOUND')
    const isOwner = comment.userId === req.user!.userId
    const isAdminOrManager = req.user!.role === 'admin' || req.user!.role === 'manager'
    if (!isOwner && !isAdminOrManager) throw new AppError(403, 'Not allowed', 'FORBIDDEN')
    await prisma.milestoneComment.delete({ where: { id: req.params['commentId'] } })
    res.json({ message: 'Comment deleted' })
  } catch (err) { next(err) }
})
