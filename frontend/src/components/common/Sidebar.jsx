import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    {
      id: 1,
      label: 'Profile',
      nav: "/profile",
      icon: "👤",
      color: "from-purple-500 to-pink-500",
      hoverColor: "from-purple-600 to-pink-600"
    },
    {
      id: 2,
      label: 'Archived',
      nav: "/archived",
      icon: "📁",
      color: "from-amber-500 to-orange-500",
      hoverColor: "from-amber-600 to-orange-600"
    },
    {
      id: 3,
      label: 'Chat',
      nav: "/chats",
      icon: "💬",
      color: "from-blue-500 to-cyan-500",
      hoverColor: "from-blue-600 to-cyan-600"
    },
    {
      id: 4,
      label: 'Settings',
      nav: "/setting",
      icon: "⚙️",
      color: "from-emerald-500 to-teal-500",
      hoverColor: "from-emerald-600 to-teal-600"
    },
  ]

  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const isActive = (path) => location.pathname === path

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 h-full w-80 flex flex-col border-r border-gray-700 shadow-2xl shadow-gray-900/30">
      {/* Sidebar Header with glowing effect */}
      <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-x-16 -translate-y-16 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full translate-x-16 translate-y-16 blur-xl"></div>

        <div className="relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
            Navigation
          </h2>
          <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Manage your account & settings
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-6 space-y-3">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const active = isActive(item.nav)
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.nav)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 transform hover:translate-x-2 relative overflow-hidden group
                    ${active
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg ${item.color.replace('from-', 'shadow-').replace(' to-', '-500/30')}`
                      : 'text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm'
                    }
                    ${hoveredItem === item.id && !active ? 'shadow-xl shadow-gray-900/50' : ''}`}
                >
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${active ? 'opacity-20' : ''}`}></div>

                  <span className={`text-2xl transition-all duration-300 relative z-10
                    ${active ? 'scale-125 rotate-12' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                    {item.icon}
                  </span>
                  <span className={`font-semibold relative z-10 transition-all
                    ${active ? 'text-white tracking-wide' : 'group-hover:tracking-wide'}`}>
                    {item.label}
                  </span>

                  {active && (
                    <span className="ml-auto relative z-10">
                      <span className="absolute animate-ping w-3 h-3 bg-white rounded-full opacity-75"></span>
                      <span className="relative w-2 h-2 bg-white rounded-full"></span>
                    </span>
                  )}

                  {/* Arrow indicator for hover */}
                  {!active && hoveredItem === item.id && (
                    <span className="ml-auto text-gray-400 group-hover:text-white transition-colors">
                      →
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Divider with gradient */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gray-900 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </span>
          </div>
        </div>

        {/* Quick Actions with glowing button */}
        <div className="relative group">
          <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-xl relative z-10 group-hover:scale-110 transition-transform">+</span>
            <span className="relative z-10">New Conversation</span>
            <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              ✨
            </span>
          </button>
        </div>
      </nav>

      {/* Footer with user info */}
      <div className="p-6 border-t border-gray-700 bg-gradient-to-t from-gray-900 to-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              U
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
              User Account
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
              Premium Member
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20">
            Online
          </span>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold text-green-400">v1.0.0</span>
            </div>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">Latest Release</span>
          </div>
          <button className="text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1 group">
            <span>Help & Support</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Ambient lights */}
      <div className="absolute top-1/4 -left-4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-4 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
    </div>
  )
}

export default Sidebar
