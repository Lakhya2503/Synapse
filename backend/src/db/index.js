
import mongoose from 'mongoose'

const connectDB = async function() {
    try {
        console.log(`APP CONNECT ON THIS URI ${process.env.MONGODB_URI}/${process.env.APP_NAME}`);
        const promise = await  mongoose.connect(`${process.env.MONGODB_URI}/${process.env.APP_NAME}`)   
        return promise
    } catch (error) {
            console.log(`MONGODB CONNECTING ERROR : ${error.message}`);
            process.exit(1)
    }
}

export default connectDB