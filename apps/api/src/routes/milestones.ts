import { Router } from 'express'

export const milestonesRouter = Router()

// TODO: implement milestones routes — Phase 2/3
milestonesRouter.get('/', (_req, res) => {
  res.json({ message: 'milestones route — coming in Phase 2/3' })
})
