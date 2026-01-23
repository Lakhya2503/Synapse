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
import { Users, Search, Plus, MoreVertical, RefreshCw, MessageSquare, Clock, Shield, Star, Hash, Globe, Lock } from 'lucide-react'

function Group() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedChat, setSelectedChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [groups, setGroups] = useState([])
  const [addMenu, setAddMenu] = useState(false)
  const [dotMenu, setDotMenu] = useState(false)
  const [hoveredGroup, setHoveredGroup] = useState(null)

  const fetchGroups = useCallback(async () => {
    if (!user?._id) return

    setLoadingChats(true)
    await requestHandler(
      async () => getAllChats(),
      null,
      (res) => {
        const groupDATA = res?.data || res.data?.data || []
        const groupChats = groupDATA.filter(chat => chat.isGroupChat === true)

        groupChats.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0)
          const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0)
          return bTime - aTime
        })

        setGroups(groupChats)
        setLoadingChats(false)
      },
      (error) => {
        console.error('Failed to fetch groups:', error)
        setLoadingChats(false)
      }
    )
  }, [user?._id])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleGroupSelect = (groupId) => {
    const group = groups.find(g => g._id === groupId)
    setSelectedChat(group)
  }

  const handleMessageSent = () => {
    fetchGroups()
  }

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

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (location.pathname.includes('/group/new')) {
    return <NewGroupChat onGroupCreated={fetchGroups} />
  }

  if (!user?._id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/30 text-center max-w-lg">
          {/* Decorative background */}
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
              Please login to access all group features and conversations
            </p>
            <button
              onClick={() => navigate('/login')}
              className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 duration-300 w-full group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Go to Login
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-indigo-50/10 to-purple-50/10 overflow-hidden">
      {/* Group List Sidebar */}
      <div className="w-[420px] border-r border-gray-200/50 bg-gradient-to-b from-white via-white to-blue-50/30 flex flex-col shadow-xl">
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-gray-200/50 bg-gradient-to-r from-white to-indigo-50/30">
          <div className="flex justify-between items-center mb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Group Chats
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full">
                      {groups.length} groups
                    </span>

                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
               <button
              onClick={fetchGroups}
              className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:shadow-lg transition-all group"
              title="Refresh groups"
            >
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            </div>

            {addMenu && <AddMenu onClose={() => setAddMenu(false)} />}
            {dotMenu && <DotMenu onClose={() => setDotMenu(false)} />}
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search groups by name or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-r from-white to-gray-50/50 border-2 border-gray-300/50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Group List Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingChats ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 animate-pulse border border-gray-200/30">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-8">
                <div className="w-36 h-36 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-28 h-28 bg-gradient-to-r from-blue-200/50 to-purple-200/50 rounded-full flex items-center justify-center">
                    <div className="text-6xl">👥</div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-3">
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-sm text-lg">
                {searchQuery
                  ? 'Try searching with a different keyword'
                  : 'Create your first group chat to start collaborating with others'
                }
              </p>
              <button
                onClick={() => navigate('/synapse/new-group')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 duration-300 group"
              >
                <span className="flex items-center gap-3">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Create New Group
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map(group => {
                const isSelected = selectedChat?._id === group._id;
                const isHovered = hoveredGroup === group._id;
                const participantsCount = group.participants?.length || 0;
                const lastMessageTime = getRelativeTime(group.lastMessage?.createdAt || group.updatedAt);

                return (
                  <div
                    key={group._id}
                    onClick={() => handleGroupSelect(group._id)}
                    onMouseEnter={() => setHoveredGroup(group._id)}
                    onMouseLeave={() => setHoveredGroup(null)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-l-4 border-l-gradient-to-r border-l-blue-500 shadow-lg transform -translate-y-0.5'
                        : 'hover:bg-gradient-to-r hover:from-gray-50/60 hover:to-blue-50/40 hover:shadow-md hover:transform hover:-translate-y-0.5 border border-gray-200/30'
                    } ${isHovered && !isSelected ? 'shadow-md' : ''}`}
                  >
                    {/* Selection glow effect */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 rounded-2xl blur-sm"></div>
                    )}

                    <div className="relative flex items-center gap-4">
                      {/* Group Avatar */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${
                          isSelected
                            ? 'border-gradient-to-r from-blue-400 to-purple-400'
                            : 'border-gray-300/50'
                        } shadow-lg`}>
                          <img
                            src={group.avatar || FakeGroupAvatar}
                            alt={group.name || 'Group'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                        }`}>
                          {Math.min(participantsCount, 9)}
                          {participantsCount > 9 && '+'}
                        </div>
                      </div>

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 truncate text-lg">
                              {group.name || 'Unnamed Group'}
                            </h3>
                            {group.isPrivate ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Globe className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {group.unreadCount > 0 && (
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                                {group.unreadCount > 99 ? '99+' : group.unreadCount}
                              </span>
                            )}
                            <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full whitespace-nowrap">
                              {lastMessageTime}
                            </span>
                          </div>
                        </div>

                        {/* Last Message Preview */}
                        <p className="text-sm text-gray-600 truncate mb-3 flex items-center gap-2">
                          {group.lastMessage?.content ? (
                            <>
                              <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{group.lastMessage.content}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">No messages yet</span>
                          )}
                        </p>

                        {/* Group Details */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{participantsCount} members</span>
                            </div>
                            {group.lastMessage?.sender && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="truncate max-w-[120px]">
                                  Last by {group.lastMessage.sender.username}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Group Type Indicator */}
                          {group.admin?._id === user?._id && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-xs font-bold">
                              <Shield className="w-3 h-3" />
                              Admin
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover effect line */}
                    {isHovered && !isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-full"></div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <div className="h-full">
            <ChatWindow
              chat={selectedChat}
              currentUserId={user._id}
              otherUser={selectedChat}
              onMessageSent={handleMessageSent}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/30 via-blue-100/20 to-cyan-100/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-20 animate-float">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="absolute bottom-20 right-20 animate-float" style={{animationDelay: '0.5s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="absolute top-40 right-40 animate-float" style={{animationDelay: '1.5s'}}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Hash className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="relative z-10 max-w-4xl text-center">
              {/* Main Hero */}
              <div className="relative inline-block mb-12">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 flex items-center justify-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse-slow">
                      <div className="w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                        <div className="text-8xl text-white drop-shadow-lg">👥</div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-2xl -rotate-12">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>


              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={() => navigate('/synapse/new-group')}
                  className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    Create New Group
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={fetchGroups}
                  className="relative bg-gradient-to-br from-white to-gray-50 text-gray-800 px-10 py-5 rounded-xl font-bold border-2 border-gray-300/50 hover:border-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:text-blue-700 transition-all duration-300 group"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    Refresh Groups
                  </span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Add custom animations to tailwind config
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
`

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default Group
