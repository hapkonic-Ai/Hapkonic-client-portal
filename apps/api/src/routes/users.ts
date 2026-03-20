import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { uploadToCloud, deleteFromCloud } from '../lib/utapi'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed') as never)
  },
})

export const usersRouter = Router()
usersRouter.use(authenticate)

// GET /users/me
usersRouter.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, clientId: true },
    })
    if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND')
    res.json({ user })
  } catch (err) { next(err) }
})

// POST /users/me/avatar — upload/replace avatar via Uploadthing CDN
usersRouter.post('/me/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    const file = req.file
    if (!file) throw new AppError(400, 'No image provided', 'VALIDATION_ERROR')

    // Delete old avatar from Uploadthing
    const existing = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { avatarKey: true },
    })
    if (existing?.avatarKey) await deleteFromCloud([existing.avatarKey]).catch(() => {})

    const ext = file.mimetype.split('/')[1] ?? 'jpg'
    const filename = `avatar-${req.user!.userId}-${Date.now()}.${ext}`
    const { url, key } = await uploadToCloud(file.buffer, filename, file.mimetype)

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar: url, avatarKey: key },
      select: { id: true, name: true, email: true, role: true, avatar: true, clientId: true },
    })
    res.json({ user })
  } catch (err) { next(err) }
})

// DELETE /users/me/avatar — remove avatar
usersRouter.delete('/me/avatar', async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { avatarKey: true },
    })
    if (existing?.avatarKey) await deleteFromCloud([existing.avatarKey]).catch(() => {})
    await prisma.user.update({ where: { id: req.user!.userId }, data: { avatar: null, avatarKey: null } })
    res.json({ message: 'Avatar removed' })
  } catch (err) { next(err) }
})
