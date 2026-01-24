import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createServer } from 'http'
import path from 'path'
import {Server} from 'socket.io'
import requestIp from 'request-ip'
import rateLimit from 'express-rate-limit'
import { intializeSocketIO } from './socket/index.js'


const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  pingTimeout : 60000,
  cors : {
     origin : process.env.CORS_ORIGIN,
     credentials : true,
     methods : ['GET','POST']
  }
}
)

app.set('io', io)

intializeSocketIO(io)




app.use(
  cors({
      origin :
        process.env.CORS_ORIGIN === "*" ? "*" : process.env.CORS_ORIGIN?.split(","),
        credentials : true
  })
)

app.use(requestIp.mw())


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${options.max} requests per ${
        options.windowMs / 60000
      } minutes`
    );
  },
});


app.use(limiter)


const limitOfFilesType = '5mb'

// Fixed CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT']
}))

app.use(express.json({
  limit: limitOfFilesType
}))
app.use(express.urlencoded({ extended: true, limit: limitOfFilesType }))
app.use(express.static('public'))
app.use(cookieParser())


app.use(
  session({
    secret : process.env.EXPRESS_SESSION_SECRET,
    resave : true,
    saveUninitialized : true
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(morganMiddelware)


// ----------------------------------------------------------------//
// Import routes (uncomment when ready)

import authRouter from './routes/auth.route.js'
import chatRouter from './routes/chat.route.js'
import messageRouter from './routes/message.route.js'

// ----------------------------------------------------------------//
// ################# SEEDING ROUTES #######################

import { seedChatApp } from './seeds/chat-message.seeds.js'
import { getGeneratedCredentials, seedsUser } from './seeds/user.seeds.js'
import session from 'express-session'
import passport from 'passport'
import morganMiddelware from './logger/morgon.logger.js'

// ----------------------------------------------------------------//
// *Seeding

app.post(
  '/api/v1/synapse/seed/genrate-credentials',
  getGeneratedCredentials
)

app.post(
  '/api/v1/snyapse/chats',
  seedsUser,
  seedChatApp
)


// ----------------------------------------------------------------//
// * users
app.use('/api/v1/synapse', authRouter)


// ----------------------------------------------------------------//
// * chat
app.use('/api/v1/synapse/chats', chatRouter)


// ----------------------------------------------------------------//
// * Messages
app.use('/api/v1/synapse/messages', messageRouter)


export {
  httpServer
}
