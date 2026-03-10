import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../middleware/auth'

const ACCESS_SECRET = () => process.env['JWT_SECRET']!
const REFRESH_SECRET = () => process.env['JWT_REFRESH_SECRET']!

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET(), {
    expiresIn: (process.env['JWT_EXPIRES_IN'] ?? '15m') as jwt.SignOptions['expiresIn'],
  })
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_SECRET(), {
    expiresIn: (process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'],
  })
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET()) as { userId: string }
}

export function cookieOptions(maxAgeDays = 7) {
  return {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict' as const,
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
    path: '/',
  }
}
