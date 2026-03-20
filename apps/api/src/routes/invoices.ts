import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const invoicesRouter = Router()
invoicesRouter.use(authenticate)

const createSchema = z.object({
  clientId: z.string().cuid(),
  invoiceNumber: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string(),
  pdfUrl: z.string().optional(),
  pdfKey: z.string().optional(),
  notes: z.string().optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'partially_paid', 'written_off']),
  paidDate: z.string().datetime().optional(),
  notes: z.string().optional(),
})

const snoozeSchema = z.object({
  days: z.number().int().min(1).max(30).default(3),
})

// GET /invoices?clientId=xxx
invoicesRouter.get('/', async (req, res, next) => {
  try {
    const { clientId } = req.query as { clientId?: string }
    const where: Record<string, unknown> = {}

    if (req.user!.role === 'client') {
      where['clientId'] = req.user!.clientId!
    } else if (clientId) {
      where['clientId'] = clientId
    }

    const invoices = await prisma.invoice.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { id: true, companyName: true } } },
    })

    // Summary stats
    const summary = invoices.reduce(
      (acc, inv) => {
        const amt = Number(inv.amount)
        if (inv.status === 'paid') acc.totalPaid += amt
        else if (inv.status === 'overdue') acc.totalOverdue += amt
        else acc.totalPending += amt
        return acc
      },
      { totalPaid: 0, totalPending: 0, totalOverdue: 0 }
    )

    res.json({ invoices, summary })
  } catch (err) { next(err) }
})

// GET /invoices/:id
invoicesRouter.get('/:id', async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params['id'] },
      include: {
        client: { select: { id: true, companyName: true } },
        reminders: { orderBy: { sentAt: 'desc' } },
      },
    })
    if (!invoice) throw new AppError(404, 'Invoice not found', 'NOT_FOUND')
    if (req.user!.role === 'client' && invoice.clientId !== req.user!.clientId) {
      throw new AppError(403, 'Forbidden', 'FORBIDDEN')
    }
    res.json({ invoice })
  } catch (err) { next(err) }
})

// POST /invoices
invoicesRouter.post('/', authorize('admin', 'manager'), validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        uploadedById: req.user!.userId,
      },
    })
    res.status(201).json({ invoice })
  } catch (err) { next(err) }
})

// PATCH /invoices/:id/status
invoicesRouter.patch('/:id/status', authorize('admin', 'manager'), validate(updateStatusSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof updateStatusSchema>
    const invoice = await prisma.invoice.update({
      where: { id: req.params['id'] },
      data: {
        status: data.status,
        paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
        notes: data.notes,
      },
    })
    res.json({ invoice })
  } catch (err) { next(err) }
})

// POST /invoices/:id/snooze
invoicesRouter.post('/:id/snooze', validate(snoozeSchema), async (req, res, next) => {
  try {
    const { days } = req.body as z.infer<typeof snoozeSchema>
    const snoozedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    const invoice = await prisma.invoice.update({
      where: { id: req.params['id'] },
      data: { snoozedUntil },
    })
    res.json({ invoice })
  } catch (err) { next(err) }
})

// DELETE /invoices/:id
invoicesRouter.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Invoice deleted' })
  } catch (err) { next(err) }
})
