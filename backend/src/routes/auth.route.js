import { Router } from "express";
import {
    createAccount,
    forgetPasswordRequest,
    accessRefreshToken,
    generateOTP,
    getUser,
    loggedInUser,
    loggedOutUser,
    updateUserAvatar,
    updateUserFullName,
    updateUsername,
    verifyUserEmailAndOTP
} from "../controller/user.controller.js";
import upload from "../middleware/multer.js";
import { verifyAuthUser } from "../middleware/auth.js";
import { userForgetPasswordValidator, 
            userLoginValidator, 
            userRegisterValidator, 
            userRestForegettenPasswordRequest
         } from '../validator/user.validator.js'
import { validate } from '../validator/validate.js'


const router = Router()

router.route('/register').post(upload.fields([
    {
      name: "avatar",
      maxCount: 2,  
    },
  ]),userRegisterValidator(),
  validate, 
  createAccount)


router.route("/user/login-user").post(userLoginValidator(),
validate, 
loggedInUser);

router.route('/refresh-token').post(accessRefreshToken)


// router.route('/reset-password/:resetToken').post(
//     userRestForegettenPasswordRequest(),
//     validate,
// )  --create later on

router.route('/forget-password')
    .post(userForgetPasswordValidator(), 
    validate,
     forgetPasswordRequest)

router.route("/user/logged-out").post(verifyAuthUser, loggedOutUser);

router.route("/current-user").post(verifyAuthUser, getUser);

router.route('/username').patch(verifyAuthUser, updateUsername)

router.route('/fullname').patch(verifyAuthUser,updateUserFullName)

router.route('/genrate-otp').post(verifyAuthUser,generateOTP)

router.route('/verify-email-otp').patch(verifyAuthUser,verifyUserEmailAndOTP)

router.route('/avatar').patch(upload.fields([
    {
        name: 'avatar',
        maxCount : 2
    }
]),verifyAuthUser, updateUserAvatar)


export default router
