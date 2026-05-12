import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllChats } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { requestHandler } from '../../utils'
import { ChatEventEnum } from '../../utils/constant'
import ChatList from '../chats/ChatList'
import ChatWindow from '../chats/ChatWindow'
import NewChat from '../forms/NewChat'

function Chat() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [showMobileChatList, setShowMobileChatList] = useState(true)

  // Fetch chats on mount
  const fetchChats = async () => {
    if (!user?._id) return

    setLoadingChats(true)

    await requestHandler(
      async () => getAllChats(),
      null,
      (res) => {
        const allChats = res?.data?.data || res?.data || []

        const directChats = allChats.filter(
          chat => chat.isGroupChat === false
        )

        const chatMap = new Map()

        directChats.forEach(chat => {
          const otherUser = chat.participants?.find(
            p => p._id !== user._id
          )

          if (!otherUser) return

          const existing = chatMap.get(otherUser._id)

          const currentTime = new Date(
            chat.lastMessage?.createdAt || chat.updatedAt || 0
          )

          const existingTime = existing
            ? new Date(
                existing.lastMessage?.createdAt || existing.updatedAt || 0
              )
            : null

          if (!existing || currentTime > existingTime) {
            chatMap.set(otherUser._id, chat)
          }
        })

        const uniqueChats = Array.from(chatMap.values()).sort((a, b) => {
          const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0)
          const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0)
          return bTime - aTime
        })

        setChats(uniqueChats)
        setLoadingChats(false)
      },
      (error) => {
        console.error('Failed to fetch chats:', error)
        setLoadingChats(false)
      }
    )
  }

  useEffect(() => {
    fetchChats()
  }, [user?._id])

  // Real-time chat list updates
  useEffect(() => {
    if (!socket || !user?._id) return

    const handleNewChat = (newChat) => {
      console.log('📬 New chat received:', newChat)
      setChats(prev => {
        // Check if chat already exists
        const exists = prev.find(c => c._id === newChat._id)
        if (exists) {
          // Update existing chat
          return prev.map(c => c._id === newChat._id ? newChat : c)
        }
        // Add new chat
        return [newChat, ...prev]
      })
    }

    const handleChatUpdate = (updatedChat) => {
      console.log('🔄 Chat updated:', updatedChat)
      setChats(prev =>
        prev.map(chat => chat._id === updatedChat._id ? updatedChat : chat)
      )
    }

    const handleMessageReceived = (message) => {
      console.log('💬 Message received in chat list:', message)
      // Update the chat's last message and move it to top
      setChats(prev => {
        const chatIndex = prev.findIndex(c => c._id === message.chat)
        if (chatIndex === -1) return prev

        const updatedChats = [...prev]
        const chat = { ...updatedChats[chatIndex] }
        chat.lastMessage = message
        chat.updatedAt = message.createdAt

        // Move to top
        updatedChats.splice(chatIndex, 1)
        updatedChats.unshift(chat)

        return updatedChats
      })
    }

    const handleUserStatusChanged = ({ userId, status }) => {
      console.log('👤 User status changed:', userId, status)
      // Update user online status in chats
      setChats(prev =>
        prev.map(chat => {
          const updatedParticipants = chat.participants?.map(p =>
            p._id === userId ? { ...p, online: status === 'online' } : p
          )
          return { ...chat, participants: updatedParticipants }
        })
      )
    }

    // Register socket listeners
    socket.on(ChatEventEnum.NEW_CHAT_EVENT, handleNewChat)
    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleMessageReceived)
    socket.on('user_status_changed', handleUserStatusChanged)
    socket.on(ChatEventEnum.UPDATE_GROUP_NAME_EVENT, handleChatUpdate)
    socket.on(ChatEventEnum.BLOCKCHAT, handleChatUpdate)
    socket.on(ChatEventEnum.UNBLOCKCHAT, handleChatUpdate)
    socket.on(ChatEventEnum.ARCHEVIDCHAT, handleChatUpdate)
    socket.on(ChatEventEnum.UNARCHIVEDCHAT, handleChatUpdate)

    return () => {
      socket.off(ChatEventEnum.NEW_CHAT_EVENT, handleNewChat)
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleMessageReceived)
      socket.off('user_status_changed', handleUserStatusChanged)
      socket.off(ChatEventEnum.UPDATE_GROUP_NAME_EVENT, handleChatUpdate)
      socket.off(ChatEventEnum.BLOCKCHAT, handleChatUpdate)
      socket.off(ChatEventEnum.UNBLOCKCHAT, handleChatUpdate)
      socket.off(ChatEventEnum.ARCHEVIDCHAT, handleChatUpdate)
      socket.off(ChatEventEnum.UNARCHIVEDCHAT, handleChatUpdate)
    }
  }, [socket, user?._id])

  const handleChatSelect = (chatId) => {
    const chat = chats.find(c => c._id === chatId)
    setSelectedChat(chat)
    setShowMobileChatList(false) // Switch to chat view on mobile
  }

  const handleBackToChatList = () => {
    setShowMobileChatList(true)
    setSelectedChat(null)
  }

  const handleMessageSent = () => {
    fetchChats()
  }

  const handleNewChatClick = () => {
    navigate('/synapse/chat/new')
  }

  const getOtherUser = () => {
    if (!selectedChat || !user?._id) return null
    return selectedChat.participants?.find(p => p._id !== user._id)
  }

  if (window.location.pathname.includes('/chat/new')) {
    return <NewChat />
  }

  if (!user?._id) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-2xl mb-4">
            🔒
          </div>
          <h2 className="text-2xl font-bold">Login Required</h2>
          <p className="text-[#6B7280]">Please login to access your messages</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-3 px-6 rounded-2xl font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] relative">
      {/* Chat List - Responsive */}
      <div className={`
        ${showMobileChatList ? 'flex' : 'hidden'}
        md:flex
        w-full md:w-auto md:min-w-[420px]
        absolute md:relative
        inset-0 md:inset-auto
        z-10 md:z-auto
        bg-white
      `}>
        <ChatList
          chats={chats}
          loadingChats={loadingChats}
          activeChat={selectedChat?._id}
          searchQuery={searchQuery}
          currentUserId={user._id}
          onChatSelect={handleChatSelect}
          onSearchChange={setSearchQuery}
          onNewChatClick={handleNewChatClick}
        />
      </div>

      {/* Main Chat Area - Responsive */}
      <div className={`
        ${!showMobileChatList ? 'flex' : 'hidden'}
        md:flex
        flex-1
        absolute md:relative
        inset-0 md:inset-auto
        z-20 md:z-auto
        bg-white
      `}>
        <div className="flex-1 flex flex-col relative">
          {/* Mobile Back Button */}
          <button
            onClick={handleBackToChatList}
            className="md:hidden absolute top-4 left-4 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label="Back to chat list"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              currentUserId={user._id}
              otherUser={getOtherUser()}
              onMessageSent={handleMessageSent}
              chats={chats}
              onBack={handleBackToChatList}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-32 h-32 mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                <MessageSquare className="w-16 h-16 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to Synapse</h2>
              <p className="text-[#6B7280] mb-8 text-center max-w-md">
                Select a chat or start a new conversation
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleNewChatClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Start New Chat
                </button>
                <button
                  onClick={fetchChats}
                  className="border-2 border-gray-300 px-6 py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
