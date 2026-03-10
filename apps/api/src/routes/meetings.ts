import { Router } from 'express'

export const meetingsRouter = Router()

// TODO: implement meetings routes — Phase 2/3
meetingsRouter.get('/', (_req, res) => {
  res.json({ message: 'meetings route — coming in Phase 2/3' })
})
