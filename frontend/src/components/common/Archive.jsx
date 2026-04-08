import { Archive as ArchiveIcon, ArchiveRestore, Clock, MessageSquare, Search, User, Lock, Unlock, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FakeGroupAvatar } from '../../../public'
import { getAllChats, unArchivedOneOnOneChat, unBlockOneOnOneChat } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { requestHandler } from '../../utils'
import ChatWindow from '../chats/ChatWindow'

// Separate components for better organization
const LoginRequiredView = ({ navigate }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
    <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/30 text-center max-w-lg">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Authentication Required
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Please login to access archived conversations
        </p>
        <button
          onClick={() => navigate('/login')}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 duration-300 w-full group"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  </div>
)

const EmptyArchiveView = ({ searchQuery, onRefresh }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
    <div className="relative mb-8">
      <div className="w-36 h-36 bg-gradient-to-r from-amber-100/50 to-orange-100/50 rounded-full flex items-center justify-center shadow-lg">
        <div className="w-28 h-28 bg-gradient-to-r from-amber-200/50 to-orange-200/50 rounded-full flex items-center justify-center">
          <div className="text-6xl">📁</div>
        </div>
      </div>
      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
        <ArchiveIcon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-amber-900 bg-clip-text text-transparent mb-3">
      {searchQuery ? 'No archived chats found' : 'No archived chats'}
    </h3>
    <p className="text-gray-600 mb-8 max-w-sm text-lg">
      {searchQuery
        ? 'Try searching with a different keyword'
        : 'Archive chats to hide them from your main chat list'
      }
    </p>
    {!searchQuery && (
      <button
        onClick={onRefresh}
        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-200 transition-all flex items-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Refresh
      </button>
    )}
  </div>
)

