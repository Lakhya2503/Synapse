import User from "../model/user.model.js"
import ApiError from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'

export const verifyAuthUser = async (req, _, next) => { 
    
    try {
        const incommingToken = req.cookies?.accessToken
    
        if (!incommingToken) {
            throw new ApiError(404, "incomming token not found")
        }
    
        const token = jwt.verify(incommingToken, process.env.ACCESS_TOKEN_SECRET);
        if (!token) {
            throw new ApiError(404,`token not proccess`)
        }
    
        const user = await User.findById(token?._id).select("-refreshToken -password")
    
        if (!user) {
            throw new ApiError(400,"User not found")
        }

        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || 'Token not found')
    }
}
