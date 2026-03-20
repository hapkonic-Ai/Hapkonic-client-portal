import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import type { Role } from '@prisma/client'

export interface JwtPayload {
  userId: string
  email: string
  role: Role
  clientId?: string
  forcePasswordReset?: boolean
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided', 'UNAUTHENTICATED'))
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload
    req.user = payload
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token', 'TOKEN_INVALID'))
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'UNAUTHENTICATED'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'))
    }
    next()
  }
}

const SENSITIVE_FIELDS = new Set([
  'password', 'newPassword', 'currentPassword', 'passwordHash',
  'otp', 'token', 'refreshToken', 'accessToken', 'secret',
])

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_FIELDS.has(k) ? '[REDACTED]' : v,
    ])
  )
}

export function auditLog(action: string, entityType: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Lazy import to avoid circular deps
    const { prisma } = await import('../lib/prisma')
    if (req.user) {
      await prisma.adminLog
        .create({
          data: {
            userId: req.user.userId,
            action,
            entityType,
            entityId: req.params['id'] ?? null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: { body: sanitizeBody(req.body), query: req.query } as any,
            ipAddress: req.ip,
          },
        })
        .catch(() => {})
    }
    next()
  }
}
