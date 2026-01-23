import {
  ReplyIcon,
  SearchIcon,
  SendIcon,
  Paperclip,
  Smile,
  Copy
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { FakeGroupAvatar } from "../../../public";
import {
  createUserChat,
  deleteMessage,
  getAllMessages,
  sendMessage
} from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { requestHandler } from "../../utils";
import { ChatEventEnum } from "../../utils/constant";
import {
  CloseIcon,
  debounce,
  DeleteIcon,
  EditIcon,
  formatMessageDate,
  formatTime,
  ProfileIcon
} from '../ui/IconsAndUtility';
import ProfileSection from "./ProfileSection";
import { emojis } from "../ui/emojis";
import MessageBubble from '../common/MessageBubble'

// Main Chat Window Component
const ChatWindow = ({ otherUser, onMessageSent }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Constants
  const EMOJIS_PER_PAGE = 30;
  const [emojiPage, setEmojiPage] = useState(0);
  const totalEmojiPages = Math.ceil(emojis.length / EMOJIS_PER_PAGE);
  const visibleEmojis = emojis.slice(
    emojiPage * EMOJIS_PER_PAGE,
    (emojiPage + 1) * EMOJIS_PER_PAGE
  );

  // State
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Initialize chat
  useEffect(() => {
    if (!otherUser?._id) return;

    const initializeChat = async () => {
      setLoading(true);
      try {
        let tempChatId = otherUser.isGroupChat ? otherUser._id : null;

        // Create direct chat if it doesn't exist
        if (!tempChatId) {
          await requestHandler(
            async () => {
              const res = await createUserChat(otherUser._id);
              return res;
            },
            null,
            (res) => {
              tempChatId = res.data._id;
            }
          );
        }

        setChatId(tempChatId);

        // Fetch messages
        await requestHandler(
          async () => getAllMessages(tempChatId),
          null,
          (res) => {
            const sortedMessages = res.data.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            setMessages(sortedMessages);
          },
          () => {
            setMessages([]);
          }
        );
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [otherUser]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, chatId);

    const handleMessageReceived = (message) => {
      if (message.chat !== chatId) return;

      setMessages(prev => [...prev, message]);

      if (message.sender._id !== user._id) {
        onMessageSent?.(message);
      }
    };

    const handleTyping = ({ chatId: id, userId, isTyping: typing }) => {
      if (id !== chatId) return;

      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (typing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    const handleMessageRead = ({ chatId: id, messageIds }) => {
      if (id !== chatId) return;

      setMessages(prev => prev.map(msg =>
        messageIds.includes(msg._id) ? { ...msg, read: true } : msg
      ));
    };

    const handleMessageDeleted = ({ chatId: id, messageId }) => {
      if (id !== chatId) return;

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleMessageUpdated = ({ chatId: id, messageId, content }) => {
      if (id !== chatId) return;

      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, content, edited: true } : msg
      ));
    };

    // Register socket listeners
    const listeners = [
      [ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleMessageReceived],
      [ChatEventEnum.TYPING_EVENT, handleTyping],
      [ChatEventEnum.MESSAGE_READ_EVENT, handleMessageRead],
      [ChatEventEnum.MESSAGE_DELETED_EVENT, handleMessageDeleted],
      [ChatEventEnum.MESSAGE_UPDATED_EVENT, handleMessageUpdated]
    ];

    listeners.forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatId);
      listeners.forEach(([event, handler]) => socket.off(event, handler));
      setTypingUsers(new Set());
    };
  }, [socket, chatId, user._id, onMessageSent]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isFromCurrentUser = lastMessage.sender._id === user._id;

    if (isFromCurrentUser || !lastMessage.read) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, user._id]);

  // Mark messages as read
  useEffect(() => {
    if (!socket || !chatId || !messages.length) return;

    const unreadMessages = messages.filter(
      msg => msg.sender._id !== user._id && !msg.read
    );

    if (unreadMessages.length > 0) {
      socket.emit(ChatEventEnum.MESSAGE_READ_EVENT, {
        chatId,
        messageIds: unreadMessages.map(msg => msg._id),
      });
    }
  }, [messages, socket, chatId, user._id]);

  // Handle typing indicator with debounce
  const handleTyping = useCallback(
    debounce(() => {
      if (!socket || !chatId) return;

      socket.emit(ChatEventEnum.TYPING_EVENT, {
        chatId,
        isTyping: true,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit(ChatEventEnum.TYPING_EVENT, {
          chatId,
          isTyping: false,
        });
      }, 1000);
    }, 300),
    [socket, chatId]
  );

  const handleSendMessage = async () => {
    const content = messageText.trim();
    if (!content || !chatId) return;

    const tempId = `temp-${Date.now()}`;

    // Create optimistic message
    const optimisticMessage = {
      _id: tempId,
      content,
      chat: chatId,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
      replyTo: replyingTo,
      createdAt: new Date().toISOString(),
      read: false,
      optimistic: true,
    };

    // Add optimistic message
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageText("");
    setReplyingTo(null);
    setEditingMessage(null);

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit(ChatEventEnum.TYPING_EVENT, {
        chatId,
        isTyping: false,
      });
    }

    // Send message
    await requestHandler(
      async () => sendMessage(chatId, content, replyingTo?._id),
      null,
      (res) => {
        // Replace optimistic message with real one
        setMessages(prev =>
          prev.map(msg => msg._id === tempId ? res.data : msg)
        );

        // Emit message sent event
        socket?.emit(ChatEventEnum.MESSAGE_SENT_EVENT, {
          chatId,
          message: res.data,
        });

        onMessageSent?.(res.data);
      },
      () => {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    );
  };

  const handleEditMessage = async (messageId, newContent) => {
    if (!newContent.trim()) return;

    await requestHandler(
      async () => {
        const res = await sendMessage(chatId, newContent);
        socket?.emit(ChatEventEnum.MESSAGE_UPDATED_EVENT, {
          chatId,
          messageId,
          content: newContent
        });
        return res;
      },
      null,
      () => {
        setEditingMessage(null);
      }
    );
  };

  const handleDeleteMessage = async (messageChatId, messageId) => {
    await requestHandler(
      async () => {
        const res = await deleteMessage(messageChatId, messageId);
        socket?.emit(ChatEventEnum.MESSAGE_DELETED_EVENT, {
          chatId: messageChatId,
          messageId
        });
        return res;
      },
      null,
      () => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    );
  };

  const handleMessageAction = useCallback((action) => {
    switch (action.type) {
      case 'reply':
        setReplyingTo(action.message);
        inputRef.current?.focus();
        break;
      case 'edit':
        setEditingMessage(action.message);
        setMessageText(action.message.content);
        inputRef.current?.focus();
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this message?')) {
          handleDeleteMessage(action.message.chat, action.message._id);
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(action.message.content);
        break;
      case 'select':
        setSelectedMessages(prev => {
          const newSet = new Set(prev);
          if (newSet.has(action.messageId)) {
            newSet.delete(action.messageId);
          } else {
            newSet.add(action.messageId);
          }
          return newSet;
        });
        break;
      default:
        break;
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleEditMessage(editingMessage._id, messageText);
      } else {
        handleSendMessage();
      }
    }
    if (e.key === "Escape") {
      setReplyingTo(null);
      setEditingMessage(null);
      setShowEmojiPicker(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    handleTyping();
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const filteredMessages = messages.filter(msg =>
      !searchTerm || msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredMessages.reduce((groups, message) => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  }, [messages, searchTerm]);

  // Check if should show sender name in group chats
  const shouldShowSenderName = useCallback((currentMessage, previousMessage) => {
    if (!otherUser.isGroupChat) return false;
    if (!previousMessage) return true;

    const currentSender = currentMessage.sender._id;
    const previousSender = previousMessage.sender._id;

    return currentSender !== previousSender;
  }, [otherUser.isGroupChat]);

  // Typing indicator text
  const typingIndicatorText = useMemo(() => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers)
      .map(id => {
        if (otherUser.isGroupChat) {
          const member = otherUser.participants?.find(p => p._id === id);
          return member?.username;
        }
        return otherUser.username;
      })
      .filter(Boolean);

    if (typingUserNames.length === 0) return null;

    return typingUserNames.join(", ") +
      (typingUserNames.length === 1 ? " is typing..." : " are typing...");
  }, [typingUsers, otherUser]);

  const handleAddEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
  };

  const handleClearMessage = () => {
    setMessageText("");
    setReplyingTo(null);
    setEditingMessage(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-indigo-50/20 to-purple-50/20">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Loading conversation...
        </p>
        <p className="mt-2 text-sm text-gray-500">Getting everything ready for you</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-row bg-gradient-to-br from-gray-50 via-blue-50/10 to-purple-50/10">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/20"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Header */}
        <ChatHeader
          otherUser={otherUser}
          isConnected={isConnected}
          typingIndicatorText={typingIndicatorText}
          showSearch={showSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setShowSearch={setShowSearch}
          selectedMessages={selectedMessages}
          setSelectedMessages={setSelectedMessages}
          setIsProfileOpen={setIsProfileOpen}
        />

        {/* Reply Preview */}
        {replyingTo && (
          <ReplyPreview
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        )}

        {/* Edit Preview */}
        {editingMessage && (
          <EditPreview
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
            setMessageText={setMessageText}
          />
        )}

        {/* Messages Container */}
        <MessagesContainer
          messagesContainerRef={messagesContainerRef}
          groupedMessages={groupedMessages}
          searchTerm={searchTerm}
          otherUser={otherUser}
          user={user}
          shouldShowSenderName={shouldShowSenderName}
          selectedMessages={selectedMessages}
          handleMessageAction={handleMessageAction}
          clearSearch={clearSearch}
          messagesEndRef={messagesEndRef}
        />

        {/* Message Input */}
        <MessageInput
          typingIndicatorText={typingIndicatorText}
          showEmojiPicker={showEmojiPicker}
          messageText={messageText}
          editingMessage={editingMessage}
          replyingTo={replyingTo}
          otherUser={otherUser}
          chatId={chatId}
          inputRef={inputRef}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleSendMessage={handleSendMessage}
          handleEditMessage={handleEditMessage}
          setShowEmojiPicker={setShowEmojiPicker}
          handleClearMessage={handleClearMessage}
        />

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            visibleEmojis={visibleEmojis}
            emojiPage={emojiPage}
            totalEmojiPages={totalEmojiPages}
            setEmojiPage={setEmojiPage}
            handleAddEmoji={handleAddEmoji}
          />
        )}
      </div>

      {/* Profile Section */}
      <ProfileSection
        otherUser={otherUser}
        onClose={() => setIsProfileOpen(false)}
        isOpen={isProfileOpen}
        chatId={chatId}
      />
    </div>
  );
};

