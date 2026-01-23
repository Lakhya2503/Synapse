import { Router } from "express";
import {verifyAuthUser} from '../middleware/auth.js'
import { mongoIdPathVariableValidator } from "../validator/mongodb.validator.js";
import { validate } from "../validator/validate.js";
import { deleteMessage, getAllMessage, sendMessage } from '../controller/message.controller.js'
import upload from './../middleware/multer.js';
import { sendMessageValidator } from '../validator/message.validator.js'

const router = Router()

router.use(verifyAuthUser)


router
  .route("/:chatId")
  .get(
    mongoIdPathVariableValidator("chatId"),
    validate,
    getAllMessage
  )
  .post(
    mongoIdPathVariableValidator("chatId"),
    sendMessageValidator(),
    validate,
    sendMessage
  );


  router
  .route("/:chatId")
  .get(
    mongoIdPathVariableValidator("chatId"),
    validate,
    getAllMessage
  )




    // Delete message route base on message ID

    router.route(
        "/:chatId/:messageId"
    ).delete(
        mongoIdPathVariableValidator("chatId"),
        mongoIdPathVariableValidator("messageId"),
        validate,
        deleteMessage
    )


// router
//     .route('/get/users-with-message')
//     .get(
//         getUsersWithMessages
//     )


export default router