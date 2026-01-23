class ApiRespose {
    constructor(
        statusCode,
        data,
        message = 'success'
    )
        {
                this.status = statusCode,
                this.data = data,
                this.message = message
        }
}

export default ApiRespose