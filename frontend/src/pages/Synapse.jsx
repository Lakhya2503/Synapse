import { Archive, MessageSquare, Phone, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo, FakeUserAvatar } from '../../public/index';
import { useAuth } from '../context/AuthContext';

const Synapse = () => {
  const [activeSection, setActiveSection] = useState('chat');
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
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <div className="sidebar w-26 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="sidebar-content p-6 flex flex-col justify-between h-full">
          {/* Logo and Header */}
          <header className="sidebar-header flex flex-col items-center mb-8">
            <div className="logo-container flex flex-col items-center gap-2">
              <img
                src={Logo}
                alt="Synapse Logo"
                className="logo w-10 h-10"
              />
              <span className="brand-name text-[#6B7280] font-bold text-[15px]">
                Synapse
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
                    className={`nav-button w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#DBEAFE] text-[#2563EB]'
                        : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                    }`}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    aria-label={item.label || item.name}
                  >
                    <span className="icon">
                      {item.icon}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Section */}
          <footer className="sidebar-footer mt-auto pt-6 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-center flex-col">
              <img
                src={user && user._id ? user.avatar : FakeUserAvatar }
                alt="User Avatar"
                className="footer-logo w-14 h-14 object-cover rounded-full border-2 border-[#2563EB]"
              />
              <h2 className="text-[15px] text-[#6B7280] font-medium mt-2">{ user && user._id ? user.username : `username`}</h2>
            </div>
          </footer>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Synapse;
