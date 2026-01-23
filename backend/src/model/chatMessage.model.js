import { model, Schema } from "mongoose";


const chatMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type : String,
    },
    attachements: { //for sharing images , pdf , etc
      type: [
        {
          url: String,
          localFile : String  
          }
      ],
      default : [],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref : "Chat"
    }
  },
  { timestamps: true }
);

const ChatMessage = model("ChatMessage", chatMessageSchema)

export default ChatMessage;
