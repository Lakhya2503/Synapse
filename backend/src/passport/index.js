import passport from "passport";
import { Strategy as GoogleStratergy } from 'passport-google-oauth20'
import { Strategy as GithubStratergy } from 'passport-github2'
import { userLoginType, userRoleEnum } from '../constant.js'
import ApiError from '../utils/ApiError.js'
import User from "../model/user.model.js";


try {
    passport.serializeUser((user, next)=>{
        next(null, user._id)
    })  

    passport.deserializeUser(async(id, next)=>{
            try {
                    const user = await User.findById(id)
                    if(user) next(null, user)
                        else next(new ApiError(404, "user not exist"),null)
            } catch (error) {
                next(
                    new ApiError(
                        500,
                        "Something went's wrong while deserializing the user. Error" , + error
                    ),
                    null
                )
            }
    });

    passport.use(
        new GoogleStratergy(
            {
                clientID : process.env.GOOGLE_CLIENT_ID,
                clientSecret : process.env.GOOGLE_CLIENT_SECRET,
                callbackURL : process.env.GOOGLE_CALLBACK_URL
            },
            async(_,__,profile,next)=>{
                    const user = await User.findOne({email : profile._json.email})
                    if(user) {
                        if(user.loginType !== userLoginType.GOOGLE) {
                            next(
                                new ApiError(
                                    400,
                                    "You have previously register using" 
                                    + user.loginType?.toLocaleLowerCase()?.split("_").join(" ") 
                                    + ".please use the" 
                                    +  user.loginType?.toLowerCase()?.split("_").join(" ") 
                                    + "login option to your account"

                                ),
                                null
                            )
                        }else {
                            next(null,user)
                        }
                    } else {
                        const createdUser = await User.create({
                            email : profile._json.email,
                            password : profile._json.sub,
                            username : profile._json.email?.split("@")[0],
                            isEmailVerified : true,
                            role : userRoleEnum.USER,
                            avatar : profile._json.picture,
                            loginType : userLoginType.GOOGLE
                        })
                        if(createdUser) {
                            next(null, createdUser)
                        } else {
                            next(new ApiError(500, "Error while registering the user"),null)
                        }
                    }
            }
        )
    )

    passport.use(
        new GithubStratergy(
            {
                clientID : process.env.GITHUB_CLIENT_SECRET,
                clientSecret : process.env.GITHUB_CLIENT_SECRET,
                callbackURL : process.env.GITHUB_CALLBACK_URL
            },
            async(_,__,profile,next) => {
                const user = await User.findOne({email : profile._json.email})

                if(user){
                    if(user.loginType !== userLoginType.GITHUB){
                        next(
                            new ApiError(
                                400,
                                `You have previously registred using` +
                                user.loginType?.toLowerCase().split("_").join(" ") +
                                 ".please use the" + 
                                 user.loginType?.toLowerCase().split("_").join(" ") +
                                 " login option to access your account"
                            ),null
                        )
                    } else {
                        if(!profile._json.email){
                            next(
                                new ApiError(
                                    400,
                                    `User does not have a public email associated with their account. Please try another login method`
                                ),
                                null
                            )
                        }
                    } 
                }else {
                        const userNameExist = await User.findOne({
                            username : profile?.username,
                        })   

                       const createdUser = await User.create({
                            email : profile._json.email,
                            password : profile._json.node_Id,
                            username : userNameExist ? profile._json.email?.split("@")[0] : profile._json.username ,
                            isEmailVerified : true,
                            role : userRoleEnum.USER,
                            loginType : userLoginType.GITHUB,
                            avatar : profile._json.picture,
                       })

                       if(createdUser) {
                            next(null, createdUser)
                       }else {
                            next(new ApiError(500, "Error while creating new user"),null)
                       }
                    }
            }
        )
    )

} catch (error) {
    console.error(`PASSPORT ERROR `, error.message)
}