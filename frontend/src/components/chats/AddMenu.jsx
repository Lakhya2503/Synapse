import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbles, IoPeople } from "react-icons/io5";
import { MdGroups, MdOutlineExplore } from "react-icons/md";
import { FaRobot } from "react-icons/fa6";

const AddMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const menuItems = [
    { icon: <IoChatbubbles className="text-[#2563EB]" size={20} />, label: "New Chat", description: "Start a private conversation", path: "chat/new" },
    { icon: <MdGroups className="text-[#059669]" size={20} />, label: "New Group", description: "Create group with friends", path: "new-group" },
    { icon: <IoPeople className="text-[#7C3AED]" size={20} />, label: "New Community", description: "Build a community space", path: "new-community" },
    { icon: <FaRobot className="text-[#EA580C]" size={20} />, label: "AI Assistant", description: "Chat with smart assistant", path: "ai-assistant-chat" },
    { icon: <MdOutlineExplore className="text-[#DC2626]" size={20} />, label: "Explore", description: "Discover new features", path: "explore" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = (path) => {
    navigate(`/synapse/${path}`);
    onClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 top-20 z-50 bg-white border border-[#E5E7EB] shadow-lg rounded-xl overflow-hidden min-w-[320px] max-w-sm transform transition-all duration-300 ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-4 p-4 hover:bg-[#F3F4F6] transition-all duration-200 text-left hover:translate-x-1"
            onClick={() => handleMenuItemClick(item.path)}
          >
            <div className="p-2.5 bg-[#F3F4F6] rounded-lg transition-transform duration-200 hover:scale-110">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#111827]">
                {item.label}
              </div>
              <div className="text-sm text-[#6B7280]">
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
