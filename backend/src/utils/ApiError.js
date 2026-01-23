class ApiError extends Error {
         constructor (
            statusCode,
            message,
            errors = [],
            stack
         ) 
         {
             super(message)
                this.statusCode = statusCode
                this.errors = errors    
                this.message = message
                if(stack) {
                    this.stack = stack
                }
         }
}

export default ApiError