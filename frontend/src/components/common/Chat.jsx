import React, { useEffect, useState, useCallback } from 'react'
import { requestHandler } from '../../utils'
import { getAllChats } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ChatList from '../chats/ChatList'
import ChatWindow from '../chats/ChatWindow'
import NewChat from '../forms/NewChat'

function Chat() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)

  const fetchChats = useCallback(async () => {
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
}, [user?._id])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const handleChatSelect = (chatId) => {
    const chat = chats.find(c => c._id === chatId)
    setSelectedChat(chat)
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
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
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



      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUserId={user._id}
            otherUser={getOtherUser()}
            onMessageSent={handleMessageSent}
            chats={chats}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-32 h-32 mb-8 bg-[#E5E7EB] rounded-full flex items-center justify-center text-6xl">
              💬
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome to Synapse</h2>
            <p className="text-[#6B7280] mb-8">
              Select a chat or start a new conversation
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleNewChatClick}
                className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold"
              >
                Start New Chat
              </button>
              <button
                onClick={fetchChats}
                className="border px-6 py-3 rounded-xl font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
