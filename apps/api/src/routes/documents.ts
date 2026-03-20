import { Router } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { uploadToCloud, deleteFromCloud } from '../lib/utapi'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
]

// Memory storage — no local disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type. Allowed: PDF, Excel, Word, CSV.`) as never)
    }
  },
})

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
  fileUrl: z.string().min(1),
  fileKey: z.string().min(1),
  fileSize: z.number().int().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
})

// POST /documents/upload — upload to Uploadthing CDN, returns metadata
documentsRouter.post(
  '/upload',
  authorize('admin', 'manager'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const file = req.file
      if (!file) throw new AppError(400, 'No file provided', 'VALIDATION_ERROR')

      const { url, key } = await uploadToCloud(file.buffer, file.originalname, file.mimetype)

      res.json({
        fileUrl: url,
        fileKey: key,
        fileSize: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
      })
    } catch (err) { next(err) }
  }
)

// GET /documents?projectId=xxx&clientId=xxx&category=xxx
documentsRouter.get('/', async (req, res, next) => {
  try {
    const { projectId, clientId, category } = req.query as { projectId?: string; clientId?: string; category?: string }
    const effectiveClientId = req.user!.role === 'client' ? req.user!.clientId! : clientId
    const docs = await prisma.document.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(effectiveClientId ? { project: { clientId: effectiveClientId } } : {}),
        ...(category ? { category: category as never } : {}),
      },
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, client: { select: { id: true, companyName: true } } } },
      },
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

    // Clients can only access documents belonging to their client's projects
    if (req.user!.role === 'client') {
      const project = await prisma.project.findUnique({ where: { id: doc.projectId }, select: { clientId: true } })
      if (!project || project.clientId !== req.user!.clientId) {
        throw new AppError(403, 'Forbidden', 'FORBIDDEN')
      }
    }

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
    const doc = await prisma.document.findUnique({ where: { id: req.params['id'] } })
    if (doc) {
      // Delete from Uploadthing CDN
      if (doc.fileKey) await deleteFromCloud([doc.fileKey]).catch(() => {})
      await prisma.document.delete({ where: { id: req.params['id'] } })
    }
    res.json({ message: 'Document deleted' })
  } catch (err) { next(err) }
})

// POST /documents/:id/download — authenticated; records download, returns fileUrl
documentsRouter.post('/:id/download', async (req, res, next) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params['id'] } })
    if (!doc) throw new AppError(404, 'Document not found', 'NOT_FOUND')

    // Clients can only download their own project's documents
    if (req.user!.role === 'client') {
      const project = await prisma.project.findUnique({ where: { id: doc.projectId }, select: { clientId: true } })
      if (!project || project.clientId !== req.user!.clientId) {
        throw new AppError(403, 'Forbidden', 'FORBIDDEN')
      }
    }

    await prisma.document.update({ where: { id: doc.id }, data: { downloadedAt: new Date() } })
    res.json({ fileUrl: doc.fileUrl })
  } catch (err) { next(err) }
})
