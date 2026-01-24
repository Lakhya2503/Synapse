import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { ChatEventEnum } from '../constant.js'
import User from '../model/user.model.js'
import ApiError from '../utils/ApiError.js'

const onlineUsers = new Map()

const mountJoinChatEvent = (socket) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
        //  (`User join the chat .🖐️chatId ${chatId}`);
        socket.join(chatId)
    })
}

const mountParticipantTypingEvent = (socket) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId)
    })
}

const mountParticipantStoppedTypingEvent = (socket) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId)
    })
}

const intializeSocketIO = (io) => {
    return io.on("connection", async (socket) => {
            try {
                const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

                let token = cookies?.accessToken

                if (!token) {
                    token = socket.handshake.auth?.token
                }

                if (!token) {
                  throw new ApiError(
                    401,
                    "Un-Authroized handshake. Token is missing  "
                  );
                }

                const decodedToken = jwt.verify(
                  token,
                  process.env.ACCESS_TOKEN_SECRET
                );

                const user = await User
                    .findById(decodedToken._id)
                    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

                if (!user) {
                    throw new ApiError(
                      401,
                      "Un-Authroized handshake. Token is missing  "
                    );
                }

                socket.user = user

                socket.join(user._id.toString())

                socket.emit(ChatEventEnum.CONNECTED_EVENT)
                socket.emit(ChatEventEnum.USER_ONLINE_EVENT)

                //  (`USER CONNECTED ✨✨ .userID: ${user._id.toString()}`);

                onlineUsers.set(user._id, socket.id);

                io.emit("user_online", { userId: user._id });

                //  (`user online ${user._id}`);



                mountJoinChatEvent(socket)
                mountParticipantTypingEvent(socket)
                mountParticipantStoppedTypingEvent(socket)


                socket.on(ChatEventEnum.DISCONNECTED_EVENT, () => {
                    //  (`USER DISCONNECTED 🚫 .userID + ${socket.user?._id}`);

                     onlineUsers.delete(user._id);
                     io.emit("user_offline", { userId: user._id });

                    if (socket.user?._id) {
                        socket.leave(socket.user._id)
                    }
                })
            } catch (error) {
                socket.emit(
                    ChatEventEnum.SOCKET_EVENT_ERROR,
                    error?.message  || "SOMETHING WENTS WRONG WILL CONNECTING THE SOCKET"
                    )
            }
    })
}

const emitSocketEvent = (req, roomId, event, payload) => {
    req.app.get("io").in(roomId).emit(event, payload)
}

export { emitSocketEvent, intializeSocketIO }
