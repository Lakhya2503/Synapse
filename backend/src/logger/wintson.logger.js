import wintson from 'winston'

const levels = {
    error: 0,
    worn: 1,
    info: 2,
    http: 3,
    debug :4
}

// This method set the current  security based on
// The current NODE_ENV : show all the log levels
// if the server was run in development mode; otherwise,
// if it was in run in  production, show  only worn and error messages

const level = () => {
    const env = process.env.NODE_ENV || "development"
    const isDevelopment = env === "development"
    return isDevelopment ? "debug" : "warn";
}


// Define different colors  for each level.
// Colors  make the log message move visible,
// adding the  ability to focus or ignore message.

const colors = {
    error: "red",
    warn: "yellow",
    info: "blue",
    http: "megenta",
    debug : "white"
}


// Tell wintson that you want to link the colors
//  defined above to the  security levels

const formate = wintson.format.combine(
    //Add the message timestamp with the prefreed formate
    wintson.format.timestamp({ format: "DD MMM, YYY - HH:mm:ss:ms" }),
    // Tell wintson that the logs must be colored
    wintson.format.colorize({ all: true }),
    // Defiend the formate of the message showing the  timestamp , the level  and the message 
    wintson.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
);

// Defined wich transporter the logger must be use to print  out messages.
// In this example, we are using three different transports

const transports = [
    // Allow the use the console  to print the messages
    new wintson.transports.Console(),
    new wintson.transports.File({filename: 'logs/error.log', level: "error"}),
    new wintson.transports.File({filename: 'logs/info.log', level: "info"}),
    new wintson.transports.File({filename: 'logs/http.log', level: "http"}),
]


// Create the logger instance that has to be exported
// and used log messages.

const logger = wintson.createLogger({
    level: level(),
    levels,
    formate,
    transports,
})
export default  logger
