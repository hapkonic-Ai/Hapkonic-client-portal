import { Router } from 'express'

export const progressRouter = Router()

// TODO: implement progress routes — Phase 2/3
progressRouter.get('/', (_req, res) => {
  res.json({ message: 'progress route — coming in Phase 2/3' })
})
