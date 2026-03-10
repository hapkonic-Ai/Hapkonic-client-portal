import { Router } from 'express'

export const adminRouter = Router()

// TODO: implement admin routes — Phase 2/3
adminRouter.get('/', (_req, res) => {
  res.json({ message: 'admin route — coming in Phase 2/3' })
})