// Sub-components for better organization

const ChatHeader = ({
  otherUser,
  isConnected,
  typingIndicatorText,
  showSearch,
  searchTerm,
  setSearchTerm,
  setShowSearch,
  selectedMessages,
  setSelectedMessages,
  setIsProfileOpen
}) => (
  <div className="relative z-10 p-6 bg-gradient-to-r from-white via-white to-indigo-50/30 border-b border-gray-200/50 backdrop-blur-sm flex items-center justify-between shadow-lg shadow-indigo-100/30">
    <div className="flex items-center gap-4">
      <button
        onClick={() => setIsProfileOpen(true)}
        className="relative hover:scale-105 transition-transform group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <img
          src={otherUser.avatar || FakeGroupAvatar}
          alt={otherUser.username || otherUser.name}
          className="relative w-14 h-14 rounded-full object-cover border-4 border-white shadow-xl"
        />
        {isConnected && (
          <div className="absolute bottom-1 right-1 w-4 h-4  rounded-full"></div>
        )}
      </button>
      <div>
        <h2 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {otherUser.username || otherUser.name}
        </h2>
        <div className="flex items-center gap-3 mt-1">
          {typingIndicatorText && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                <span className="h-2 w-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              </div>
              <p className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {typingIndicatorText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {showSearch ? (
        <div className="flex items-center bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="pl-4 pr-2">
            <SearchIcon className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-2.5 bg-transparent focus:outline-none text-gray-700 w-48"
            autoFocus
          />
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchTerm("");
            }}
            className="px-3 py-2.5 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 shadow hover:shadow-lg transition-all"
          title="Search"
        >
          <SearchIcon className="text-gray-600" size={20} />
        </button>
      )}

      <button
        onClick={() => setIsProfileOpen(true)}
        className="p-3 rounded-xl bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 shadow hover:shadow-lg transition-all group"
        title="Profile"
      >
        <ProfileIcon className="text-indigo-600 group-hover:scale-110 transition-transform" size={20} />
      </button>

      {selectedMessages.size > 0 && (
        <div className="flex items-center gap-3 ml-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
          <span className="text-sm font-bold text-white">
            {selectedMessages.size} selected
          </span>
          <button
            onClick={() => setSelectedMessages(new Set())}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <CloseIcon className="text-white" />
          </button>
        </div>
      )}
    </div>
  </div>
);

