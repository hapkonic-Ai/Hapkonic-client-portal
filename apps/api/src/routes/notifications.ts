import { Router } from 'express'

export const notificationsRouter = Router()

// TODO: implement notifications routes — Phase 2/3
notificationsRouter.get('/', (_req, res) => {
  res.json({ message: 'notifications route — coming in Phase 2/3' })
})
