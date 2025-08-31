class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stackss = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stackss){
            this.stack = stackss
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}