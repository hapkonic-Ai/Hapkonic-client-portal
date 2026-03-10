import { Router } from 'express'

export const projectsRouter = Router()

// TODO: implement projects routes — Phase 2/3
projectsRouter.get('/', (_req, res) => {
  res.json({ message: 'projects route — coming in Phase 2/3' })
})
