import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { redisSet } from '../lib/redis'

export const adminRouter = Router()
adminRouter.use(authenticate, authorize('admin', 'manager'))

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'client']),
  clientId: z.string().cuid().optional(),
  password: z.string().min(8),
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'manager', 'client']).optional(),
  clientId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  forcePasswordReset: z.boolean().optional(),
})

const paginationSchema = z.object({
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).max(100000).default(0),
})

// ── Users ────────────────────────────────────────────────

// GET /admin/users
adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, role: true,
        clientId: true, isActive: true, lastLoginAt: true, createdAt: true,
        client: { select: { id: true, companyName: true } },
      },
    })
    res.json({ users })
  } catch (err) { next(err) }
})

// POST /admin/users — create user, send password reset link (never email plaintext password)
adminRouter.post('/users', validate(createUserSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createUserSchema>
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new AppError(409, 'Email already in use', 'CONFLICT')

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        clientId: data.clientId,
        passwordHash,
        forcePasswordReset: true,
      },
      select: { id: true, email: true, name: true, role: true, clientId: true },
    })

    // Send welcome email with a password reset OTP — never send plaintext passwords
    if (process.env['RESEND_API_KEY']) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      await redisSet(`otp:${data.email}`, otp, 24 * 60 * 60) // 24h expiry for first-login

      const { Resend } = await import('resend')
      const resend = new Resend(process.env['RESEND_API_KEY'])
      await resend.emails.send({
        from: process.env['RESEND_FROM'] ?? 'noreply@hapkonic.com',
        to: data.email,
        subject: 'Welcome to Hapkonic Client Portal',
        html: `
          <p>Hi ${data.name},</p>
          <p>Your Hapkonic Client Portal account has been created.</p>
          <p>Use this one-time code to set your password: <strong>${otp}</strong></p>
          <p>This code expires in 24 hours.</p>
          <p>Login at: ${process.env['CLIENT_URL']}/login</p>
        `,
      }).catch(() => {})
    }

    res.status(201).json({ user })
  } catch (err) { next(err) }
})

// PATCH /admin/users/:id
adminRouter.patch('/users/:id', validate(updateUserSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof updateUserSchema>
    const user = await prisma.user.update({
      where: { id: req.params['id'] },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })
    res.json({ user })
  } catch (err) { next(err) }
})

// DELETE /admin/users/:id — permanently delete user (admin-only)
adminRouter.delete('/users/:id', authorize('admin'), async (req, res, next) => {
  try {
    const targetId = req.params['id'] as string

    // Prevent self-deletion
    if (targetId === req.user!.userId) {
      throw new AppError(400, 'You cannot delete your own account', 'SELF_DELETE')
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, email: true, role: true, avatarKey: true },
    })
    if (!target) throw new AppError(404, 'User not found', 'NOT_FOUND')

    // Prevent deleting other admins (only super-safe escalation path)
    if (target.role === 'admin') {
      throw new AppError(403, 'Cannot delete admin accounts. Deactivate instead.', 'FORBIDDEN')
    }

    // Clean up cloud avatar
    if (target.avatarKey) {
      const { deleteFromCloud } = await import('../lib/utapi')
      await deleteFromCloud([target.avatarKey]).catch(() => {})
    }

    // Log deletion BEFORE removing the user (this log entry belongs to the admin performing the delete)
    await prisma.adminLog.create({
      data: {
        userId: req.user!.userId,
        action: 'DELETE_USER',
        entityType: 'User',
        entityId: targetId,
        metadata: { deletedUser: { name: target.name, email: target.email, role: target.role } } as never,
        ipAddress: req.ip,
      },
    })

    // Delete user — cascading FKs handle comments, reactions, notifications, progress updates, admin logs.
    // Documents & invoices use SetNull (preserve files, lose author attribution).
    await prisma.user.delete({ where: { id: targetId } })

    res.json({ message: `User ${target.name} has been permanently deleted` })
  } catch (err) { next(err) }
})

// POST /admin/users/:id/reset-password
adminRouter.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { newPassword } = req.body as { newPassword?: string }
    if (!newPassword || newPassword.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters', 'VALIDATION_ERROR')
    }
    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: req.params['id'] },
      data: { passwordHash: hash, forcePasswordReset: true },
    })
    res.json({ message: 'Password reset' })
  } catch (err) { next(err) }
})

// ── Activity Logs ─────────────────────────────────────────

// GET /admin/logs
adminRouter.get('/logs', async (req, res, next) => {
  try {
    const { userId, action, entityType } = req.query as Record<string, string | undefined>
    const { take, skip } = paginationSchema.parse(req.query)

    const logs = await prisma.adminLog.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(action ? { action: { contains: action, mode: 'insensitive' as never } } : {}),
        ...(entityType ? { entityType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json({ logs })
  } catch (err) { next(err) }
})

// ── Dashboard Stats ───────────────────────────────────────

// GET /admin/stats
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [clients, projects, documents, invoices] = await Promise.all([
      prisma.client.count(),
      prisma.project.count(),
      prisma.document.count(),
      prisma.invoice.findMany({ select: { status: true, amount: true } }),
    ])

    const invoiceStats = invoices.reduce(
      (acc, inv) => {
        const amt = Number(inv.amount)
        if (inv.status === 'paid') acc.totalPaid += amt
        else if (inv.status === 'overdue') acc.totalOverdue += amt
        else acc.totalPending += amt
        return acc
      },
      { totalPaid: 0, totalPending: 0, totalOverdue: 0 }
    )

    res.json({ clients, projects, documents, invoices: invoices.length, ...invoiceStats })
  } catch (err) { next(err) }
})
