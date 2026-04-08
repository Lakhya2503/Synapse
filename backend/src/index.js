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

      logger.info(`🚀 Server is running on http://localhost:${PORT}`)

      // Log CORS origins
      if (process.env.CORS_ORIGIN) {
        const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        logger.info(`✅ CORS Origins: ${origins.join(', ')}`)
      }

      // Log session store info
      if (process.env.MONGODB_URI) {
        logger.info('✅ Using MongoDB for session storage')
      } else if (isProduction) {
        logger.warn('⚠️ Using MemoryStore in production')
      }
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

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down server...')
  httpServer.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Force shutdown after timeout')
    process.exit(1)
  }, 10000)
}
    
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
