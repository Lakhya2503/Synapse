import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRouter from './routes/auth.route.js'
import chatRouter from './routes/chat.route.js'
import messageRouter from './routes/message.route.js'
import healthcheckRouter from './routes/healthcheck.routes.js'

import { initializeSocketIO } from './socket/index.js'
import { ENV } from './utils/ENV.js'

const app = express()

// ======================================================
// ESM __dirname Setup
// ======================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ======================================================
// Environment
// ======================================================

const isProduction = ENV.NODE_ENV === 'production'

// Trust proxy (Render / Railway / Nginx / Vercel)
app.set('trust proxy', 1)

// ======================================================
// Security Middleware
// ======================================================

app.use(helmet())

// ======================================================
// CORS Configuration
// ======================================================

const getCorsOrigins = () => {
  if (!isProduction) {
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174'
    ]
  }

  return [ENV.CLIENT_URL]
}

const corsOrigins = getCorsOrigins()

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200
  })
)

// ======================================================
// Rate Limiter
// ======================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/'
  }
})

app.use(limiter)

// ======================================================
// Body Parsers
// ======================================================

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser())

// ======================================================
// MongoDB Session Store
// ======================================================

let sessionStore = null

try {
  if (ENV.MONGODB_URI) {
    sessionStore = MongoStore.create({
      mongoUrl: ENV.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
      touchAfter: 24 * 3600
    })

    console.log('✅ MongoDB session store connected')
  } else {
    console.warn('⚠️ MONGODB_URI not found, using MemoryStore')
  }
} catch (error) {
  console.error('MongoDB session store error:', error.message)
}

// ======================================================
// Session Configuration
// ======================================================

const sessionConfig = {
  secret:
    ENV.EXPRESS_SESSION_SECRET ||
    'dev-secret-key-change-in-production',

  resave: false,
  saveUninitialized: false,

  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}

if (sessionStore) {
  sessionConfig.store = sessionStore
}

app.use(session(sessionConfig))

if (isProduction && !sessionStore) {
  console.warn(
    '⚠️ WARNING: Using MemoryStore in production! Add MONGODB_URI'
  )
}

// ======================================================
// Passport
// ======================================================

app.use(passport.initialize())
app.use(passport.session())

// ======================================================
// HTTP Server + Socket.IO
// ======================================================

const httpServer = createServer(app)

const io = new Server(httpServer, {
  pingTimeout: 60000,
  pingInterval: 25000,

  cors: {
    origin: corsOrigins,
    credentials: true
  },

  transports: ['websocket']
})

app.set('io', io)

// Initialize Socket.IO
if (typeof initializeSocketIO === 'function') {
  initializeSocketIO(io)
} else {
  console.warn('⚠️ initializeSocketIO function not found')
}

// ======================================================
// Health Routes
// ======================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    environment: ENV.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Synapse API is running',
    version: '1.0.0',
    environment: ENV.NODE_ENV || 'development',
    sessionStore: sessionStore ? 'MongoDB' : 'MemoryStore'
  })
})

// ======================================================
// API Routes
// ======================================================

app.use('/api/v1/synapse', authRouter)
app.use('/api/v1/synapse/chats', chatRouter)
app.use('/api/v1/synapse/messages', messageRouter)
app.use('/api/v1/healthcheck', healthcheckRouter)

// ======================================================
// Static Files
// ======================================================

app.use(express.static(path.join(__dirname, 'public')))

// ======================================================
// SPA Fallback
// ======================================================

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// ======================================================
// 404 Handler
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method
  })
})

// ======================================================
// Global Error Handler
// ======================================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err)

  const statusCode = err.status || err.statusCode || 500

  const message =
    isProduction && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Something went wrong'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err.stack })
  })
})

// ======================================================
// Graceful Shutdown
// ======================================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received')

  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

// ======================================================
// Exports
// ======================================================

export { app, httpServer }
