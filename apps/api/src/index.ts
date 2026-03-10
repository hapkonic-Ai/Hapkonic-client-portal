import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { apiRouter } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

const app = express()
const httpServer = createServer(app)

// ── Socket.io ──
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env['CLIENT_URL'] ?? 'http://localhost:3000',
    credentials: true,
  },
})

io.on('connection', (socket) => {
  const userId = socket.handshake.auth['userId'] as string | undefined
  if (userId) {
    socket.join(`user:${userId}`)
  }
  socket.on('disconnect', () => {})
})

// ── Middleware ──
app.use(helmet())
app.use(
  cors({
    origin: process.env['CLIENT_URL'] ?? 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(cookieParser())

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ──
app.use('/api/v1', apiRouter)

// ── Error handling ──
app.use(notFound)
app.use(errorHandler)

// ── Start ──
const PORT = parseInt(process.env['PORT'] ?? '4000', 10)
httpServer.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
})

export default app
