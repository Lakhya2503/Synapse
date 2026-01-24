import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import session from 'express-session'
import passport from 'passport'

import authRouter from './routes/auth.route.js'
import chatRouter from './routes/chat.route.js'
import messageRouter from './routes/message.route.js'
import { intializeSocketIO } from './socket/index.js'

const app = express()

// Required for Render / proxies
app.set('trust proxy', 1)

// HTTP + Socket.IO
const httpServer = createServer(app)
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
  },
})

app.set('io', io)
intializeSocketIO(io)

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true,
}))

// Rate limiter (IPv6 safe)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
})
app.use(limiter)

// Body & cookies
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser())

// Sessions (⚠️ dev-only unless Redis is added)
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api/v1/synapse', authRouter)
app.use('/api/v1/synapse/chats', chatRouter)
app.use('/api/v1/synapse/messages', messageRouter)

export { httpServer }
