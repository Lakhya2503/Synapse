import mongoose from "mongoose";
import { ChatEventEnum } from "../constant.js";
import Chat from '../model/chat.model.js';
import ChatMessage from "../model/chatMessage.model.js";
import User from "../model/user.model.js";
import { emitSocketEvent } from "../socket/index.js";
import ApiError from "../utils/ApiError.js";
import ApiRespose from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt  from 'jsonwebtoken';
import { generateAccessRefreshToken } from "./user.controller.js";


const chatCommanAggregation = () => {
    return [    
      {
        // lookup for the participants presents
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "participants",
          as: "participants",
          pipeline: [
            {
              $project: {
                password: 0,
                refreshToken: 0,
                forgetPasswordToken: 0,
                forgetPasswordExpiry: 0,
                emailVerificationToken: 0,
                emailVerificationExpiry: 0,
              },
            },
          ],
        },
      },
      {
        // lookup for the group chat
        $lookup: {
          from: "chatMessages",
          foreignField: "_id",
          localField: "lastMessage",
          as: "lastMessage",
              pipeline: [
                  {
                      // get details of the sender
                      $lookup: {
                          from: "users",
                          foreignField: "_id",
                          localField: "sender",
                          as: "sender",
                          pipeline: [
                              {
                                  $project: {
                                      username: 1,
                                      avatar: 1,
                                      email : 1
                                },
                            },
                          ],
                        },
                  },
                  {
                      $addFields: {
                            sender : { $first : "$sender" },
                      },
                  },
          ],
        },
      },
     {
        $addFields: {
            lastMessage : { $first : "$lastMessage"}
        }
      }
    ];
}; 

const deleteCascadeChatMessage = async (chatId) => {    
    const message = await ChatMessage.find({
        chat: new mongoose.Types.ObjectId(chatId)
    });

    // let attachements = [];

    // attachements = attachements.contact(
    //     ...message.map((message) => {
    //         return message.attachements
    //     })
    // )
    
    // attachements.forEach((attachements) => {
    //     //remove attachement files from the local storege
    //     removeEventListener(attachements.localPath)
    // })
    
    await ChatMessage.deleteMany({
        chat: new mongoose.Types.ObjectId(chatId)
    });
}

const searchAvailableUsers = asyncHandler(async (req, res) => {
    const users = await User.aggregate([
        {
            $match: {
                _id: {
                    $ne : req.user._id // avoid logged in user
                }
            }
        },
        {
            $project: {
                avatar: 1,
                username: 1,
                email : 1
            }
        }
    ])
    
    return res.status(200).json(new ApiRespose(200 , users, "Users fetched successfully"))
})

const createOrGetAOneOnOneChat = asyncHandler(async (req, res) => {
    const { receiverId } = req.params

    const sender = await User.findById(req.user._id)
    
    const receiver = await User.findById(receiverId)
    
    if (!receiver) {
        throw new ApiError(404, "Looks like that person isn’t on SYNAPSE yet")
    }   

    if (receiver._id.toString() === req.user._id.toString()) {
        throw new ApiError(404, "Oops! You can’t start a chat with yourself.")
    }
    
   const chat = await Chat.aggregate([
       {
           $match: {
               isGroupChat: false,
               $and: [
                   {
                       participants: { $elemMatch: { $eq: sender._id } },
                    },
                    {
                        participants: {
                            $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
                        }
                    }
                ]
            }
        },
        ...chatCommanAggregation()
    ])
    

    
    if (chat.length) {
        return res.status(200).json(new ApiRespose(200, chat[0], "Your chat went through successfully."))
    }

    const newChatInstant = await Chat.create({
        name: 'One on one chat',
        participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
        admin: req.user._id
    });

    // console.log(`new chat : ${newChatInstant}`);
    


    const createdChat = await Chat.aggregate([
        {
            $match: {
                _id: newChatInstant._id
            },
        },
        ...chatCommanAggregation(),
    ])

    const payload = createdChat[0]

    if (!payload) {
            throw new ApiError(500, "INTERNAL SERVER ERROR")
    }


    payload?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return

        emitSocketEvent(
            req,
            participant._id?.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            payload
        )
    });

    return res.status(200).json(200, payload, "Chat reterieved Sucessfully")
})

