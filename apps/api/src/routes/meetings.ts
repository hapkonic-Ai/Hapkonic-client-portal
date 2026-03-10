import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const meetingsRouter = Router()
meetingsRouter.use(authenticate)

const createSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  meetLink: z.string().url().optional(),
  type: z.enum(['kickoff', 'review', 'standup', 'demo', 'ad_hoc']).optional(),
  agenda: z.string().optional(),
})

const updateSchema = createSchema.omit({ projectId: true }).partial().extend({
  summary: z.string().optional(),
  actionItems: z.string().optional(),
})

// GET /meetings?projectId=xxx&upcoming=true
meetingsRouter.get('/', async (req, res, next) => {
  try {
    const { projectId, upcoming } = req.query as { projectId?: string; upcoming?: string }
    const now = new Date()

    const where: Record<string, unknown> = {}
    if (projectId) where['projectId'] = projectId
    if (upcoming === 'true') where['startTime'] = { gte: now }
    if (req.user!.role === 'client') {
      where['project'] = { client: { users: { some: { id: req.user!.userId } } } }
    }

    const meetings = await prisma.meeting.findMany({
      where: where as never,
      orderBy: { startTime: 'asc' },
      include: { project: { select: { id: true, name: true } } },
    })
    res.json({ meetings })
  } catch (err) { next(err) }
})

// GET /meetings/:id
meetingsRouter.get('/:id', async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params['id'] },
      include: { project: { select: { id: true, name: true, clientId: true } } },
    })
    if (!meeting) throw new AppError(404, 'Meeting not found', 'NOT_FOUND')
    res.json({ meeting })
  } catch (err) { next(err) }
})

// POST /meetings
meetingsRouter.post('/', authorize('admin', 'manager'), validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>
    const meeting = await prisma.meeting.create({
      data: {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        createdById: req.user!.userId,
      },
    })
    // TODO: Phase 7 — sync to Google Calendar
    res.status(201).json({ meeting })
  } catch (err) { next(err) }
})

// PATCH /meetings/:id
meetingsRouter.patch('/:id', authorize('admin', 'manager'), validate(updateSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof updateSchema>
    const meeting = await prisma.meeting.update({
      where: { id: req.params['id'] },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
    })
    res.json({ meeting })
  } catch (err) { next(err) }
})

// DELETE /meetings/:id
meetingsRouter.delete('/:id', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    await prisma.meeting.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Meeting deleted' })
  } catch (err) { next(err) }
})
