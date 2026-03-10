import { Router } from 'express'

export const documentsRouter = Router()

// TODO: implement documents routes — Phase 2/3
documentsRouter.get('/', (_req, res) => {
  res.json({ message: 'documents route — coming in Phase 2/3' })
})
