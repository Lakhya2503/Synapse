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
      console.log(`🚀 Server up on port ${port}`);
    })
  })
  .catch((error) => {
    console.log(`ERROR MESSAGE: ${error.message} || ERROR TO CONNECT THE DATABASE`);
    process.exit(1)
  })

  