const LoadingSkeleton = () => (
  <div className="p-8">
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 animate-pulse border border-gray-200/30">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const BlockedOverlay = ({ isBlockedType, otherUser, onUnarchive, onUnblock, chatId }) => {
  const title = isBlockedType === 'you-blocked'
    ? `You Have Blocked ${otherUser?.username || otherUser?.name || 'this user'}`
    : `You Are Blocked by ${otherUser?.username || otherUser?.name || 'this user'}`

  const description = isBlockedType === 'you-blocked'
    ? 'You cannot send messages until you unblock this user'
    : 'You cannot send messages in this chat as you have been blocked'

  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="w-40 h-40 bg-gradient-to-r from-red-100/50 to-rose-100/50 rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-32 h-32 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full flex items-center justify-center border-4 border-red-300/30">
            <div className="w-24 h-24 bg-gradient-to-r from-red-300/50 to-rose-300/50 rounded-full flex items-center justify-center">
              <Lock className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl">
          <ArchiveIcon className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-rose-700 bg-clip-text text-transparent mb-4 text-center">
        {title}
      </h2>

      <p className="text-gray-600 text-lg mb-8 max-w-md text-center">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onUnarchive(chatId)}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-200 transition-all"
        >
          <span className="flex items-center gap-2">
            <ArchiveRestore className="w-5 h-5" />
            Restore Chat
          </span>
        </button>

        {isBlockedType === 'you-blocked' && (
          <button
            onClick={() => onUnblock(chatId)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <Unlock className="w-5 h-5" />
              Unblock User
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

const EnhancedChatWindow = ({ chat, otherUser, currentUser, onUnarchive, onUnblock, onMessageSent }) => {
  const isBlocked = chat?.isBlock
  const isBlockedType = chat?.blockedBy?._id === currentUser?._id ? 'you-blocked' : 'you-are-blocked'

  return (
    <div className="h-full relative">
      {isBlocked && (
        <BlockedOverlay
          isBlockedType={isBlockedType}
          otherUser={otherUser}
          onUnarchive={onUnarchive}
          onUnblock={onUnblock}
          chatId={chat._id}
        />
      )}

      <ChatWindow
        filterChat={chat}
        currentUserId={currentUser._id}
        otherUser={otherUser}
        onMessageSent={onMessageSent}
        isBlocked={isBlocked}
        chat={chat} // Fixed: changed from 'archived' to 'chat'
      />
    </div>
  )
}

const ChatListItem = ({
  chat,
  currentUser,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onUnarchive,
  getRelativeTime,
  isUnarchiving
}) => {
  const otherUser = chat.participants?.find(p => p._id !== currentUser?._id)
  const lastMessageTime = getRelativeTime(chat.lastMessage?.createdAt || chat.updatedAt)
  const isBlocked = chat.isBlock
  const blockedType = chat.blockedBy?._id === currentUser._id ? 'you-blocked' : 'you-are-blocked'

  return (
    <div
      onClick={() => !isUnarchiving && onSelect(chat._id)}
      onMouseEnter={() => onHover(chat._id)}
      onMouseLeave={() => onHover(null)}
      className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
        isUnarchiving ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isSelected
          ? isBlocked
            ? 'bg-gradient-to-r from-red-50/80 to-rose-50/80 border-l-4 border-l-red-500 shadow-lg transform -translate-y-0.5'
            : 'bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-l-4 border-l-amber-500 shadow-lg transform -translate-y-0.5'
          : isBlocked
            ? 'hover:bg-gradient-to-r hover:from-red-50/60 hover:to-rose-50/40 hover:shadow-md hover:transform hover:-translate-y-0.5 border border-red-200/30'
            : 'hover:bg-gradient-to-r hover:from-gray-50/60 hover:to-amber-50/40 hover:shadow-md hover:transform hover:-translate-y-0.5 border border-gray-200/30'
      } ${isHovered && !isSelected ? 'shadow-md' : ''}`}
    >
      {isSelected && (
        <div className={`absolute inset-0 rounded-2xl blur-sm ${
          isBlocked
            ? 'bg-gradient-to-r from-red-100/20 to-rose-100/20'
            : 'bg-gradient-to-r from-amber-100/20 to-orange-100/20'
        }`}></div>
      )}

      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
            isSelected
              ? isBlocked
                ? 'border-red-400'
                : 'border-amber-400'
              : 'border-gray-300/50'
          } shadow-lg relative`}>
            <img
              src={otherUser?.avatar || FakeGroupAvatar}
              alt={otherUser?.username || 'User'}
              className={`w-full h-full object-cover ${isBlocked ? 'opacity-70' : ''}`}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = FakeGroupAvatar
              }}
            />
            {isBlocked && (
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${
            isBlocked
              ? 'bg-gradient-to-r from-red-500 to-rose-500'
              : 'bg-gradient-to-r from-amber-500 to-orange-500'
          }`}>
            {isBlocked ? (
              <Lock className="w-4 h-4 text-white" />
            ) : (
              <ArchiveIcon className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold truncate text-lg ${
                isBlocked ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {otherUser?.username || 'Unknown User'}
              </h3>
              {isBlocked && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  blockedType === 'you-blocked'
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700'
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                }`}>
                  {blockedType === 'you-blocked' ? 'You Blocked' : 'Blocked You'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {chat.unreadCount > 0 && (
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow ${
                  isBlocked
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }`}>
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
              <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full whitespace-nowrap">
                {lastMessageTime}
              </span>
            </div>
          </div>

          <p className={`text-sm truncate mb-3 flex items-center gap-2 ${
            isBlocked ? 'text-gray-400 italic' : 'text-gray-600'
          }`}>
            {chat.lastMessage?.content ? (
              <>
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                  isBlocked ? 'text-gray-400' : 'text-amber-500'
                }`} />
                <span className="truncate">{chat.lastMessage.content}</span>
              </>
            ) : (
              <span className="text-gray-400 italic">No messages yet</span>
            )}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Archived</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                !isUnarchiving && onUnarchive(chat._id)
              }}
              disabled={isUnarchiving}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm group ${
                isUnarchiving
                  ? 'opacity-50 cursor-not-allowed'
                  : isBlocked
                    ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 hover:text-red-800'
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:text-green-800'
              }`}
              title="Restore from archive"
            >
              {isUnarchiving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArchiveRestore className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              )}
              {isUnarchiving ? 'Restoring...' : 'Restore'}
            </button>
          </div>
        </div>
      </div>

      {isHovered && !isSelected && (
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
          isBlocked
            ? 'bg-gradient-to-r from-red-400/50 to-rose-400/50'
            : 'bg-gradient-to-r from-amber-400/50 to-orange-400/50'
        }`}></div>
      )}
    </div>
  )
}

