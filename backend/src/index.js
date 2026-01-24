import { config } from 'dotenv'
import connectDB from './db/index.js'
import { httpServer } from './app.js'
import logger from './logger/winston.logger.js'

// Load environment variables
config({ path: './.env' })

const PORT = process.env.PORT || 8000
const isProduction = process.env.NODE_ENV === 'production'

// Connect to database and start server
connectDB()
  .then(() => {
    logger.info('✅ Database connected successfully')

    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server started on port ${PORT}`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)

      if (process.env.CORS_ORIGIN) {
        const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        logger.info(`✅ CORS Origins: ${origins.join(', ')}`)
      }

      if (process.env.MONGODB_URI) {
        logger.info('✅ Using MongoDB for session storage')
      } else {
        logger.warn('⚠️ Using MemoryStore (add MONGODB_URI for production)')
      }

      logger.info(`📍 Local: http://localhost:${PORT}`)
      logger.info(`📊 Health: http://localhost:${PORT}/health`)
    })

    // Handle server errors
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`)
        process.exit(1)
      } else {
        logger.error('Server error:', error)
        process.exit(1)
      }
    })
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error)
    process.exit(1)
  })

// Handle shutdown signals
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down...`)
  httpServer.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Force shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('🚨 Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
})
