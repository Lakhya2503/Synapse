import User from "../model/user.model.js";
import { GROUP_CHAT_MAX_PARTICIPATNS_COUNT, GROUP_CHATS_COUNT, ONE_ON_ONE_CHATS_COUNT } from './_constants.js'
import { getRandomNumber } from '../utils/helper.js'
import Chat from "../model/chat.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ChatMessage from "../model/chatMessage.model.js";
import ApiRespose from "../utils/ApiResponse.js";

const seedsOneOnOneChats = async () => {
    const users = await User.find();
    
    const chatArray = new Array(ONE_ON_ONE_CHATS_COUNT)
        .fill("_")
        .map(async(_)=>{
            let index1 = getRandomNumber(users.length)
            let index2 = getRandomNumber(users.length)
            if (index1 == index2) {
                index2 <= 0 ? index2++ : index2--
            }

            const participants = [users[index1]._id.toString(), users[index2]._id.toString()];

            await Chat.findByIdAndUpdate(
              {
                $and: [
                  {
                    participants: {
                      $elemMatch: { $eq: participants[0] },
                    },
                  },
                  {
                    participants: {
                      $elemMatch: { $eq: participants[1] },
                    },
                  },
                ],
              },
              {
                $set: {
                  name: "One on one chat",
                  isGroupChat: false,
                  participants,
                  admin : participants[getRandomNumber(participants.length)]
                },
              },
              {
                upsert : true
              }
            );
        })

        await Promise.all([...chatArray])
}


const seedsGroupChat = async() =>{

      const users = await User.find()

      const groupChatArray = new Array(GROUP_CHATS_COUNT).fill("_").map((_) => {
           let participants = []

           const participantCount = getRandomNumber(GROUP_CHAT_MAX_PARTICIPATNS_COUNT)

           new Array(participantCount < 3 ? 3 : participantCount)
            .fill("_")
            .forEach((_)=>
              participants.push(users[getRandomNumber(users.length)]._id.toString())
            )

            participants = [...new Set(participants)]

            return {
              name : fake.vehicle.vehicle() + fake.comapny.buzznow(),
              isGroupChat : true,
              participants,
              admin : participants[getRandomNumber(participants.length)]
            }
      })

      await Chat.insertMany(groupChatArray)
}


const seedChatApp = asyncHandler(async(req,res)=>{
    await Chat.deleteMany({}),
    await ChatMessage.deleteMany({}),
    await seedsOneOnOneChats(),
    await seedsGroupChat()

    return res
    .status(201)
    .json(new ApiRespose(201, {}, "DATABASE Populate for chat app successfully"))
})

export {
  seedChatApp
}
