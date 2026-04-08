import { body } from 'express-validator'
import { AvailableUserRoles } from '../constant.js'

const userRegisterValidator = () => {
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is Required")
        .isEmail()
        .withMessage("Email is Invalid"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username Is required")
        .isLowercase()
        .withMessage("Username must be lowercase")
        .isLength({min : 3})
        .withMessage("Username must be at least 3 characters long"),
        body("password").trim().notEmpty().withMessage("Password is required"),
        body("role")
        .optional()
        .isIn(AvailableUserRoles)
        .withMessage("Invalid user role")
    ]
    
}

const userLoginValidator = () => {
    return [
        body("email").optional().isEmail().withMessage(`Email is Invalid`),
        body("username").optional(),
        body("password").notEmpty().withMessage("password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("OLD password is required"),
        body("newPassword").notEmpty().withMessage("NEW Password is required")
    ]
}

const userForgetPasswordValidator = () => {    
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}



const userRestForegettenPasswordRequest = () =>{
    return [
        body("newPassword").notEmpty().withMessage("password is required")
    ]
}

const userAssignRoleValidator = () =>{
    return [
        body("role")
            .optional()
            .isIn(AvailableUserRoles)
            .withMessage("invalid user role")
    ]
}

export {
    userRegisterValidator,
    userAssignRoleValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgetPasswordValidator,
    userRestForegettenPasswordRequest
}