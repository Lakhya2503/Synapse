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
    navigate('/user/profile');
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
        navigate('/synapse/setting');
        onClose();
      }
    }
  ];

  return (
    <div className="absolute right-0 top-20 z-50 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl overflow-hidden min-w-[300px] max-w-sm animate-in fade-in duration-200 slide-in-from-top-2">
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