const ReplyPreview = ({ replyingTo, setReplyingTo }) => (
  <div className="relative z-10 px-6 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-y border-indigo-200/50 flex items-center justify-between backdrop-blur-sm">
    <div className="flex-1">
      <p className="text-xs font-bold text-indigo-700">Replying to {replyingTo.sender.username}</p>
      <p className="text-sm text-indigo-600 font-medium">{replyingTo.content}</p>
    </div>
    <button
      onClick={() => setReplyingTo(null)}
      className="p-2 hover:bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl transition-colors"
    >
      <CloseIcon className="text-indigo-600" />
    </button>
  </div>
);

const EditPreview = ({ editingMessage, setEditingMessage, setMessageText }) => (
  <div className="relative z-10 px-6 py-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-y border-amber-200/50 flex items-center justify-between backdrop-blur-sm">
    <div className="flex-1">
      <p className="text-xs font-bold text-amber-700">Editing message</p>
      <p className="text-sm text-amber-600 font-medium">{editingMessage.content}</p>
    </div>
    <button
      onClick={() => {
        setEditingMessage(null);
        setMessageText("");
      }}
      className="p-2 hover:bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl transition-colors"
    >
      <CloseIcon className="text-amber-600" />
    </button>
  </div>
);

const MessagesContainer = ({
  messagesContainerRef,
  groupedMessages,
  searchTerm,
  otherUser,
  user,
  shouldShowSenderName,
  selectedMessages,
  handleMessageAction,
  clearSearch,
  messagesEndRef
}) => (
  <div
    ref={messagesContainerRef}
    className="flex-1 overflow-y-auto p-6 relative"
  >
    {/* Decorative background elements */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-indigo-100/10 to-purple-100/10 rounded-full -translate-x-32 -translate-y-32"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-100/10 to-rose-100/10 rounded-full translate-x-48 translate-y-48"></div>

    {Object.keys(groupedMessages).length === 0 ? (
      <EmptyMessagesState
        searchTerm={searchTerm}
        otherUser={otherUser}
        clearSearch={clearSearch}
      />
    ) : (
      <div className="relative z-10">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <DateMessagesGroup
            key={date}
            date={date}
            dateMessages={dateMessages}
            otherUser={otherUser}
            user={user}
            shouldShowSenderName={shouldShowSenderName}
            selectedMessages={selectedMessages}
            handleMessageAction={handleMessageAction}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    )}
  </div>
);

const EmptyMessagesState = ({ searchTerm, otherUser, clearSearch }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 relative z-10">
    <div className="relative mb-8">
      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-200/30 to-purple-200/30 flex items-center justify-center shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-300/40 to-purple-300/40 flex items-center justify-center">
          <svg className="w-16 h-16 text-gradient" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>
    </div>
    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
      {searchTerm ? "No messages found" : "Start a conversation"}
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">
      {searchTerm
        ? "Try searching with different keywords"
        : `Send your first message to ${otherUser?.username || otherUser?.name}`
      }
    </p>
    {searchTerm && (
      <button
        onClick={clearSearch}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all"
      >
        Clear Search
      </button>
    )}
  </div>
);

const DateMessagesGroup = ({
  date,
  dateMessages,
  otherUser,
  user,
  shouldShowSenderName,
  selectedMessages,
  handleMessageAction
}) => (
  <div className="mb-8">
    {/* Date Separator */}
    <div className="text-center my-8 relative">
      <div className="absolute inset-0 flex items-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
      <span className="relative inline-block px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-bold rounded-full shadow-sm border border-indigo-200">
        {date}
      </span>
    </div>

    {/* Messages for this date */}
    {dateMessages.map((message, index) => (
      <MessageBubble
        key={message._id}
        message={message}
        isCurrentUser={message.sender._id === user._id}
        showSenderName={shouldShowSenderName(
          message,
          dateMessages[index - 1]
        )}
        isGroupChat={otherUser.isGroupChat}
        onMessageAction={handleMessageAction}
        isSelected={selectedMessages.has(message._id)}
        onSelect={(messageId) => handleMessageAction({ type: 'select', messageId })}
      />
    ))}
  </div>
);

const MessageInput = ({
  typingIndicatorText,
  showEmojiPicker,
  messageText,
  editingMessage,
  replyingTo,
  otherUser,
  chatId,
  inputRef,
  handleInputChange,
  handleKeyDown,
  handleSendMessage,
  handleEditMessage,
  setShowEmojiPicker,
  handleClearMessage
}) => (
  <div className="relative z-10 p-6 bg-gradient-to-b from-white via-white to-indigo-50/30 border-t border-gray-200/50 backdrop-blur-sm">
    {typingIndicatorText && (
      <div className="mb-4 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 shadow-sm inline-flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce"></span>
          <span className="h-2 w-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
          <span className="h-2 w-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
        </div>
        <p className="text-sm font-medium bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
          {typingIndicatorText}
        </p>
      </div>
    )}

    <div className="flex items-center gap-3">
      <button className="p-3.5 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 shadow hover:shadow-lg transition-all group">
        <Paperclip className="text-gray-600 group-hover:scale-110 transition-transform" size={22} />
      </button>

      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="p-3.5 rounded-xl bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 shadow hover:shadow-lg transition-all group"
      >
        <Smile className="text-blue-600 group-hover:scale-110 transition-transform" size={22} />
      </button>

      <div className="flex-1 relative">
        <input
          ref={inputRef}
          value={messageText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            editingMessage ? "Edit your message..." :
              replyingTo ? `Reply to ${replyingTo.sender.username}...` :
                `Message ${otherUser?.username || otherUser?.name}...`
          }
          className="w-full px-5 py-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-300/50 rounded-2xl focus:outline-none transition-all text-gray-800 placeholder-gray-400"
        />
        {messageText && (
          <button
            onClick={handleClearMessage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200/50 rounded-full"
          >
            <CloseIcon className="text-gray-400" size={16} />
          </button>
        )}
      </div>

      <button
        onClick={editingMessage ? () => handleEditMessage(editingMessage._id, messageText) : handleSendMessage}
        disabled={!messageText.trim() || !chatId}
        className={`p-4 rounded-xl transition-all shadow-lg ${!messageText.trim() || !chatId
            ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
          }`}
      >
        <SendIcon size={22} />
      </button>
    </div>

    {/* Character count hint */}
    {messageText.length > 0 && (
      <div className="mt-3 text-right">
        <span className={`text-xs font-medium ${messageText.length > 500
            ? "text-red-500"
            : "text-gray-500"
          }`}>
          {messageText.length}/500
        </span>
      </div>
    )}
  </div>
);

const EmojiPicker = ({
  visibleEmojis,
  emojiPage,
  totalEmojiPages,
  setEmojiPage,
  handleAddEmoji
}) => (
  <div className="absolute bottom-24 left-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-20 w-72">
    {/* Emoji Grid */}
    <div className="grid grid-cols-6 gap-2 mb-3">
      {visibleEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleAddEmoji(emoji)}
          className="p-2 text-2xl hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:scale-110 transition"
        >
          {emoji}
        </button>
      ))}
    </div>

    {/* Pagination Controls */}
    <div className="flex justify-between items-center text-sm">
      <button
        onClick={() => setEmojiPage(p => Math.max(p - 1, 0))}
        disabled={emojiPage === 0}
        className="px-3 py-1 rounded-lg bg-gray-100 disabled:opacity-40"
      >
        ◀ Prev
      </button>

      <span className="text-gray-500">
        {emojiPage + 1} / {totalEmojiPages}
      </span>

      <button
        onClick={() => setEmojiPage(p => Math.min(p + 1, totalEmojiPages - 1))}
        disabled={emojiPage === totalEmojiPages - 1}
        className="px-3 py-1 rounded-lg bg-gray-100 disabled:opacity-40"
      >
        Next ▶
      </button>
    </div>
  </div>
);

export default React.memo(ChatWindow);