const createGroupChat = asyncHandler(async (req, res) => { 
    const { name, participants } = req.body

    // console.log(`name : ${name}`);
    // console.log(`participants : ${participants}`);
    

    if (participants.includes(req.user._id.toString())) {
        throw new ApiError(400, "participants array should not contain the group creator")
    }

    const members = [...new Set([...participants, req.user._id.toString()])]

    if (members.length < 3) {
        throw new ApiError(400 , "Seems like you have passed duplicate participate")
    }

    const groupChat = await Chat.create({
        name,
        isGroupChat: true,
        participants: members,
        admin : req.user
    })

    const chat = await Chat.aggregate([
        {
            $match: {
                _id : groupChat._id
            }
        },
        ...chatCommanAggregation()
    ])


    const payload = chat[0];

    payload?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return

        emitSocketEvent(
            req,
            participant._id?.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            payload
        )
    })

    return res.status(200).json(new ApiRespose(200,payload, "You’ve successfully created a group — start chatting!"))

})

const getGroupChatDetails = asyncHandler(async (req, res) => {

    const { chatId } = req.params

    const groupChat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
                isGroupChat : true
            }
        },
        ...chatCommanAggregation()
    ])

    const chat = groupChat[0]


    if (!chat) {
        throw new ApiError(404 , "Group chat does not exist")
    }

    return res
        .status(200)
        .json(new ApiRespose(200, chat, `GROUP CHAT FETCH SUCCESSULLY`))
})

const renameGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params
    const { groupName } = req.body

    const name = groupName;

    console.log(name);
    console.log(req.params.chatId);


    

    const groupChat = await Chat.findOne({
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat : true
    })

    if (!groupChat) {
        throw new ApiError(404, "GROUP CHAT NOT EXIST")
    }

    if (groupChat.admin?.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "YOUR NOT ADMIN")
    }

    const updateGroupChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $set: {
                name
            }
        },
        {new : true}
    )

    const chat = await Chat.aggregate([
        {
            $match: {
                _id : updateGroupChat._id
            }
        },
        ...chatCommanAggregation()
    ])

    const payload = chat[0]


    payload?.participants?.forEach((participant) => {
        emitSocketEvent(
            req,
            participant._id?.toString(),
            ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
            payload
        )
    })

    return res.status(200).json(new ApiRespose(200, chat[0], "Group chat name updated successfully"))

})

const deleteGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    console.log(chatId);
    

    const groupChat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
                isGroupChat: true
            }
        },
        ...chatCommanAggregation()
    ])


    const chat = groupChat[0];

    if (!chat) {
        throw new ApiError(400 , " GROUP CHAT NOT EXIST")
    }

    // console.log(chat.admin._id.toString() !== req.user._id.toString());
    


    if (chat.admin._id.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "ONLY ADMIN CAN DELETE THE GROUP CHAT")
    }

    await Chat.findByIdAndDelete(chatId)

    await deleteCascadeChatMessage(chatId)


    chat?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return
        emitSocketEvent(
            req,
            participant._id?.toString(),
            ChatEventEnum.LEAVE_CHAT_EVENT,
            chat
        )
    })


    return res.status(200).json(new ApiRespose(200, {}, "You’ve successfully deleted the group chat"))

})

const deleteOneOnOneChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
                isGroupChat : true
            }
        },
        ...chatCommanAggregation()
    ])

    const payload = chat[0];

    if (!payload) {
        throw new ApiError(400,"Chat does not exist")
    }

    await Chat.findByIdAndDelete(chatId)

    await deleteCascadeChatMessage(chatId)

    const otherParticipants = payload?.participants?.find(
        (participant) => participant?._id.toString() !== req.user._id.toString()
    )

    emitSocketEvent(
        req,
        otherParticipants._id?.toString(),
        ChatEventEnum.LEAVE_CHAT_EVENT,
        payload
    )

    return res.status(200).json(new ApiRespose(200, {}, `Chat deletion successful`))
})

const leaveGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params

    const groupChat = await Chat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      isGroupChat: true,
    });

    if (!groupChat) {
        throw new ApiError(404, "GROUP CHAT NOT EXITS")
    }

    const existParticipants = groupChat.participants

    if (!existParticipants.includes(req.user._id)) {
        throw new ApiError(404, "YOUR NOT PART ON THIS GROUP CHAT")
    }


    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {
                participants : req.user?._id
            }
        },
        { new : true}
    )

    const chat = await Chat.aggregate([
        {
            $match: {
                _id :  updateChat._id
            }
        },
        ...chatCommanAggregation()
    ])


    const payload = chat[0]


    if (!payload) {
         throw new ApiError(500, "INTERNAL SERVER ERROR")
    }

    return res.status(200).json(new ApiRespose(200, payload, "LEFT A GROUP SUCCESSFULLY"))


})

const addNewParticipantInGroupChat = asyncHandler(async (req, res) =>{
    const { chatId, participantId } = req.params

    // console.log("chatId",chatId);
    // console.log("participantId",participantId);
    

    const groupChat = await Chat.findOne(
        {
            _id: new mongoose.Types.ObjectId(chatId),
            isGroupChat: true
        }
    )

    if (!groupChat) {
        throw new ApiError(404, "GROUP CHAT NOT EXIST")
    }

    if (groupChat.admin._id.toString() !== req.user._id.toString()) {
        throw new ApiError(404,"YOUR NOT AN ADMIN")
    }

    const existParticipants = groupChat.participants
    

    if (existParticipants.includes(participantId)) {
      throw new ApiError(409, "USER ALREADY IN GROUP CHAT");
    }

    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {
                participants : participantId
            }
        },
        {new : true}
    )

    const chat = await Chat.aggregate([
        {
            $match: {
                _id : updateChat._id
            }
        },
        ...chatCommanAggregation()
    ])

    const payload = chat[0]


    if (!payload) {
        throw new ApiError(500, "INTERNAL SERVER ERROR")
    }

    // emitSocketEvent(
    //     req,
    //     participantId,
    //     ChatEventEnum.NEW_CHAT_EVENT,
    //     payload
    // )
    

    return res
    .status(200)
    .json(new ApiRespose(200, payload, "participant add successfully"))
})

const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
    const { chatId, participantId } = req.params

    const groupChat = await Chat.findOne({
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat : true
    })

    if (!groupChat) {
        throw new ApiError(400,"GROUP CHAT NOT EXIST")
    }

    if (groupChat.admin._id.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "YOUR NOT AN GROUP ADMIN")
    }


    const existParticipants = groupChat.participants

    if (!existParticipants?.includes(participantId)){
        throw new ApiError(400, "participant does not exist in this group")
    }


    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {
                participants : participantId
            }
        },
        {
            new  : true
        }
    )


    const chat = await Chat.aggregate([
        {
            $match: {
                _id : updateChat._id
            }
        },
        ...chatCommanAggregation()
    ])

    const payload = chat[0]

    if (!payload) {
        throw new ApiError(500, "INTERNAL SERVER ERROR")
    }


    emitSocketEvent(
        req,
        participantId,
        ChatEventEnum.LEAVE_CHAT_EVENT,
        payload
    )

    return res
        .status(200)
        .json(new ApiRespose(200, payload, "PARTICIPANT REMOVE SUCCESSFULLY"))
})

const getAllChats = asyncHandler(async (req, res) => {
    const chat = await Chat.aggregate([
        {
            $match: {
                participants : { $elemMatch : {$eq : req.user._id} }
            },
        },
        {
            $sort: {
                updateAt : -1,
            }
        },
        ...chatCommanAggregation()
    ])

    return res.status(200).json(new ApiRespose(200, chat, "USER CHATS FETCH SUCCESSFULLY"))
})

// const updateGroupAvatar = asyncHandler(async(req,res) =>{
    
// })

export {
  addNewParticipantInGroupChat, 
  chatCommanAggregation, 
  createGroupChat, 
  createOrGetAOneOnOneChat, 
  deleteCascadeChatMessage, 
  deleteGroupChat,
  deleteOneOnOneChat, 
  getAllChats, 
  getGroupChatDetails, 
  leaveGroupChat, 
  removeParticipantFromGroupChat, 
  renameGroupChat, 
  searchAvailableUsers,
};
