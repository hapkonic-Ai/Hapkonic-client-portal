import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      _res.status(400).json({ error: { message: 'Validation failed', errors } })
      return
    }
    req[target] = result.data
    next()
  }
}
