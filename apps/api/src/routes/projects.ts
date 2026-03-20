import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const projectsRouter = Router()
projectsRouter.use(authenticate)

const createSchema = z.object({
  clientId: z.string().cuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const updateSchema = createSchema.omit({ clientId: true }).partial()

// GET /projects
projectsRouter.get('/', async (req, res, next) => {
  try {
    const where = req.user!.role === 'client'
      ? { client: { users: { some: { id: req.user!.userId } } } }
      : {}

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true, logo: true } },
        _count: { select: { milestones: true, tasks: true, documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ projects })
  } catch (err) {
    next(err)
  }
})

// GET /projects/:id
projectsRouter.get('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params['id'] },
      include: {
        client: { select: { id: true, companyName: true, logo: true } },
        milestones: { orderBy: { order: 'asc' }, include: { tasks: { orderBy: { order: 'asc' } } } },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    })
    if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND')

    // Clients can only view their own projects
    if (req.user!.role === 'client' && project.clientId !== req.user!.clientId) {
      throw new AppError(403, 'Forbidden', 'FORBIDDEN')
    }

    res.json({ project })
  } catch (err) {
    next(err)
  }
})

// POST /projects
projectsRouter.post('/', authorize('admin', 'manager'), validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>
    const project = await prisma.project.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
    res.status(201).json({ project })
  } catch (err) {
    next(err)
  }
})

// PATCH /projects/:id
projectsRouter.patch('/:id', authorize('admin', 'manager'), validate(updateSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof updateSchema>
    const project = await prisma.project.update({
      where: { id: req.params['id'] },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
    res.json({ project })
  } catch (err) {
    next(err)
  }
})

// DELETE /projects/:id
projectsRouter.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Project deleted' })
  } catch (err) {
    next(err)
  }
})
