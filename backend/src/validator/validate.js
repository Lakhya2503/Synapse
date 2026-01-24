import { validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

const validate = (req,res,next) =>{
    const errors = validationResult(req)

    //  (`req : ${req}`);

    if(errors.isEmpty()){
        return next()
    }
    //  (`
    //     req : ${validationResult(req)}
    //     `);

    //     const { username, password}  = req.body

    //      (
    //         `username : ${username}
    //         password : ${password}
    //         `
    //     );


    const extractErrors = []
    errors.array().map((err)=>extractErrors.push({[err.path]: err.msg}))

    throw new ApiError(422, "RECEIVED DATA IS NOT VALID", extractErrors)
}

export {
    validate
}
