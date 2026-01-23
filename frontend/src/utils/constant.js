export const ChatEventEnum = Object.freeze({
  // connection lifecycle
  CONNECTED_EVENT: "connected",
  SOCKET_EVENT_ERROR: "socket_error",

  // chat room events
  JOIN_CHAT_EVENT: "join_chat",
  LEAVE_CHAT_EVENT: "leave_chat",

  // message events
  MESSAGE_RECEIVED_EVENT: "message_received",
  MESSAGE_SENT_EVENT: "message_sent",

  // typing events
  TYPING_EVENT: "typing",
  STOP_TYPING_EVENT: "stop_typing",

  // user presence (optional)
  USER_ONLINE_EVENT: "user_online",
  USER_OFFLINE_EVENT: "user_offline",
});
