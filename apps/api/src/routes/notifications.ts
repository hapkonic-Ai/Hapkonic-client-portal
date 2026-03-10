import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const notificationsRouter = Router()
notificationsRouter.use(authenticate)

// GET /notifications
notificationsRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const unreadCount = notifications.filter((n) => !n.isRead).length
    res.json({ notifications, unreadCount })
  } catch (err) { next(err) }
})

// PATCH /notifications/:id/read
notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    const n = await prisma.notification.findUnique({ where: { id: req.params['id'] } })
    if (!n || n.userId !== req.user!.userId) throw new AppError(404, 'Not found', 'NOT_FOUND')
    const updated = await prisma.notification.update({ where: { id: n.id }, data: { isRead: true } })
    res.json({ notification: updated })
  } catch (err) { next(err) }
})

// POST /notifications/read-all
notificationsRouter.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    })
    res.json({ message: 'All marked as read' })
  } catch (err) { next(err) }
})
