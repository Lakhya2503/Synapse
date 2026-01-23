import { model, Schema } from "mongoose";


const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    isBlock : {
      type : Boolean,
      default : false
    },
    avatar : {
      type : String,
      default : "https://i.pinimg.com/736x/54/47/b1/5447b18f3ff226459b66481a3a684808.jpg"
    } , 
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
        },
        participants : [
          {
            type: Schema.Types.ObjectId,
            ref : "User"
        }
      ],
        admin: {
            type: Schema.Types.ObjectId,
            ref : "User"
        }
  },
  { timestamps: true }
);

const Chat = model("Chat", chatSchema)

export default Chat;
