import morgan from "morgan";
import logger from "./wintson.logger.js";


const stream = {
    write : (message) => logger.http(message.trim())
}

const skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development"
}

const morganMiddelware = morgan(
    ":remote-addr :method :url :status - :response-time ms",
    { stream, skip}
)

export default morganMiddelware