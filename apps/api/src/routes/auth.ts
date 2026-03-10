import { Router } from 'express'

export const authRouter = Router()

// TODO: implement auth routes — Phase 2/3
authRouter.get('/', (_req, res) => {
  res.json({ message: 'auth route — coming in Phase 2/3' })
})
