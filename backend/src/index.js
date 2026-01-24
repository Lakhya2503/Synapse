import { configDotenv } from 'dotenv'
import connectDB from './db/index.js';
import http from 'http'
import {httpServer} from './app.js'
import logger from './logger/wintson.logger.js';

configDotenv({
  path: './.env'
})

const port = process.env.PORT || 8080


connectDB()
  .then(() => {
    httpServer.listen(port, () => {

    })
  })
  .catch((error) => {
    process.exit(1)
  })
