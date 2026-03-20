import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import { apiRouter } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import type { JwtPayload } from './middleware/auth'

// ── Validate required env vars at startup ──────────────────────────────────────
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL']
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required env var: ${key}`)
    process.exit(1)
  }
}
if ((process.env['JWT_SECRET']?.length ?? 0) < 32) {
  console.error('[startup] JWT_SECRET must be at least 32 characters')
  process.exit(1)
}

const CLIENT_URL = process.env['CLIENT_URL']!

const app = express()
const httpServer = createServer(app)

// ── Socket.io ──────────────────────────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: { origin: CLIENT_URL, credentials: true },
})

// Verify JWT before joining user rooms
io.use((socket, next) => {
  const token = socket.handshake.auth['token'] as string | undefined
  if (!token) return next() // allow connection without room membership
  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload
    socket.data['userId'] = payload.userId
    next()
  } catch {
    next(new Error('Invalid auth token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.data['userId'] as string | undefined
  if (userId) socket.join(`user:${userId}`)
  socket.on('disconnect', () => {})
})

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'))
app.use(cookieParser())

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter)

// ── Error handling ─────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env['PORT'] ?? '4000', 10)
httpServer.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`)
})

export default app
