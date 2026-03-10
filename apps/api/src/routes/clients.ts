import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const clientsRouter = Router()
clientsRouter.use(authenticate)

const createClientSchema = z.object({
  companyName: z.string().min(1),
  logo: z.string().url().optional(),
  industry: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
})

const updateClientSchema = createClientSchema.partial()

// GET /clients — admin/manager: all clients; client: own client
clientsRouter.get('/', async (req, res, next) => {
  try {
    if (req.user!.role === 'client') {
      const client = await prisma.client.findUnique({
        where: { id: req.user!.clientId! },
        include: { projects: { select: { id: true, name: true, status: true } } },
      })
      res.json({ client })
      return
    }
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { projects: true, users: true } } },
    })
    res.json({ clients })
  } catch (err) {
    next(err)
  }
})

// GET /clients/:id
clientsRouter.get('/:id', async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params['id'] },
      include: {
        projects: { orderBy: { createdAt: 'desc' } },
        users: { select: { id: true, name: true, email: true, role: true, isActive: true } },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!client) throw new AppError(404, 'Client not found', 'NOT_FOUND')

    // Clients can only see themselves
    if (req.user!.role === 'client' && client.id !== req.user!.clientId) {
      throw new AppError(403, 'Forbidden', 'FORBIDDEN')
    }
    res.json({ client })
  } catch (err) {
    next(err)
  }
})

// POST /clients — admin only
clientsRouter.post(
  '/',
  authorize('admin', 'manager'),
  validate(createClientSchema),
  async (req, res, next) => {
    try {
      const data = req.body as z.infer<typeof createClientSchema>
      const client = await prisma.client.create({ data })
      res.status(201).json({ client })
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /clients/:id
clientsRouter.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateClientSchema),
  async (req, res, next) => {
    try {
      const data = req.body as z.infer<typeof updateClientSchema>
      const client = await prisma.client.update({ where: { id: req.params['id'] }, data })
      res.json({ client })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /clients/:id
clientsRouter.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await prisma.client.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Client deleted' })
  } catch (err) {
    next(err)
  }
})

// PATCH /clients/:id/deactivate
clientsRouter.patch('/:id/deactivate', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params['id'] },
      data: { isActive: false },
    })
    res.json({ client })
  } catch (err) {
    next(err)
  }
})
