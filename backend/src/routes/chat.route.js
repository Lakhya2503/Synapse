import { Router } from "express";
import { sendMessage } from "../controller/message.controller.js";
import  { verifyAuthUser } from "../middleware/auth.js";
import { addNewParticipantInGroupChat, createGroupChat, createOrGetAOneOnOneChat, 
  deleteGroupChat, 
  deleteOneOnOneChat, 
  getAllChats, 
  getGroupChatDetails, 
  leaveGroupChat, 
  removeParticipantFromGroupChat, 
  renameGroupChat, 
  searchAvailableUsers } from '../controller/chat.controller.js'
import { mongoIdPathVariableValidator } from '../validator/mongodb.validator.js'
import { validate } from '../validator/validate.js'
import {  } from '../validator/message.validator.js'
import { updateGroupChatNameValidator } from '../validator/chat.validator.js'

const router = Router();


router.use(verifyAuthUser)

router.route('/').get(getAllChats)


router.route('/users').get(searchAvailableUsers)

router
  .route('/c/:receiverId')
  .post(
    mongoIdPathVariableValidator("receiverId"),  
    validate,
    createOrGetAOneOnOneChat
)

router
  .route('/create-group')
  .post(
    validate,
    createGroupChat
  )


router
    .route('/group/fetch-group/:chatId')
    .get(mongoIdPathVariableValidator("chatId"), validate,getGroupChatDetails )


router 
    .route('/rename-group-chat/:chatId')
    .get(mongoIdPathVariableValidator("chatId"), validate, getGroupChatDetails)
    .patch(
      mongoIdPathVariableValidator("chatId"),
      updateGroupChatNameValidator(),
      validate,
      renameGroupChat
    )

 
router
  .route('/group/remove-participant/:chatId/:participantId')
  .get(getAllChats)
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator('participantId'),
    validate,
    removeParticipantFromGroupChat
  )

router
  .route('/leave/group/:chatId')
  .delete(mongoIdPathVariableValidator("chatId"),validate, leaveGroupChat)

router
  .route('/remove/:chatId')
  .delete(mongoIdPathVariableValidator("chatId"),validate,deleteOneOnOneChat)

router
  .route('/add-participant/:chatId/:participantId')
  .patch(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator('participantId'),
    validate,
    addNewParticipantInGroupChat
  )


export default router;