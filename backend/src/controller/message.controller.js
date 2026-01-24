import mongoose from "mongoose";
import { ChatEventEnum } from '../constant.js';
import { emitSocketEvent } from '../socket/index.js';
import ApiError from "../utils/ApiError.js";
import ApiRespose from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { removeLocalFile } from '../utils/helper.js';
import Chat from './../model/chat.model.js';
import ChatMessage from './../model/chatMessage.model.js';
// user has one to one chat like simple chat ( user1 to user2 )   `` using comman functionality

// user was chating on one to many like group chat ( user1 to user2, user3, user4) `` using lookup functionality

const chatMessageCommanAggregation = (()=>{
    return [
        {
            $lookup : {
                from : "users",
                foreignField : "_id",
                localField : "sender",
                as : "sender",
                pipeline : [
                    {
                    $project : {
                        username: 1,
                        email : 1,
                        avatar :1
                    }
                }
                ]
            }
        },
        {
            $addFields : {
                sender : { $first : "$sender" }
            }
        }
    ]
})

const getAllMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);

//    (`chat ${chat}`);


  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!chat.participants.includes(req.user._id)) {
    throw new ApiError(403, "You are not part of this chat");
  }


  const messages = await ChatMessage.aggregate([
    { $match: { chat: new mongoose.Types.ObjectId(chatId) }, },
    ...chatMessageCommanAggregation(),
    { $sort: { createdAt: -1 } },
  ]);

//    (`messages :${messages}`);


  return res
    .status(200)
    .json(new ApiRespose(200, messages, "Messages fetched"));
});

const sendMessage = asyncHandler(async (req, res) => {

  const { chatId } = req.params;
  const { content } = req.body;

//    (`chatid ${chatId}`);
//    (`chatid type ${typeof(chatId)}`);
//    (`req.body : ${req.body}`);
//    (`req.body type : ${typeof(req.body)}`);


  if (!content?.trim()) {
    throw new ApiError(400, "Message content required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!chat.participants.includes(req.user._id)) {
    throw new ApiError(403, "You are not part of this chat");
  }

  const message = await ChatMessage.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const messages = await ChatMessage.aggregate([
    { $match: { _id: message._id } },
    ...chatMessageCommanAggregation(),
  ]);

  const receivedMessage = messages[0];

  if (!receivedMessage) {
    throw new ApiError(500, "Message creation failed");
  }

  // Emit message to other participants
  chat.participants.forEach((participantId) => {
    if (participantId.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participantId.toString(),
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage
    );
  });




  return res
    .status(200)
    .json(new ApiRespose(200, receivedMessage, "Message sent"));
});

const deleteMessage = asyncHandler(async(req,res)=>{
    const { chatId, messageId } = req.params

    const chat = await Chat.findOne(
        {
            _id : new mongoose.Types.ObjectId(chatId),
            participants : req.user._id
        })

        if(!chat) {
            throw new ApiError(404, "Chat not exist")
        }

        const message = await ChatMessage.findOne(
            {
                _id : new mongoose.Types.ObjectId(messageId)
            }
        )

        if(!message) {
            throw new ApiError(404, "Message does not exist")
        }

        if(message.sender._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Your not authorized to delete the message, you are not the sender")
        }

        message.attachements.map((asset)=>{
            removeLocalFile(asset.localPath)
        })

        await ChatMessage.deleteOne({
            _id : new mongoose.Types.ObjectId(messageId)
        })

        if(chat.lastMessage.toString() === message._id.toString()){
            const lastMessage = await ChatMessage.findOne(
                { chat : chatId}, {}, {$sort : {createdAt : -1}}
        );

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage : lastMessage ? lastMessage?._id : null
        })
    }

    chat.participants.forEach((participantObjId)=>{
        if(participantObjId.toString() === req.user._id.toString()) return

        emitSocketEvent(
            req,
            participantObjId.toString(),
            ChatEventEnum.MESSAGE_DELETE_EVENT,
            message
        )
    })

    return res.status(200).json(200, message , 'Message delete successfully')
})

// const getUsersWithMessages = asyncHandler(async (req, res) => {
//   const currentUserId = req.user._id;

//    ("Current User ID:", currentUserId.toString());

//   const chats = await Chat.find({
//     participants: currentUserId,
//   }).lean();

//    ("Chats found:", chats.length);

//   if (!chats.length) {
//     return res.status(200).json(
//       new ApiRespose(200, [], "No users with messages found")
//     );
//   }

//   const otherUserIdsSet = new Set();

//   chats.forEach(chat => {
//     chat.participants.forEach(participantId => {
//       if (participantId.toString() !== currentUserId.toString()) {
//         otherUserIdsSet.add(participantId.toString());
//       }
//     });
//   });

//   const otherUserIds = Array.from(otherUserIdsSet);

//    ("Other User IDs:", otherUserIds);

//   if (!otherUserIds.length) {
//     return res.status(200).json(
//       new ApiRespose(200, [], "No users with messages found")
//     );
//   }

//   const users = await User.find({
//     _id: { $in: otherUserIds }
//   })
//     .select("username email avatar online lastSeen")
//     .lean();

//    ("Users fetched:", users.length);

//   return res.status(200).json(
//     new ApiRespose(200, users, "Users with messages fetched")
//   );
// });

// const sendAtteachement = asyncHandler(async(req,res)=>{

//     const attacheMent = req.files




// })


export {
    deleteMessage, getAllMessage,
    sendMessage
};
