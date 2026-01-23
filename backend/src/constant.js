
const userRoleEnum = {
    ADMIN: "ADMIN",
    USER : "USER"
}

const AvailableUserRoles = Object.values(userRoleEnum)

const orderStatusEnum = {
    PENDING: "PENDING",
    CANCELLED: "CANCELLED",
    DELIVERED : "DELIVERED"
}

const AvailableOrderStatus = Object.values(orderStatusEnum)

const userLoginType = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD : "EMAIL_PASSWORD"
}

const AvailableScoialLogins =Object.values(userLoginType)

const ChatEventEnum = Object.freeze({
  CONNECTED_EVENT: "connected",
  DISCONNECTED_EVENT: "disconnected",
  JOIN_CHAT_EVENT: "joinChat",
  LEAVE_CHAT_EVENT: "leaveChat",
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  NEW_CHAT_EVENT: "newChat",
  SOCKET_EVENT_ERROR: "socketError",
  STOP_TYPING_EVENT: "stopTyping",
  TYPING_EVENT: "typing",
  MESSAGE_DELETE_EVENT: "messageDeleted",
  USER_ONLINE_EVENT: "user_online",
  USER_OFFLINE_EVENT: "user_offline",
});

const AvailableChatEvent = Object.values(ChatEventEnum);

const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000

export {
  userRoleEnum,
  AvailableUserRoles,
  AvailableOrderStatus,
  AvailableScoialLogins,
  AvailableChatEvent,
  ChatEventEnum,
  userLoginType,
  USER_TEMPORARY_TOKEN_EXPIRY
};