const WelcomeView = ({ onRefresh }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/30 via-orange-100/20 to-red-100/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-amber-100/30 via-yellow-100/20 to-orange-100/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

    <div className="absolute top-20 left-20 animate-float">
      <div className="w-16 h-16 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
        <ArchiveIcon className="w-8 h-8 text-amber-500" />
      </div>
    </div>
    <div className="absolute bottom-20 right-20 animate-float" style={{animationDelay: '0.5s'}}>
      <div className="w-16 h-16 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
        <User className="w-8 h-8 text-orange-500" />
      </div>
    </div>

    <div className="relative z-10 max-w-4xl text-center">
      <div className="relative inline-block mb-12">
        <div className="relative">
          <div className="w-64 h-64 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 flex items-center justify-center">
            <div className="w-48 h-48 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse-slow">
              <div className="w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <div className="text-8xl text-white drop-shadow-lg">📁</div>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
            <ArchiveIcon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-2xl -rotate-12">
            <ArchiveRestore className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-900 via-orange-700 to-red-700 bg-clip-text text-transparent mb-6">
        Archived Chats
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        Your private archive. Archived chats are hidden from your main chat list but remain accessible here.
        <br className="hidden sm:block" />
        Restore any conversation whenever you're ready to continue.
      </p>

      <div className="flex gap-6 justify-center items-center">
        <button
          onClick={onRefresh}
          className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white px-10 py-5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Archive
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  </div>
)

