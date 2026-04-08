import React, { useState, useCallback } from "react";
import { Search, Filter, Clock, MessageSquare, Users, Crown, Shield, Star, Zap, Activity, Bell, MoreVertical, Plus } from "lucide-react";
import { MdAddComment } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import AddMenu from "./AddMenu";
import DotMenu from "./DotMenu";
import { getRelativeTime, getInitials } from "./utils";
import { useAuth } from '../../context/AuthContext'
import { AvatarImage } from "../../../public";

const ChatList = ({
  chats = [],
  loadingChats = false,
  activeChat,
  searchQuery,
  currentUserId,
  onChatSelect,
  onSearchChange,
  onNewChatClick
}) => {
  const [addMenu, setAddMenu] = useState(false);
  const [dotMenu, setDotMenu] = useState(false);
  const [hoveredChat, setHoveredChat] = useState(null);
  const { user } = useAuth();

  // Enhanced theme with gradients
  const theme = {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    accent: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      online: '#22c55e',
      offline: '#6b7280',
      typing: '#f97316'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      gold: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    }
  };

  // Safely get the other user in a chat
  const getOtherUser = useCallback(
    (chat) => {
      if (!chat?.participants?.length) return null;
      return chat.participants.find((p) => p._id !== currentUserId) || chat.participants[0];
    },
    [currentUserId]
  );

  // Display name fallback
  const getDisplayName = useCallback((chat) => {
    const other = getOtherUser(chat);
    return other?.username || other?.email || "Unknown User";
  }, [getOtherUser]);

  // Get user gradient color based on user ID or index
  const getUserGradient = useCallback((user) => {
    if (!user?._id) return theme.gradients.primary;

    const id = user._id;
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    ];

    // Generate consistent index from user ID
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  }, []);

  // Get solid color for fallback
  const getUserColor = useCallback((user) => {
    if (!user?._id) return '#667eea';

    const id = user._id;
    const colors = [
      '#667eea', // Indigo
      '#f5576c', // Pink
      '#4facfe', // Blue
      '#43e97b', // Green
      '#fa709a', // Rose
      '#a8edea', // Cyan
      '#d299c2', // Purple
      '#89f7fe', // Sky
    ];

    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, []);

  // Last seen text with enhanced styling
  const getLastSeenText = useCallback((user) => {
    if (!user) return "Offline";
    if (user.online) return "Active now";
    if (user.typing) return "Typing...";
    if (user.lastSeen) {
      const diffMs = new Date() - new Date(user.lastSeen);
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
      return `${Math.floor(mins / 1440)}d ago`;
    }
    return "Recently active";
  }, []);

  // Get status color
  const getStatusColor = useCallback((user) => {
    if (!user) return theme.accent.offline;
    if (user.online) return theme.accent.online;
    if (user.typing) return theme.accent.typing;
    return theme.accent.offline;
  }, []);

  // Filter chats safely
  const filteredChats = chats.filter((chat) => {
    const other = getOtherUser(chat);
    const name = other?.username || other?.email || "";
    const lastMsg = chat.latestMessage?.content || "";

    if(!chat.isArchived) {
    return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
    );

    }


  });





  // User stats
  const totalMessages = chats.reduce((sum, chat) => sum + (chat.messageCount || 0), 0);
  const onlineContacts = chats.filter(chat => {
    const other = getOtherUser(chat);
    return other?.online;
  }).length;



  return (
    <div className="w-[420px] border-r border-gray-200/50 bg-gradient-to-b from-white via-white to-indigo-50/20 flex flex-col shadow-2xl shadow-blue-100/20">
      {/* Enhanced Header */}
      <div className="p-6 pb-4 border-b border-gray-200/50 bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex-1">
            {/* User Profile */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-md opacity-30 animate-pulse"></div>
                <img
                  src={user.avatar || AvatarImage}
                  alt={user.username}
                  className="relative h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent truncate">
                    {user.username}
                  </h3>

                </div>
                <p className="text-sm text-gray-600 truncate mb-3">
                  {user.email.length > 28 ? `${user.email.slice(0, 28)}...` : user.email}
                </p>

                {/* Quick Stats */}

              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
           <button
                onClick={() => setAddMenu((prev) => !prev)}
                className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all group"
                title="Create new group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <button
                onClick={() => setDotMenu((prev) => !prev)}
                className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
          </div>

          {addMenu && <AddMenu onClose={() => setAddMenu(false)} />}
          {dotMenu && <DotMenu onClose={() => setDotMenu(false)} />}
        </div>

        {/* Enhanced Search Bar */}
       <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
          <input
            type="text"
            placeholder="Search conversations, messages, or users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
           className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-r from-white to-gray-50/50 border-2 border-gray-300/50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              title="Clear search"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          )}
          {!searchQuery && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">

            </div>
          )}
        </div>
      </div>

      {/* Chats List Header */}
      <div className="px-6 py-4 border-b border-gray-200/30 bg-gradient-to-r from-white to-indigo-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-800">Conversations</h4>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 rounded-full">
              {filteredChats.length}
            </span>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Enhanced Chats List */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-white via-white to-blue-50/10">
        {loadingChats ? (
          <div className="p-12 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gradient-to-r border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-cyan-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-gradient-to-r border-b-purple-500 border-l-pink-500 border-t-cyan-500 border-r-blue-500 animate-spin" style={{animationDirection: 'reverse'}}></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-l-gradient-to-r border-l-blue-500 border-t-purple-500 border-r-pink-500 border-b-cyan-500 animate-spin" style={{animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Loading conversations
            </p>
            <p className="text-sm text-gray-500">Fetching your latest messages...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-8">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-100/50 to-gray-200/50 rounded-2xl flex items-center justify-center shadow-inner">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-xl flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-3">
              No conversations found
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm">
              {searchQuery ? 'Try searching with different keywords' : 'Start your first conversation to begin chatting'}
            </p>
            <button
              onClick={onNewChatClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredChats.map((chat, index) => {
              const other = getOtherUser(chat);
              const displayName = getDisplayName(chat);
              const lastSeenText = getLastSeenText(other);
              const statusColor = getStatusColor(other);
              const userGradient = getUserGradient(other);
              const isActive = activeChat === chat._id;
              const isHovered = hoveredChat === chat._id;
              const hasUnread = chat.unreadCount > 0;

              return (
                <div
                  key={chat._id}
                  onClick={() => onChatSelect(chat._id)}
                  onMouseEnter={() => setHoveredChat(chat._id)}
                  onMouseLeave={() => setHoveredChat(null)}
                  className={`relative p-4 cursor-pointer transition-all duration-300 rounded-2xl ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 border-l-4 border-gradient-to-r border-l-blue-500 shadow-lg transform -translate-y-0.5'
                      : 'hover:bg-gradient-to-r hover:from-white hover:via-gray-50/50 hover:to-blue-50/30 hover:shadow-md hover:transform hover:-translate-y-0.5 border border-gray-200/30'
                  } ${hasUnread ? 'bg-gradient-to-r from-blue-50/60 to-indigo-50/40' : ''}`}
                >
                  {/* Selection glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 rounded-2xl blur-sm"></div>
                  )}

                  {/* Unread notification glow */}
                  {hasUnread && !isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                  )}

                  <div className="relative flex items-center gap-4">
                    {/* Enhanced Avatar */}
                    <div className="relative flex-shrink-0">
                      {/* Avatar glow effect */}
                      {other?.online && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 to-green-400/20 rounded-full blur-sm animate-pulse"></div>
                      )}

                      {/* Avatar container */}
                      <div className={`relative rounded-2xl p-0.5 ${
                        other?.online
                          ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400'
                      } ${isActive ? 'bg-gradient-to-r from-blue-400 to-purple-500' : ''}`}>
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={displayName}
                            className="relative rounded-xl h-16 w-16 object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div
                            className="relative rounded-xl h-16 w-16 flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-md"
                            style={{ background: userGradient }}
                          >
                            {getInitials(displayName)}
                          </div>
                        )}
                      </div>

                      {/* Online/Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center shadow-lg ${
                        other?.online
                          ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                          : other?.typing
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        {other?.online ? (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        ) : other?.typing ? (
                          <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        ) : null}
                      </div>

                      {/* Verified badge */}
                      {other?.verified && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 truncate text-lg group-hover:text-gray-800 transition-colors">
                              {displayName}
                            </h4>
                            {hasUnread && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full truncate max-w-[160px]">
                              {other?.email?.length > 24 ? `${other.email.slice(0, 24)}...` : other?.email || "No email"}
                            </span>
                            {other?.premium && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full">
                                <Crown className="w-3 h-3 inline mr-1" />
                                PREMIUM
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                          }`}>
                            {getRelativeTime(chat.latestMessage?.createdAt || chat.updatedAt)}
                          </span>
                          {hasUnread && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Preview & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {chat.latestMessage ? (
                            <>
                              <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <p className={`text-sm truncate ${
                                hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'
                              }`}>
                                {chat.latestMessage.content}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              Start a conversation...
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          <Clock className="w-3.5 h-3.5" style={{ color: statusColor }} />
                          <span className="text-xs font-medium" style={{ color: statusColor }}>
                            {lastSeenText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect line */}
                  {isHovered && !isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with Stats */}
      <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-white to-blue-50/30">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-gray-700">
              Showing {filteredChats.length} of {chats.length} conversations
            </span>
            {searchQuery && filteredChats.length < chats.length && (
              <span className="text-gray-500 ml-2">
                ({chats.length - filteredChats.length} hidden)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600">
              {onlineContacts} online
            </span>
          </div>
        </div>
      </div>

      {/* Add custom animations */}

    </div>
  );
};

export default ChatList;









//  <style jsx>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-3px); }
//         }
//         @keyframes ping {
//           75%, 100% { transform: scale(2); opacity: 0; }
//         }
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
//         .animate-float {
//           animation: float 2s ease-in-out infinite;
//         }
//         .animate-ping {
//           animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
//         }
//       `}</style>
