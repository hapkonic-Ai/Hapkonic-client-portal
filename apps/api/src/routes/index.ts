import { Router } from 'express'
import { authRouter } from './auth'
import { clientsRouter } from './clients'
import { projectsRouter } from './projects'
import { documentsRouter } from './documents'
import { milestonesRouter } from './milestones'
import { meetingsRouter } from './meetings'
import { invoicesRouter } from './invoices'
import { progressRouter } from './progress'
import { notificationsRouter } from './notifications'
import { adminRouter } from './admin'
import { usersRouter } from './users'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/clients', clientsRouter)
apiRouter.use('/projects', projectsRouter)
apiRouter.use('/documents', documentsRouter)
apiRouter.use('/milestones', milestonesRouter)
apiRouter.use('/meetings', meetingsRouter)
apiRouter.use('/invoices', invoicesRouter)
apiRouter.use('/progress', progressRouter)
apiRouter.use('/notifications', notificationsRouter)
apiRouter.use('/admin', adminRouter)