// Main Component
function Archive() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [archivedChats, setArchivedChats] = useState([])
  const [hoveredChat, setHoveredChat] = useState(null)
  const [unarchivingId, setUnarchivingId] = useState(null)
  const [unblockingId, setUnblockingId] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

  const searchInputRef = useRef(null)
  const filteredChatsRef = useRef([])
  const selectedChatRef = useRef(null)
  const hoveredChatRef = useRef(null)
  const loadingChatsRef = useRef(true)
  const searchQueryRef = useRef('')

  // Update refs when state changes
  useEffect(() => {
    selectedChatRef.current = selectedChat
    hoveredChatRef.current = hoveredChat
    loadingChatsRef.current = loadingChats
    searchQueryRef.current = searchQuery
  }, [selectedChat, hoveredChat, loadingChats, searchQuery])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchArchivedChats = useCallback(async () => {
    if (!user?._id) return

    setLoadingChats(true)
    await requestHandler(
      async () => getAllChats(),
      null,
      (res) => {
        const allChats = res?.data || res?.data?.data || []

        const archived = allChats.filter(chat =>
          chat.isArchived === true &&
          (!chat.isGroupChat || chat.isGroupChat === false)
        )

        // Sort by last message time or update time
        archived.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0)
          const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0)
          return bTime - aTime
        })

        setArchivedChats(archived)
        setLoadingChats(false)
        setIsRefreshing(false)
      },
      (error) => {
        console.error('Failed to fetch archived chats:', error)
        setLoadingChats(false)
        setIsRefreshing(false)
      }
    )
  }, [user?._id])

  useEffect(() => {
    fetchArchivedChats()
  }, [fetchArchivedChats])

  const filteredChats = useMemo(() => {
    if (!debouncedSearch.trim()) {
      filteredChatsRef.current = archivedChats
      return archivedChats
    }

    const searchLower = debouncedSearch.toLowerCase()
    const filtered = archivedChats.filter(chat => {
      const otherUser = chat.participants?.find(p => p._id !== user?._id)
      return (
        otherUser?.username?.toLowerCase().includes(searchLower) ||
        otherUser?.email?.toLowerCase().includes(searchLower) ||
        chat.lastMessage?.content?.toLowerCase().includes(searchLower)
      )
    })

    filteredChatsRef.current = filtered
    return filtered
  }, [archivedChats, debouncedSearch, user?._id])

  // Keyboard navigation - using refs to avoid dependency issues
  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentFilteredChats = filteredChatsRef.current
      const currentLoadingChats = loadingChatsRef.current
      const currentSelectedChat = selectedChatRef.current
      const currentHoveredChat = hoveredChatRef.current
      const currentSearchQuery = searchQueryRef.current

      if (!currentFilteredChats.length || currentLoadingChats) return

      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      // Clear search on Escape
      if (e.key === 'Escape' && currentSearchQuery) {
        setSearchQuery('')
        return
      }

      // Chat navigation with arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const currentIndex = currentFilteredChats.findIndex(c => c._id === currentSelectedChat?._id)
        let newIndex = 0

        if (e.key === 'ArrowDown') {
          newIndex = currentIndex < currentFilteredChats.length - 1 ? currentIndex + 1 : 0
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : currentFilteredChats.length - 1
        }

        setSelectedChat(currentFilteredChats[newIndex])
      }

      // Select chat on Enter
      if (e.key === 'Enter' && currentHoveredChat) {
        const chat = currentFilteredChats.find(c => c._id === currentHoveredChat)
        if (chat) {
          setSelectedChat(chat)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // Empty dependency array since we're using refs

  const handleChatSelect = useCallback((chatId) => {
    if (unarchivingId || unblockingId) return
    const chat = archivedChats.find(c => c._id === chatId)
    setSelectedChat(chat)
  }, [archivedChats, unarchivingId, unblockingId])

  const handleUnarchive = useCallback(async (chatId) => {
    if (unarchivingId || unblockingId) return

    setUnarchivingId(chatId)
    await requestHandler(
      () => unArchivedOneOnOneChat(chatId),
      null,
      () => {
        fetchArchivedChats()
        if (selectedChat?._id === chatId) {
          setSelectedChat(null)
        }
        setUnarchivingId(null)
      },
      (err) => {
        console.error('Failed to unarchive chat:', err)
        alert(err.message || 'Failed to unarchive chat')
        setUnarchivingId(null)
      }
    )
  }, [fetchArchivedChats, selectedChat, unarchivingId, unblockingId])

  const handleUnblock = useCallback(async (chatId) => {
    if (unarchivingId || unblockingId) return

    const chat = archivedChats.find(c => c._id === chatId)
    if (!chat) return

    const otherUser = chat.participants?.find(p => p._id !== user?._id)
    if (!otherUser) return

    setUnblockingId(chatId)
    await requestHandler(
      () => unBlockOneOnOneChat(otherUser._id),
      null,
      () => {
        fetchArchivedChats()
        // Refresh the selected chat if it's the one being unblocked
        if (selectedChat?._id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, isBlock: false, blockedBy: null } : null)
        }
        setUnblockingId(null)
      },
      (err) => {
        console.error('Failed to unblock user:', err)
        alert(err.message || 'Failed to unblock user')
        setUnblockingId(null)
      }
    )
  }, [archivedChats, fetchArchivedChats, selectedChat, unarchivingId, unblockingId, user?._id])

  const getRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return ""
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [])

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientY)
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const touchEnd = e.changedTouches[0].clientY
    if (touchStart - touchEnd > 100 && window.innerWidth < 768 && !loadingChats) {
      // Pull down to refresh on mobile
      setIsRefreshing(true)
      fetchArchivedChats()
    }
  }, [touchStart, loadingChats, fetchArchivedChats])

  if (!user?._id) {
    return <LoginRequiredView navigate={navigate} />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/10 to-purple-50/10 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-[420px] border-r border-gray-200/50 bg-gradient-to-b from-white via-white to-blue-50/30 flex flex-col shadow-xl">
        <div className="p-6 pb-4 border-b border-gray-200/50 bg-gradient-to-r from-white to-indigo-50/30">
          <div className="flex justify-between items-center mb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <ArchiveIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-amber-900 bg-clip-text text-transparent">
                    Archived Chats
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full">
                      {archivedChats.length} archived
                    </span>
                    {isRefreshing && (
                      <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Refreshing...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsRefreshing(true)
                fetchArchivedChats()
              }}
              disabled={isRefreshing}
              className="p-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-amber-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
              title="Refresh archive"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search archived chats... "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-r from-white to-gray-50/50 border-2 border-gray-300/50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all focus:border-amber-300/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {loadingChats ? (
            <LoadingSkeleton />
          ) : filteredChats.length === 0 ? (
            <EmptyArchiveView
              searchQuery={debouncedSearch}
              onRefresh={() => {
                setIsRefreshing(true)
                fetchArchivedChats()
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredChats.map(chat => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  currentUser={user}
                  isSelected={selectedChat?._id === chat._id}
                  isHovered={hoveredChat === chat._id}
                  onSelect={handleChatSelect}
                  onHover={setHoveredChat}
                  onUnarchive={handleUnarchive}
                  getRelativeTime={getRelativeTime}
                  isUnarchiving={unarchivingId === chat._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <EnhancedChatWindow
            chat={selectedChat}
            otherUser={selectedChat.participants?.find(p => p._id !== user._id)}
            currentUser={user}
            onUnarchive={handleUnarchive}
            onUnblock={handleUnblock}
            onMessageSent={() => {
              setIsRefreshing(true)
              fetchArchivedChats()
            }}
          />
        ) : (
          <WelcomeView onRefresh={() => {
            setIsRefreshing(true)
            fetchArchivedChats()
          }} />
        )}
      </div>
    </div>
  )
}

export default Archive
