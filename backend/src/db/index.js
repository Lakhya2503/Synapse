
import mongoose from 'mongoose'
import { ENV } from '../utils/ENV.js'

const connectDB = async function() {
    try {
        //  (`APP CONNECT ON THIS URI ${ENV.MONGODB_URI}/${ENV.APP_NAME}`);
        const promise = await  mongoose.connect(`${ENV.MONGODB_URI}/${ENV.APP_NAME}`)
        return promise
    } catch (error) {
            //  (`MONGODB CONNECTING ERROR : ${error.message}`);
            process.exit(1)
    }
}

export default connectDB
