import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'

import authRouter from './routes/auth.route.js'
import chatRouter from './routes/chat.route.js'
import messageRouter from './routes/message.route.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import { intializeSocketIO } from './socket/index.js'

const app = express()

// ========== 1. ENVIRONMENT SETUP ==========
const isProduction = process.env.NODE_ENV === 'production'

// Required for Render / proxies
app.set('trust proxy', 1)

// ========== 2. MONGODB SESSION STORE ==========
let sessionStore = null

try {
  if (process.env.MONGODB_URI) {
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native',
      touchAfter: 24 * 3600
    })
    console.log('✅ Using MongoDB for session storage')
  } else {
    console.warn('⚠️ MONGODB_URI not found, using MemoryStore')
  }
} catch (error) {
  console.warn('MongoDB session store error:', error.message)
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
  },
  transports: ['websocket', 'polling']
})

app.set('io', io)

// Initialize Socket.IO if function exists
if (typeof intializeSocketIO === 'function') {
  intializeSocketIO(io)
} else {
  console.warn('Socket.IO initialization function not found')
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
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/'
  }
})
app.use(limiter)

// Body & cookies
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser())

// Sessions with MongoDB
const sessionConfig = {
  secret: process.env.EXPRESS_SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'none' : 'lax'
  }
}

// Add store if available
if (sessionStore) {
  sessionConfig.store = sessionStore
}

app.use(session(sessionConfig))

// Warn if using MemoryStore in production
if (isProduction && !sessionStore) {
  console.warn('⚠️ WARNING: Using MemoryStore in production! Add MONGODB_URI')
}

app.use(passport.initialize())
app.use(passport.session())

// ========== 5. ROUTES ==========

// Health check (REQUIRED for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Synapse API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    sessionStore: sessionStore ? 'MongoDB' : 'MemoryStore'
  })
})

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

// Main API routes
app.use('/api/v1/synapse', authRouter)
app.use('/api/v1/synapse/chats', chatRouter)
app.use('/api/v1/synapse/messages', messageRouter)
app.use("/api/v1/healthcheck", healthcheckRouter);

// ========== 6. 404 HANDLER (FIXED - No '*') ==========
// This MUST come after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Check available endpoints at /api/status'
  })
})

// ========== 7. ERROR HANDLER ==========
// This MUST come after 404 handler
app.use((err, req, res, next) => {
  console.log(`Route ${req.originalUrl} not found`);
  console.error('Server Error:', err.message)


  const statusCode = err.status || err.statusCode || 500
  const message = isProduction && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Something went wrong'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err.stack })
  })
})

// ========== 8. EXPORTS ==========
export { httpServer, app }
