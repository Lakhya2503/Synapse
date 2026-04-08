import { validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

const validate = (req,res,next) =>{
    const errors = validationResult(req)



    if(errors.isEmpty()){
        return next()
    }
    


    const extractErrors = []
    errors.array().map((err)=>extractErrors.push({[err.path]: err.msg}))

    throw new ApiError(422, "RECEIVED DATA IS NOT VALID", extractErrors)
}

export {
    validate
}
