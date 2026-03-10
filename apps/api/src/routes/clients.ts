import { Router } from 'express'

export const clientsRouter = Router()

// TODO: implement clients routes — Phase 2/3
clientsRouter.get('/', (_req, res) => {
  res.json({ message: 'clients route — coming in Phase 2/3' })
})
