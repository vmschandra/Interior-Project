import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { Server } from 'socket.io'

import authRoutes from './routes/auth.js'
import customerRoutes from './routes/customers.js'
import designerRoutes from './routes/designers.js'
import subscriptionRoutes from './routes/subscriptions.js'
import chatRoutes from './routes/chat.js'
import reviewRoutes from './routes/reviews.js'
import adminRoutes from './routes/admin.js'
import { setupSocket } from './socket.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

// ── Security middleware ──────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Rate limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many auth attempts. Please try again later.' },
})

app.use(globalLimiter)

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/designers', designerRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── 404 ──────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ message: 'Route not found' }))

// ── Error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── Socket.io ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
setupSocket(io)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`\n✓ DesignNest API running on http://localhost:${PORT}\n`)
})
