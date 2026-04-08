import { Router } from "express";
import passport from "passport";
import checker from "../controller/checkr.controller.js";
import {
  accessRefreshToken,
  createAccount,
  deleteUser,
  forgetPasswordRequest,
  forgotpasswordRequest,
  getUser,
  handleSocialLogin,
  loggedInUser,
  loggedOutUser,
  resetForgottenPassword,
  updateUserAvatar,
  updateUserFullName,
  updateUsername,
  verifyEmail,
} from "../controller/user.controller.js";
import { verifyAuthUser } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import '../passport/index.js';
import {
  userForgetPasswordValidator,
  userLoginValidator,
  userRegisterValidator
} from '../validator/user.validator.js';
import { validate } from '../validator/validate.js';
import { mongoIdPathVariableValidator } from "../validator/mongodb.validator.js";

const router = Router()

router.route('/user/register-user').post(upload.fields([
    {
      name: "avatar",
      maxCount: 2,
    },
  ]),
  userRegisterValidator(),
  validate,
  createAccount)


router.route("/user/login-user").post(userLoginValidator(),
validate,
loggedInUser);

router.route('/refresh-token').post(accessRefreshToken)


router.route('/forget-password')
    .post(userForgetPasswordValidator(),
    validate,
     forgetPasswordRequest)

router.route("/user/logged-out").post(verifyAuthUser, loggedOutUser);

router.route("/current-user").get(verifyAuthUser, getUser);

router.route('/username').patch(verifyAuthUser, updateUsername)


router.route("/users/verify-email/:verificationToken").get(mongoIdPathVariableValidator("verificationToken"),verifyEmail)

router.route('/avatar').patch(upload.fields([
    {
        name: 'avatar', 
        maxCount : 2
    }
]),verifyAuthUser, updateUserAvatar)

router.route("/fake-user").get(checker)

router.route('/forgot-password').post(userForgetPasswordValidator(),validate,forgotpasswordRequest)

router.route('/reset-password/:resetToken').post(userForgetPasswordValidator(), resetForgottenPassword)


router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.route("/github").get(
  passport.authenticate("github", {
    scope: ["profile", "email"],
  }),
);




router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);


router
  .route("/github/callback")
  .get(passport.authenticate("github"), handleSocialLogin);


router.route('/delete-user').delete(verifyAuthUser, deleteUser)


export default router
