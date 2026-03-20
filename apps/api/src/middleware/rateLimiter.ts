import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler'

// Gracefully handle missing Upstash config in dev
function createRedis() {
  const url = process.env['UPSTASH_REDIS_REST_URL']
  const token = process.env['UPSTASH_REDIS_REST_TOKEN']
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = createRedis()

function createLimiter(requests: number, windowSeconds: number) {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: false,
  })
}

export const limiters = {
  login:         createLimiter(20,  15 * 60), // 20 per 15 min
  forgotPw:      createLimiter(3,   60 * 60), // 3 per hour
  api:           createLimiter(100, 60),       // 100 per min per user
  fileUpload:    createLimiter(10,  60),       // 10 per min
}

export function rateLimit(limiterKey: keyof typeof limiters, identifierFn?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const limiter = limiters[limiterKey]
    if (!limiter || process.env['NODE_ENV'] === 'development') return next() // skip if no Redis or in dev

    const identifier = identifierFn
      ? identifierFn(req)
      : req.user?.userId ?? req.ip ?? 'anon'

    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', reset)

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      res.setHeader('Retry-After', retryAfter)
      return next(new AppError(429, 'Too many requests', 'RATE_LIMITED'))
    }
    next()
  }
}
