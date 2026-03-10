import { Router } from 'express'

export const invoicesRouter = Router()

// TODO: implement invoices routes — Phase 2/3
invoicesRouter.get('/', (_req, res) => {
  res.json({ message: 'invoices route — coming in Phase 2/3' })
})
