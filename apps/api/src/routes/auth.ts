import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken, cookieOptions } from '../lib/jwt'
import { redisSet, redisGet, redisDel } from '../lib/redis'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { rateLimit } from '../middleware/rateLimiter'
import { AppError } from '../middleware/errorHandler'

export const authRouter = Router()

// ── Schemas ──────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const forgotSchema = z.object({
  email: z.string().email(),
})

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// ── POST /auth/login ──────────────────────────────────────
authRouter.post(
  '/login',
  rateLimit('login', (req) => (req.body as { email?: string })?.email ?? req.ip ?? 'anon'),
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
      }

      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId ?? undefined,
        forcePasswordReset: user.forcePasswordReset,
      }

      const accessToken = signAccessToken(payload)
      const refreshToken = signRefreshToken(user.id)

      await redisSet(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60)
      res.cookie('refreshToken', refreshToken, cookieOptions(7))

      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
          avatar: user.avatar,
          forcePasswordReset: user.forcePasswordReset,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// ── POST /auth/refresh ────────────────────────────────────
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = (req.cookies as Record<string, string | undefined>)?.refreshToken
    if (!token) throw new AppError(401, 'No refresh token', 'UNAUTHENTICATED')

    const { userId } = verifyRefreshToken(token)
    const stored = await redisGet<string>(`refresh:${userId}`)
    if (stored !== token) throw new AppError(401, 'Refresh token revoked', 'TOKEN_REVOKED')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) throw new AppError(401, 'User not found', 'UNAUTHENTICATED')

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId ?? undefined,
      forcePasswordReset: user.forcePasswordReset,
    }

    const newAccessToken = signAccessToken(payload)
    const newRefreshToken = signRefreshToken(user.id)

    await redisSet(`refresh:${userId}`, newRefreshToken, 7 * 24 * 60 * 60)
    res.cookie('refreshToken', newRefreshToken, cookieOptions(7))
    res.json({ accessToken: newAccessToken })
  } catch (err) {
    next(err)
  }
})

// ── POST /auth/logout ─────────────────────────────────────
authRouter.post('/logout', authenticate, async (req, res, next) => {
  try {
    await redisDel(`refresh:${req.user!.userId}`)
    res.clearCookie('refreshToken', { path: '/' })
    res.json({ message: 'Logged out' })
  } catch (err) {
    next(err)
  }
})

// ── POST /auth/forgot-password ───────────────────────────
authRouter.post(
  '/forgot-password',
  rateLimit('forgotPw', (req) => (req.body as { email?: string })?.email ?? req.ip ?? 'anon'),
  validate(forgotSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body as z.infer<typeof forgotSchema>
      const user = await prisma.user.findUnique({ where: { email } })

      if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await redisSet(`otp:${email}`, otp, 5 * 60)

        const { Resend } = await import('resend')
        const resend = new Resend(process.env['RESEND_API_KEY'])
        await resend.emails.send({
          from: process.env['RESEND_FROM'] ?? 'noreply@hapkonic.com',
          to: email,
          subject: 'Hapkonic — Password Reset OTP',
          html: `<p>Your OTP: <strong>${otp}</strong>. Valid for 5 minutes.</p>`,
        }).catch(() => {})
      }

      res.json({ message: 'If that email exists, an OTP has been sent.' })
    } catch (err) {
      next(err)
    }
  }
)

// ── POST /auth/verify-otp ────────────────────────────────
authRouter.post('/verify-otp', validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { email, otp } = req.body as z.infer<typeof verifyOtpSchema>
    const stored = await redisGet<string>(`otp:${email}`)
    if (!stored || stored !== otp) throw new AppError(400, 'Invalid or expired OTP', 'OTP_INVALID')
    res.json({ valid: true })
  } catch (err) {
    next(err)
  }
})

// ── POST /auth/reset-password ────────────────────────────
authRouter.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body as z.infer<typeof resetPasswordSchema>
    const stored = await redisGet<string>(`otp:${email}`)
    if (!stored || stored !== otp) throw new AppError(400, 'Invalid or expired OTP', 'OTP_INVALID')

    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, forcePasswordReset: false },
    })
    await redisDel(`otp:${email}`)
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
})

// ── POST /auth/change-password ───────────────────────────
authRouter.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
      if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND')

      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) throw new AppError(400, 'Current password incorrect', 'INVALID_CREDENTIALS')

      const hash = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash, forcePasswordReset: false },
      })
      res.json({ message: 'Password changed successfully' })
    } catch (err) {
      next(err)
    }
  }
)

// ── GET /auth/me ─────────────────────────────────────────
authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, name: true, role: true,
        clientId: true, avatar: true, forcePasswordReset: true,
        lastLoginAt: true, totpEnabled: true,
      },
    })
    if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND')
    res.json({ user })
  } catch (err) {
    next(err)
  }
})
