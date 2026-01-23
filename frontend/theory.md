i have some color

using add styling and coloring


## Base App Colors
| Usage | Hex |
|-----|-----|
| App Background | `#F9FAFB` |
| Panels / Cards | `#FFFFFF` |
| Primary Border | `#E5E7EB` |
| Subtle Divider | `#F1F5F9` |

---

## Typing / Input Area
| Usage | Hex |
|-----|-----|
| Input Background | `#F3F4F6` |
| Input Text | `#111827` |
| Placeholder Text | `#9CA3AF` |
| Input Focus Border | `#2563EB` |
| Typing Indicator | `#2563EB` |

---

## Chat Bubbles

### My Messages
| Usage | Hex |
|-----|-----|
| Bubble Background | `#2563EB` |
| Bubble Text | `#FFFFFF` |
| Time / Status | `#DBEAFE` |
| Read Checkmarks | `#BFDBFE` |

### Other User Messages
| Usage | Hex |
|-----|-----|
| Bubble Background | `#FFFFFF` |
| Bubble Text | `#111827` |
| Bubble Border | `#E5E7EB` |
| Time Text | `#6B7280` |

---

## User List (Sidebar)
| Usage | Hex |
|-----|-----|
| Row Background | `#FFFFFF` |
| Row Hover | `#F3F4F6` |
| Active Chat | `#DBEAFE` |
| Unread Chat | `#EFF6FF` |
| Username | `#111827` |
| Last Message Preview | `#6B7280` |

---

## Username Colors

### One-to-One Chat
| Usage | Hex |
|-----|-----|
| Username | `#111827` |

### Group Chat (Auto-assigned)
| Color | Hex |
|-----|-----|
| Group User 1 | `#2563EB` |
| Group User 2 | `#7C3AED` |
| Group User 3 | `#059669` |
| Group User 4 | `#EA580C` |
| Group User 5 | `#DC2626` |
| Group User 6 | `#0D9488` |

---

## Status Indicators
| Usage | Hex |
|-----|-----|
| Online | `#22C55E` |
| Offline | `#9CA3AF` |
| Typing | `#2563EB` |

---

## Group Chat UI
| Usage | Hex |
|-----|-----|
| Group Header BG | `#FFFFFF` |
| Group Header Border | `#E5E7EB` |
| Group Name | `#111827` |
| Member Count | `#6B7280` |
| Mention Highlight | `#FEF3C7` |
| Mention Text | `#92400E` |

---

## Notifications & Feedback
| Usage | Hex |
|-----|-----|
| Success | `#16A34A` |
| Error | `#EF4444` |
| Warning | `#F59E0B` |
| Info | `#2563EB` |



using this color

import React, { useEffect, useState, useCallback } from 'react'
import { requestHandler } from '../../utils'
import { getUsersWithMessage } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
// import ChatList from '../chats/ChatList'
import ChatWindow from '../chats/ChatWindow'
import NewChat from '../forms/NewChat'

