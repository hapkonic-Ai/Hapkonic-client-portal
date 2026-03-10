import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

export const documentsRouter = Router()
documentsRouter.use(authenticate)

const createSchema = z.object({
  projectId: z.string().cuid(),
  category: z.enum([
    'contracts', 'proposals', 'design_assets', 'technical_specs', 'meeting_notes',
    'invoices_financials', 'progress_reports', 'test_reports', 'deployment_guides',
    'legal', 'miscellaneous',
  ]),
  label: z.string().min(1),
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
  fileSize: z.number().int().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
})

// GET /documents?projectId=xxx&category=xxx
documentsRouter.get('/', async (req, res, next) => {
  try {
    const { projectId, category } = req.query as { projectId?: string; category?: string }
    const docs = await prisma.document.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(category ? { category: category as never } : {}),
      },
      orderBy: { uploadedAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    })
    res.json({ documents: docs })
  } catch (err) { next(err) }
})

// GET /documents/:id
documentsRouter.get('/:id', async (req, res, next) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params['id'] },
      include: { uploadedBy: { select: { id: true, name: true } } },
    })
    if (!doc) throw new AppError(404, 'Document not found', 'NOT_FOUND')

    // Track view
    if (req.user!.role === 'client' && !doc.viewedAt) {
      await prisma.document.update({ where: { id: doc.id }, data: { viewedAt: new Date() } })
    }

    res.json({ document: doc })
  } catch (err) { next(err) }
})

// POST /documents — admin/manager only
documentsRouter.post('/', authorize('admin', 'manager'), validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>
    const doc = await prisma.document.create({
      data: { ...data, uploadedById: req.user!.userId },
    })
    res.status(201).json({ document: doc })
  } catch (err) { next(err) }
})

// DELETE /documents/:id
documentsRouter.delete('/:id', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    await prisma.document.delete({ where: { id: req.params['id'] } })
    res.json({ message: 'Document deleted' })
  } catch (err) { next(err) }
})

// POST /documents/:id/download — record download, return fileUrl
documentsRouter.post('/:id/download', async (req, res, next) => {
  try {
    const doc = await prisma.document.update({
      where: { id: req.params['id'] },
      data: { downloadedAt: new Date() },
    })
    res.json({ fileUrl: doc.fileUrl })
  } catch (err) { next(err) }
})
