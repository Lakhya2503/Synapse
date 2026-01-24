import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import MongoStore from 'connect-mongo'  // ← CHANGE: Use MongoDB instead of Redis
import passport from 'passport'

import authRouter from './routes/auth.route.js'
import chatRouter from './routes/chat.route.js'
import messageRouter from './routes/message.route.js'
import { intializeSocketIO } from './socket/index.js'

const app = express()

// ========== 1. ENVIRONMENT SETUP ==========
const isProduction = process.env.NODE_ENV === 'production'

// Required for Render / proxies
app.set('trust proxy', 1)

// ========== 2. MONGODB SESSION STORE (FIXED) ==========
// Use MongoDB for sessions (same as your app data)
let sessionStore = null

try {
  if (process.env.MONGODB_URI) {
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Same MongoDB as your app
      collectionName: 'user_sessions', // Separate collection
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native',
      touchAfter: 24 * 3600 // Only update once per day
    })
    console.log('✅ Using MongoDB for session storage')
  } else {
    console.warn('⚠️ MONGODB_URI not found, using MemoryStore')
  }
} catch (error) {
  console.warn('Failed to create MongoDB session store:', error.message)
}

// ========== 3. HTTP + SOCKET.IO ==========
const httpServer = createServer(app)

// Parse CORS origins safely
const getCorsOrigins = () => {
  try {
    if (!process.env.CORS_ORIGIN) {
      return isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173']
    }
    return process.env.CORS_ORIGIN
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
  } catch (error) {
    console.error('Error parsing CORS_ORIGIN:', error)
    return ['http://localhost:3000']
  }
}

const corsOrigins = getCorsOrigins()

const io = new Server(httpServer, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: corsOrigins,
    credentials: true,
  }
})

app.set('io', io)

// Initialize Socket.IO if function exists
if (typeof intializeSocketIO === 'function') {
  intializeSocketIO(io)
}

// ========== 4. MIDDLEWARE SETUP ==========

// CORS
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}))

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
})
app.use(limiter)

// Body & cookies
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser())

// Sessions with MongoDB
const sessionConfig = {
  secret: process.env.EXPRESS_SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    sameSite: isProduction ? 'none' : 'lax'
  }
}

// Warn if using MemoryStore in production
if (isProduction && !sessionStore) {
  console.error('❌ WARNING: Using MemoryStore in production!')
  console.error('❌ Sessions will be lost on server restart')
}

app.use(session(sessionConfig))

app.use(passport.initialize())
app.use(passport.session())

// ========== 5. ROUTES ==========

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    sessionStore: sessionStore ? 'MongoDB' : 'MemoryStore'
  })
})

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Synapse API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    sessionStore: sessionStore ? 'MongoDB' : 'MemoryStore',
    corsOrigins: corsOrigins
  })
})

// Main routes
app.use('/api/v1/synapse', authRouter)
app.use('/api/v1/synapse/chats', chatRouter)
app.use('/api/v1/synapse/messages', messageRouter)

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Synapse API',
    documentation: '/api/v1/synapse',
    health: '/health',
    status: '/api/status'
  })
})

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)

  const statusCode = err.status || 500
  const message = isProduction && statusCode === 500
    ? 'Internal server error'
    : err.message

  res.status(statusCode).json({
    success: false,
    error: message
  })
})

export { httpServer, app }