function Chat() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch users with messages
  const fetchChats = useCallback(async () => {
    if (!user?._id) return

    setLoadingChats(true)
    await requestHandler(
      async () => await getUsersWithMessage(),
      null,
      (res) => {
        const usersWithMessages = res.data?.data || res.data || []

        const chatData = usersWithMessages.map(user => ({
          _id: user._id,
          participants: [user, user],
          lastMessage: user.lastMessage,
          unreadCount: user.unreadCount || 0,
          lastMessageTime: user.lastMessageTime || new Date(),
          isOnline: Math.random() > 0.5, // Mock online status
          ...user
        }))

        setChats(chatData)

        // Calculate total unread count
        const totalUnread = chatData.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
        setUnreadCount(totalUnread)
        setLoadingChats(false)
      },
      (error) => {
        console.error('Failed to fetch users with messages:', error)
        setLoadingChats(false)
      }
    )
  }, [user?._id])

  useEffect(() => {
    if (user?._id) {
      fetchChats()
    }
  }, [user?._id, fetchChats])

  const handleChatSelect = (chatId) => {
    const chat = chats.find(c => c._id === chatId)
    setSelectedChat(chat)
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }

  const handleMessageSent = () => {
    fetchChats()
  }

  const handleNewChatClick = () => {
    navigate('/synapse/chat/new')
  }

  const getOtherUser = () => {
    if (!selectedChat || !user?._id) return null

    if (selectedChat._id !== user._id) {
      return {
        ...selectedChat,
        isGroupChat: false
      }
    }

    return selectedChat.participants?.find(p => p._id !== user._id) || selectedChat.participants?.[0]
  }

  // If we're on the new chat route, render NewChat component
  if (window.location.pathname.includes('/chat/new')) {
    return <NewChat />
  }

  if (!user || !user._id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl shadow-xl animate-pulse">
              🔒
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
              !
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Secure Access Required
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please authenticate to access your private conversations and connect with others.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Proceed to Login
            </span>
          </button>
          <p className="mt-6 text-sm text-gray-500">
            New to Synapse?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-500 hover:text-blue-600 font-medium hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    const searchStr = searchQuery.toLowerCase()
    return (
      (chat.username || '').toLowerCase().includes(searchStr) ||
      (chat.lastMessage?.content || '').toLowerCase().includes(searchStr)
    )
  })

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Floating Decorative Elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative h-full flex">
        {/* Chat List Sidebar with Glass Effect */}
        <div className="w-full max-w-md h-full bg-white/80 backdrop-blur-sm border-r border-gray-200/50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white to-white/90">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div> */}
                  <img src={user.avatar} alt=""  className='h-12 w-12 object-cover rounded-full border-2'/>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Messages
                  </h2>
                  <p className="text-sm text-gray-500">
                    {unreadCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                      </span>
                    ) : 'All caught up'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchChats}
                  className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:text-blue-600 hover:shadow-md transition-all duration-200 hover:scale-105"
                  title="Refresh chats"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={handleNewChatClick}
                  className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
                  title="New conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-0 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white shadow-sm transition-all duration-300"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loadingChats ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-100/50 to-gray-200/50 animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations found</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  {searchQuery ? 'Try a different search term' : 'Start a conversation to see it here'}
                </p>
                <button
                  onClick={handleNewChatClick}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredChats.map(chat => (
                  <div
                    key={chat._id}
                    onClick={() => handleChatSelect(chat._id)}
                    className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedChat?._id === chat._id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 shadow-sm'
                        : 'hover:bg-gradient-to-r from-gray-50/50 to-gray-100/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm${
                          chat.unreadCount > 0
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}>
                          <img src={chat.avatar} alt="" className='rounded-full' />
                        </div>
                        {chat.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {chat.username}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-white to-white/90">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                <span className="font-medium">{filteredChats.length}</span> conversations
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              currentUserId={user._id}
              otherUser={getOtherUser()}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/10 to-cyan-100/10 rounded-full blur-2xl"></div>

              <div className="relative z-10 max-w-lg text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-100/30 via-white to-purple-100/30 rounded-full flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full flex items-center justify-center animate-pulse">
                      <div className="text-8xl text-white/80">💬</div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-2xl shadow-xl animate-bounce">
                    ✨
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-xl shadow-xl animate-bounce delay-300">
                    👋
                  </div>
                </div>

                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent mb-4">
                  Welcome to Synapse Chat
                </h2>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
                  Connect instantly with your team, friends, and colleagues.
                  Select a conversation or start a new one to begin messaging.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleNewChatClick}
                    className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Start New Chat
                    </span>
                  </button>

                  <button
                    onClick={fetchChats}
                    className="group px-8 py-4 rounded-2xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-lg transition-all duration-300 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Conversations
                  </button>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                  {['Secure', 'Fast', 'Reliable'].map((feature, index) => (
                    <div key={index} className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
                      <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600">
                        {['🔒', '⚡', '🛡️'][index]}
                      </div>
                      <p className="font-medium text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat


import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAllChats } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { requestHandler } from '../../utils'

import { FakeGroupAvatar } from '../../../public'
import ChatWindow from '../chats/ChatWindow'
import NewGroupChat from '../forms/NewGroup'
import AddMenu from '../chats/AddMenu'
import DotMenu from '../chats/DotMenu'

function Group() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // const [chats, setChats] = useState([]) // if need defenetly use it
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [groups, setGroups] = useState([]) // Changed to plural for multiple groups
  const [sendToGroup, setSendToGroup] = useState({})
  const [addMenu, setAddMenu] = useState(false) // State for AddMenu
  const [dotMenu, setDotMenu] = useState(false) // State for DotMenu

  /**
   * Fetch all chats and filter for groups only
   */
  const fetchGroups = useCallback(async () => {
    if (!user?._id) return

    setLoadingChats(true)

    await requestHandler(
      async () => getAllChats(),
      null,
      (res) => {
        const groupDATA = res?.data|| res.data?.data

        // Filter only group chats
        const groupChats = groupDATA.filter(chat => chat.isGroupChat === true)
        console.log(`groupChats : `,groupChats);

        groupChats.map(p => setSendToGroup(p))


        // Sort by latest message
        groupChats.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.createdAt || 0)
          const bTime = new Date(b.lastMessage?.createdAt || 0)
          return bTime - aTime
        })

        // setChats(allChats) // Keep all chats if needed elsewhere
        setGroups(groupChats) // Store filtered groups
        setLoadingChats(false)
      },
      (error) => {
        console.error('Failed to fetch groups:', error)
        setLoadingChats(false)
      }
    )
  }, [user?._id])

  /**
   * Initial load
   */
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  /**
   * Select group
   */
  const handleGroupSelect = (groupId) => {
    const group = groups.find(g => g._id === groupId)
    setSelectedChat(group)
  }

  /**
   * Refresh groups after sending message
   */
  const handleMessageSent = () => {
    fetchGroups()
  }

  /**
   * Filter groups based on search query
   */
  const filteredGroups = groups.filter(group => {
    if (!searchQuery.trim()) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      group.name?.toLowerCase().includes(searchLower) ||
      group.lastMessage?.content?.toLowerCase().includes(searchLower) ||
      group.participants?.some(p =>
        p.username?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower)
      )
    )
  })

  /**
   * New group route
   */
  if (location.pathname.includes('/group/new')) {
    return <NewGroupChat onGroupCreated={fetchGroups} />
  }

  /**
   * Auth guard
   */
  if (!user?._id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">
            Please login to access your groups
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Group List - Modified to only show groups */}
      <div className="w-96 border-r bg-white">
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
            <div className="flex items-center gap-2">
              {/* Add button */}
              <button
                onClick={() => setAddMenu(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Add menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Dot menu button */}
              <button
                onClick={() => setDotMenu(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-gray-500 mb-6">
            Your group conversations
          </p>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Group List Content */}
        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          {loadingChats ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try a different search' : 'Create your first group!'}
              </p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div
                key={group._id}
                onClick={() => handleGroupSelect(group._id)}
                className={`p-2 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedChat?._id === group._id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                }`}
              >
                <div className="flex items-center px-2 gap-3">
                  <img src={group.avatar || FakeGroupAvatar} alt="" className='object-cover h-12 w-12 rounded-full border-2 border-blue-600' />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {group.name || 'Unnamed Group'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {group.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {group.lastMessage && (
                    <div className="text-xs text-gray-400">
                      {new Date(group.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {group.participants?.length || 0} members
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Group Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUserId={user._id}
            otherUser={sendToGroup}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Group Chats
            </h2>
            <p className="text-gray-500 mb-6">
              Select a group or create a new one
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/synapse/new-group')}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700"
              >
                Create New Group
              </button>
              <button
                onClick={fetchGroups}
                className="border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
              >
                Refresh Groups
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render menus conditionally */}
      {addMenu && <AddMenu onClose={() => setAddMenu(false)} />}
      {dotMenu && <DotMenu onClose={() => setDotMenu(false)} />}
    </div>
  )
}

export default Group

import { useEffect, useState, useRef } from "react";
import {
  createUserChat,
  sendMessage as sendMessageApi,
  getAllMessages,
} from "../../api";
import { requestHandler } from "../../utils";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { ChatEventEnum } from "../../utils/constant";
import { FakeGroupAvatar } from "../../../public";

/* ---------------- Icons ---------------- */

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const OnlineIcon = () => (
  <span className="flex items-center text-green-600 font-medium">
    <span className="relative flex h-2 w-2 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    Online
  </span>
);

const OfflineIcon = () => (
  <span className="flex items-center text-gray-500">
    <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
    Offline
  </span>
);

const AttachmentIcon = () => (
  <svg className="w-6 h-6 text-gray-500 hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const EmojiIcon = () => (
  <svg className="w-6 h-6 text-gray-500 hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ---------------- Component ---------------- */

function ChatWindow({ otherUser, onMessageSent }) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ---------------- Init Chat + Messages ---------------- */

  useEffect(() => {
    if (!otherUser?._id) return;

    const init = async () => {
      setLoading(true);

      try {
        let chatId;

        if (otherUser.isGroupChat) {
          chatId = otherUser._id;
        } else {
          await requestHandler(
            () => createUserChat(otherUser._id),
            null,
            (res) => {
              chatId = res.data._id;
            }
          );
        }

        setChatData({ _id: chatId });

        await requestHandler(
          () => getAllMessages(chatId),
          null,
          (res) => setMessages(res.data),
          () => setMessages([])
        );
      } catch (err) {
        console.error("Chat init failed", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [otherUser]);

  /* ---------------- Socket Events ---------------- */

  useEffect(() => {
    if (!socket || !chatData?._id) return;

    socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, chatData._id);

    const onMessage = (message) => {
      if (message.chat === chatData._id) {
        setMessages((prev) => [...prev, message]);

        if (message.sender._id !== user._id) {
          onMessageSent?.(message);
        }
      }
    };

    const onRead = ({ chatId, userId }) => {
      if (chatId !== chatData._id) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.sender._id === userId ? { ...m, read: true } : m
        )
      );
    };

    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessage);
    socket.on(ChatEventEnum.MESSAGE_READ_EVENT, onRead);

    return () => {
      socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatData._id);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessage);
      socket.off(ChatEventEnum.MESSAGE_READ_EVENT, onRead);
    };
  }, [socket, chatData, user, onMessageSent]);

  /* ---------------- Auto Scroll ---------------- */

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (nearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* ---------------- Read Receipts ---------------- */

  useEffect(() => {
    if (!socket || !chatData?._id) return;

    const unread = messages.filter(
      (m) => m.sender._id !== user._id && !m.read
    );

    if (unread.length) {
      socket.emit(ChatEventEnum.MESSAGE_READ_EVENT, {
        chatId: chatData._id,
        messageIds: unread.map((m) => m._id),
      });
    }
  }, [messages, socket, chatData, user]);

  /* ---------------- Send Message ---------------- */

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatData?._id) return;

    const tempId = `temp-${Date.now()}`;
    const content = messageText;

    setMessageText("");

    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        content,
        chat: chatData._id,
        sender: user,
        createdAt: new Date().toISOString(),
        read: false,
        isOptimistic: true,
      },
    ]);

    await requestHandler(
      () => sendMessageApi(chatData._id, content),
      null,
      (res) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? res.data : m))
        );

        socket?.emit(ChatEventEnum.MESSAGE_SENT_EVENT, {
          chatId: chatData._id,
          message: res.data,
        });

        onMessageSent?.(res.data);
      },
      () => {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ---------------- Utils ---------------- */

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diffInDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  /* ---------------- Render ---------------- */

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading conversation...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={otherUser.avatar || FakeGroupAvatar}
              className="w-16 h-16 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
              alt={otherUser.name || otherUser.username}
            />
            {isConnected && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {otherUser.username?.toUpperCase() || otherUser.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {isConnected ? <OnlineIcon /> : <OfflineIcon />}
              <span className="text-sm text-white/80 ml-2">
                {otherUser.isGroupChat ? "Group chat" : "Direct message"}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-transparent to-gray-100/50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-600 max-w-md mb-6">
              Start the conversation by sending your first message to {otherUser?.username || otherUser?.name}
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-200 hover:scale-105">
                Say Hello 👋
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all duration-200">
                Send a Photo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Date Separator */}
            <div className="text-center my-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 text-sm font-semibold rounded-full shadow-sm">
                {getMessageDate(messages[0]?.createdAt)}
              </span>
            </div>

            {messages.map((m, index) => {
              const mine = m.sender._id === user._id;
              const showDate = index === 0 ||
                new Date(m.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={m._id}>
                  {/* Date Separator */}
                  {showDate && index > 0 && (
                    <div className="text-center my-6">
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 text-sm font-semibold rounded-full shadow-sm">
                        {getMessageDate(m.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 mb-3 ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Other User Avatar */}
                    {!mine && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {m.sender.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative max-w-[70%] ${
                        mine ? "order-1" : "order-2"
                      }`}
                    >
                      {/* Sender Name (Group Chat) */}
                      {otherUser.isGroupChat && !mine && (
                        <p className="text-xs font-semibold text-gray-600 mb-1 ml-1">
                          {m.sender.username}
                        </p>
                      )}

                      {/* Message Content */}
                      <div
                        className={`relative rounded-3xl px-5 py-3 shadow-lg ${
                          mine
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-lg"
                            : "bg-gradient-to-r from-white to-gray-50 text-gray-800 rounded-bl-lg border border-gray-200"
                        } ${m.isOptimistic ? "opacity-70" : ""}`}
                      >
                        <p className="break-words leading-relaxed">{m.content}</p>

                        {/* Message Meta */}
                        <div
                          className={`flex items-center justify-end gap-2 mt-2 text-xs ${
                            mine ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          <span>{formatTime(m.createdAt)}</span>
                          {mine && (
                            <span className="font-bold">
                              {m.read ? "✓✓" : m.isOptimistic ? "🕒" : "✓"}
                            </span>
                          )}
                        </div>

                        {/* Bubble Tail */}
                        {mine ? (
                          <div className="absolute -right-2 bottom-0 w-4 h-4 bg-blue-500 transform rotate-45 rounded-br"></div>
                        ) : (
                          <div className="absolute -left-2 bottom-0 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-200"></div>
                        )}
                      </div>

                      {/* Optimistic Indicator */}
                      {m.isOptimistic && (
                        <div className="text-xs text-gray-400 mt-1 text-center italic animate-pulse">
                          Sending...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-6 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Attachment Button */}
          <button className="p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 hover:scale-110 shadow-sm">
            <AttachmentIcon />
          </button>

          {/* Emoji Button */}
          <button className="p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 hover:scale-110 shadow-sm">
            <EmojiIcon />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherUser?.username || otherUser?.name}...`}
              className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-0 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white shadow-lg transition-all duration-300"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700 font-semibold">Enter</kbd> to send
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !chatData?._id}
            className={`p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              !messageText.trim() || !chatData?._id
                ? "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-2xl"
            }`}
          >
            <SendIcon />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mt-4">
          <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photo
          </button>
          <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video
          </button>
          <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;


import { Icon } from 'lucide-react';
import React from 'react'
import { FaGear } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';



const Sidebar = () => {
  const menuItems = [
    { id: 1, label: 'Profile', nav: "/profile"  },
    { id: 2, label: 'Archived', nav : "/archived"},
    { id: 3, label: 'Chat',  nav : "/chats"},
    { id: 4, label: 'Settings', nav: "/setting" },
  ]

  const navigate = useNavigate()

  return (
    <div className="bg-gray-800 h-full w-64 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Menu</h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
              onClick={()=>navigate(item.nav)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                <span className="text-lg"></span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Optional Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-gray-400 text-sm text-center">
          v1.0.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestHandler } from '../../utils';
import { getAllUser, createUserChat } from '../../api';

const NewChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users
  useEffect(() => {
    if (user?._id) {
      fetchUsers();
    }
  }, [user?._id]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    await requestHandler(
      () => getAllUser(),
      null,
      (res) => {
        const userList = res.data || [];
        setUsers(userList);
        setFilteredUsers(userList);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      }
    );
  };

  // Filter users
  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u._id !== user?._id &&
        (u.username || u.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users, user?._id]);

  const handleUserSelect = async (userToSelect) => {
    if (creatingChat || selectedUser?._id === userToSelect._id) return;

    setCreatingChat(true);
    setSelectedUser(userToSelect);

    await requestHandler(
      () => createUserChat(userToSelect._id),
      null,
      (res) => {
        navigate(`/synapse/chat`);
        setTimeout(() => {
          setCreatingChat(false);
          setSelectedUser(null);
        }, 500);
      },
      (err) => {
        setError(err.message || "Unable to create chat");
        setCreatingChat(false);
        setSelectedUser(null);
      }
    );
  };

  const handleBackClick = () => {
    navigate("/synapse/chat");
  };

  const getUserDisplayName = (u) => u?.username || u?.email || "Unknown User";

  const getInitials = (name = "U") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (!user?._id) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center flex flex-col gap-3 p-8">
          <p className="text-lg text-gray-600">Please login first</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl text-white transition-colors"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* User List */}
      <div className="w-96 border-r bg-white shadow-sm overflow-auto">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              New Chat
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              Loading users...
            </div>
          )}

          {error && (
            <div className="p-6 text-red-500 text-center bg-red-50 border-r border-red-200">
              {error}
              <button
                onClick={fetchUsers}
                className="ml-2 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p>No users found</p>
              <p className="text-sm mt-1 text-gray-400">Try a different search term</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserSelect(u)}
                className={`p-5 cursor-pointer hover:bg-gray-50 transition-all border-l-4 ${
                  selectedUser?._id === u._id
                    ? "bg-purple-50 border-purple-500 shadow-sm"
                    : "border-transparent hover:border-purple-100"
                } ${creatingChat ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border-2 border-gray-100 flex-shrink-0">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={getUserDisplayName(u)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(getUserDisplayName(u))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {getUserDisplayName(u)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {u.email ? u.email.split('@')[0] + '@...' : 'No email'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      u.online
                        ? 'text-green-600 font-medium'
                        : 'text-gray-400'
                    }`}>
                      {u.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        {!selectedUser ? (
          <div className="text-center text-gray-400 p-8">
            <div className="text-6xl mb-6 mx-auto w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center">
              💬
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">Select a user</h3>
            <p className="text-lg">Choose someone to start chatting with</p>
          </div>
        ) : (
          <div className="w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
              {getInitials(getUserDisplayName(selectedUser))}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getUserDisplayName(selectedUser)}
            </h2>
            {creatingChat ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">Creating your conversation...</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <p className="text-gray-500 mb-6">Your chat will be created automatically!</p>
                <button
                  onClick={() => navigate('/synapse/chat')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-4 px-6 rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Go to Chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChat;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestHandler } from '../../utils';

const DotMenu = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = user?.username || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@example.com';

  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  const handleLogout = async () => {
    await requestHandler(
      () => logout(),
      null,
      () => {
        navigate('/login');
      }
    );
    onClose();
  };

  const menuItems = [
    {
      id: 'settings',
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Settings",
      description: "Account & privacy",
      action: () => {
        navigate('/settings');
        onClose();
      }
    }
  ];

  return (
    <div className="absolute right-0 top-12 z-50 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl overflow-hidden min-w-[300px] max-w-sm animate-in fade-in duration-200 slide-in-from-top-2">
      {/* Profile Section */}
      <div
        onClick={handleProfileClick}
        className="p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 cursor-pointer border-b border-gray-100 group"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user.avatar} className='object-cover h-15 w-15 rounded-full' alt="" />
            {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-sm"></div> */}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-gray-900 truncate">{userName}</h3>
              <span className="text-gray-400 group-hover:text-gray-600 transition-all ml-2">→</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="w-full flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-200 group rounded-2xl m-1"
          >
            <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-200 border border-emerald-100 group-hover:border-emerald-200">
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900 group-hover:text-gray-950 transition-colors">
                {item.label}
              </div>
              <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div
        onClick={handleLogout}
        className="p-4 border-t border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 cursor-pointer group mt-1"
      >
        <div className="flex items-center gap-4 p-2 rounded-2xl group-hover:shadow-sm transition-all">
          <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-200 border border-red-100 group-hover:border-red-200">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900 group-hover:text-red-900 transition-colors">
              Logout
            </div>
            <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
              Sign out of Synapse
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotMenu;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbles, IoPeople } from "react-icons/io5";
import { MdGroups, MdOutlineExplore } from "react-icons/md";
import { FaRobot } from "react-icons/fa6";

const AddMenu = ({ onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <IoChatbubbles className="text-blue-500" size={20} />, label: "New Chat", description: "Start a private conversation", path: "chat/new" },
    { icon: <MdGroups className="text-green-500" size={20} />, label: "New Group", description: "Create group with friends", path: "new-group" },
    { icon: <IoPeople className="text-purple-500" size={20} />, label: "New Community", description: "Build a community space", path: "new-community" },
    { icon: <FaRobot className="text-amber-500" size={20} />, label: "AI Assistant", description: "Chat with smart assistant", path: "ai-assistant-chat" },
    { icon: <MdOutlineExplore className="text-rose-500" size={20} />, label: "Explore", description: "Discover new features", path: "explore" },
  ];

  const handleMenuItemClick = (path) => {
    navigate(`/synapse/${path}`);
    onClose();
  };

  return (
    <div className="animate-in fade-in duration-200 slide-in-from-top-2 absolute right-0 top-12 z-50 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl overflow-hidden min-w-[320px] max-w-sm">
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900">Create New</h4>
      </div>
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group rounded-2xl m-1"
            onClick={() => handleMenuItemClick(item.path)}
          >
            <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-200 border border-gray-100 group-hover:scale-105">
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 group-hover:text-gray-950 transition-colors">
                {item.label}
              </div>
              <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddMenu;

import { Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { createUserChat, getAllUser, sendMessage } from "../../api";
import { requestHandler } from "../../utils";
import { useAuth } from "../../context/AuthContext";

function NewChat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const isAuthenticated = Boolean(user?._id);
  console.log(`authenticated : ${isAuthenticated}`);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    await requestHandler(
      () => getAllUser(),
      null,
      (res) => {
        setUsers(res.data || []);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      }
    );
  };

  /* ================= FILTER USERS ================= */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u._id !== user?._id &&
        (u.username || u.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, user?._id]);



  /* ================= HELPERS ================= */
  const getUserDisplayName = (u) =>
    u?.username || u?.email || "Unknown User";

  const getInitials = (name = "U") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  /* ================= CHAT CREATION ================= */
  const handleUserSelect = async (userToSelect) => {
    if (creatingChat || selectedUser?._id === userToSelect._id) return;

    setCreatingChat(true);
    setSelectedUser(userToSelect);

    console.log(`userSelected_id ${userToSelect._id}`);


    await requestHandler(
      async() => createUserChat(userToSelect._id),
      null,
      async(res) => {
        const chat = res.data;
        console.log(chat);

        console.log(`chatId : ${chat._id}`);

        // navigate(`/synapse/chat/${chat._id}`, {
        //   state: { chat }
        // });
        setCreatingChat(false);
      },
      (err) => {
        alert(err.message || "Unable to create chat");
        setCreatingChat(false);
        setSelectedUser(null);
      }
    );
  };


        //   chat && chat._id  (
        //   await requestHandler(
        //     () => sendMessage(chat._id, ),
        //     null,
        //     (res) => {
        //       const {message} = res.data
        //       console.log(`message ${message}`);
        //     }
        //   )
        // )




  /* ================= UI HANDLERS ================= */
  const handleBackClick = () => navigate("/synapse/chat");

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput("");
  };

  /* ================= RENDER STATES ================= */
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center flex flex-col gap-3">
          <p className="text-lg text-gray-600">Please login first</p>
          <button
            className="bg-blue-500 px-4 py-2 rounded-xl text-white"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ================= USER LIST ================= */}
      <div className="w-96 border-r bg-white overflow-auto">
        <div className="p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBackClick}>
              <FaArrowLeft />
            </button>
            <h3 className="text-xl font-semibold">New Chat</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-10 py-2 bg-gray-100 rounded-lg"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="p-4 text-center">Loading users...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        {!loading &&
          !error &&
          filteredUsers.map((u) => (
            <div
              key={u._id}
              onClick={() => handleUserSelect(u)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === u._id
                  ? "bg-purple-50 border-l-4 border-purple-500"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border overflow-hidden">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={getUserDisplayName(u)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                      {getInitials(getUserDisplayName(u))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{getUserDisplayName(u)}</p>
                  <p className="text-xs text-gray-500">
                    {u.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* ================= PLACEHOLDER ================= */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {!selectedUser ? (
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">💬</div>
            <p>Select a user to start chatting</p>
          </div>
        ) : (
          <div className="w-full max-w-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {getUserDisplayName(selectedUser)}
            </h2>

            {creatingChat ? (
              <p className="text-gray-600">Creating chat...</p>
            ) : (
              <div className="mt-6 flex gap-2">
                <input
                  className="flex-1 bg-gray-100 px-4 py-3 rounded-xl"
                  placeholder="Type message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 text-white p-3 rounded-xl"
                  disabled={!messageInput.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewChat;



import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";

import { getAllUser, createGroup } from "../../api"; // Make sure createGroup is imported
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils";

function NewGroup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedUserIds, setSelectedUserIds] = useState([]);


  const [groupName, setGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupCreationError, setGroupCreationError] = useState("");

  const isAuthenticated = Boolean(user?._id);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    await requestHandler(
      () => getAllUser(),
      null,
      (res) => {
        setUsers(res.data || []);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      }
    );
  };

  /* ================= FILTER USERS ================= */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u._id !== user?._id &&
        (u.username || u.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, user?._id]);

  /* ================= HELPERS ================= */
  const getUserDisplayName = (u) =>
    u?.username || u?.email || "Unknown User";

  const getInitials = (name = "U") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  /* ================= SELECT USER ================= */
  const handleSelectUser = (selectedUser) => {
    setSelectedUserIds((prev) =>
      prev.includes(selectedUser._id)
        ? prev.filter((id) => id !== selectedUser._id)
        : [...prev, selectedUser._id]
    );
  };

  /* ================= GET SELECTED USERS DETAILS ================= */
  const getSelectedUsers = useMemo(() => {
    return users.filter(u => selectedUserIds.includes(u._id));
  }, [users, selectedUserIds]);

  /* ================= GROUP CREATION ================= */
  const handleCreateGroup = async () => {
    // Validation
    if (selectedUserIds.length === 0) {
      setGroupCreationError("Please select at least one user");
      return;
    }

    if (!groupName.trim()) {
      setGroupCreationError("Please enter a group name");
      return;
    }

    if (groupName.trim().length < 3) {
      setGroupCreationError("Group name must be at least 3 characters");
      return;
    }

    if (selectedUserIds.length < 2) {
      setGroupCreationError("Group must have at least 2 members (including you)");
      return;
    }

    try {
      setIsCreatingGroup(true);
      setGroupCreationError("");
      setError(null); // Clear previous errors

      // Prepare group data
      const groupData = {
        name: groupName.trim(),
        participants: [...selectedUserIds]
      };

      console.log("Creating group with data:", groupData);

      // Call the API using requestHandler
      await requestHandler(
        async () => {
          // Make sure createGroup returns a Promise
          return await createGroup(groupData);
        },
        null, // No loading callback needed since we have setIsCreatingGroup
        (res) => {
          console.log("Group created successfully:", res.data);

          // Show success message
          alert(`Group "${groupName}" created successfully!`);

          // Redirect to chat page
          navigate("/synapse/chat");
        },
        (err) => {
          console.error("Error creating group:", err);
          setGroupCreationError(err.message || "Failed to create group. Please try again.");
        }
      );

    } catch (err) {
      console.error("Unexpected error:", err);
      setGroupCreationError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  /* ================= UI HANDLERS ================= */
  const handleBackClick = () => navigate("/synapse/chat");

  /* ================= AUTH GUARD ================= */
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center flex flex-col gap-3">
          <p className="text-lg text-gray-600">Please login first</p>
          <button
            className="bg-blue-500 px-4 py-2 rounded-xl text-white"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex h-full">
      {/* ================= USER LIST ================= */}
      <div className="w-96 border-r bg-white overflow-auto">
        <div className="p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBackClick}>
              <FaArrowLeft />
            </button>
            <h3 className="text-xl font-semibold">New Group</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-10 py-2 bg-gray-100 rounded-lg"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="p-4 text-center">Loading users...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        {!loading &&
          !error &&
          filteredUsers.map((u) => {
            const isSelected = selectedUserIds.includes(u._id);

            return (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                  isSelected ? "bg-green-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border overflow-hidden">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={getUserDisplayName(u)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        {getInitials(getUserDisplayName(u))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {getUserDisplayName(u)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {u.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <IoMdCheckmarkCircle className="text-green-500 text-[20px]" />
                )}
              </div>
            );
          })}
      </div>

      {/* ================= GROUP FORM PANEL ================= */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Group</h2>
            <p className="text-gray-500 mt-2">Add group name and selected members</p>
          </div>

          {/* Group Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setGroupCreationError(""); // Clear error on type
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter group name..."
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Minimum 3 characters</span>
              <span>{groupName.length}/50</span>
            </div>
          </div>

          {/* Selected Users Summary */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Selected Members ({selectedUserIds.length})
              </label>
              {selectedUserIds.length > 0 && (
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="text-sm text-red-500 hover:text-red-700 hover:underline"
                  type="button"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedUserIds.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-400">No users selected yet</p>
                <p className="text-sm text-gray-400 mt-1">Select users from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                {getSelectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                        {selectedUser.avatar ? (
                          <img
                            src={selectedUser.avatar}
                            alt={getUserDisplayName(selectedUser)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-purple-600 font-semibold">
                            {getInitials(getUserDisplayName(selectedUser))}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{getUserDisplayName(selectedUser)}</p>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectUser(selectedUser)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                      type="button"
                      aria-label={`Remove ${getUserDisplayName(selectedUser)}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Size Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Total Group Size</p>
                <p className="text-sm text-gray-500">Including you</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedUserIds.length + 1}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {selectedUserIds.length < 2 ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <span>ⓘ</span>
                  <span>Need at least 2 more members to create a group</span>
                </span>
              ) : (
                <span className="text-green-600 flex items-center gap-1">
                  <span>✓</span>
                  <span>Ready to create group</span>
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {groupCreationError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{groupCreationError}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBackClick}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={isCreatingGroup}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={
                isCreatingGroup ||
                selectedUserIds.length < 2 ||
                !groupName.trim() ||
                groupName.trim().length < 3
              }
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                isCreatingGroup || selectedUserIds.length < 2 || !groupName.trim() || groupName.trim().length < 3
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }`}
              type="button"
            >
              {isCreatingGroup ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Group"
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Choose a meaningful name and add at least 2 members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewGroup;

import React, { useState } from 'react'
import Sidebar from '../common/Sidebar'

function Dashboard() {


  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />

    </div>
  )
}

export default Dashboard


import { Archive, MessageSquare, Phone, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo, FakeUserAvatar } from '../../public/index';
import { useAuth } from '../context/AuthContext';

const Synapse = () => {
  const [activeSection, setActiveSection] = useState('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth()

  const menuItems = [
    { id: 'chat', icon: <MessageSquare size={22} />, label: 'Chats', path: 'chat' },
    { id: 'group', icon: <Users size={22} />, label: 'Groups', path: 'group' },
    { id: 'archive', icon: <Archive size={22} />, label: 'Archived', path: 'archive' },
    { id: 'setting', icon: <Settings size={22} />, label: 'Settings', path: 'setting' },
  ];

  const handleMenuClick = (item) => {
    setActiveSection(item.id);
    navigate(item.path);
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always Collapsed */}
    <div className="sidebar w-26 bg-white border-r border-gray-200 flex flex-col">
        <div className="sidebar-content p-6 flex flex-col justify-between h-full">
          {/* Logo and Header */}
          <header className="sidebar-header flex flex-col items-center mb-8">
            <div className="logo-container flex flex-col items-center gap-2">
              <img
                src={Logo}
                alt="Snypase Logo"
                className="logo w-10 h-10"
              />
              <span className="brand-name text-zinc-500 font-bold text-[15px] tracking-tight">
                Snypase
              </span>
            </div>
          </header>

          {/* Main Navigation */}
          <nav className="sidebar-nav flex-1 flex flex-col items-center">
            <ul className="nav-list space-y-2 w-full">
              {menuItems.map((item) => (
                <li key={item.id} className="nav-item w-full">
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`nav-button w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    aria-label={item.label || item.name}
                  >
                    <span className={`icon ${isActive(item.path) ? 'text-purple-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Section */}
          <footer className="sidebar-footer mt-auto pt-6 rounded-full border-t border-gray-100">
            <div className="flex items-center justify-center flex-col">
              <img
                src={user && user._id ? user.avatar : FakeUserAvatar }
                alt="Snypase Logo"
                className="footer-logo w-14 h-14 object-cover rounded-full border-2 border-blue-600"
              />
              <h2 className="text-[15px] text-gray-500 font-medium">{ user && user._id ? user.username : `username`}</h2>
            </div>
          </footer>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Synapse;


all files using coloring add coloring and styling
didn't touch the functionality of all over or dont't touch the api
