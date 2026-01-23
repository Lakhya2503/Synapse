import React, { useRef, useState, useCallback, memo, useEffect } from "react";
import { FaReply, FaCopy, FaEdit, FaTrash, FaCheck, FaCheckDouble } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { FakeGroupAvatar } from "../../../public";
import { formatTime } from '../ui/IconsAndUtility';

// Message Bubble Component
const MessageBubble = memo(({
  message,
  isCurrentUser,
  showSenderName,
  isGroupChat,
  onMessageAction,
  isSelected,
  onSelect,
  showTimestamp = false
}) => {
  const bubbleRef = useRef();
  const [showActions, setShowActions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const actionMenuRef = useRef(null);

  // Handle click outside to close action menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(true);
    onMessageAction?.({
      type: 'context-menu',
      message,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.(message._id);
    }
  };

  const handleAction = useCallback((actionType) => {
    onMessageAction?.({ type: actionType, message });
    setShowActions(false);
  }, [message, onMessageAction]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleActionButtonClick = (e, actionType) => {
    e.stopPropagation();
    handleAction(actionType);
  };

  const toggleActions = (e) => {
    e.stopPropagation();
    setShowActions(prev => !prev);
  };

  // Get read status icon
  const getReadStatus = () => {
    if (message.optimistic) {
      return <span className="text-xs opacity-70">🕒</span>;
    }

    if (message.read) {
      return <FaCheckDouble className="text-blue-500" size={12} />;
    }

    return <FaCheck className="text-gray-400" size={12} />;
  };

  const bubbleColors = isCurrentUser
    ? {
        gradient: "from-indigo-500 to-purple-600",
        bgColor: "bg-gradient-to-br from-indigo-500 to-purple-600",
        textColor: "text-white",
        borderColor: "border-indigo-100",
        shadow: "shadow-lg shadow-indigo-200/30"
      }
    : {
        gradient: "from-gray-50 to-white",
        bgColor: "bg-gradient-to-br from-gray-50 to-white",
        textColor: "text-gray-800",
        borderColor: "border-gray-100",
        shadow: "shadow-lg shadow-gray-200/20"
      };

  // Format timestamp
  const formattedTime = formatTime(message.createdAt);

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4 group relative`}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-purple-100/30 rounded-2xl border-2 border-indigo-300 pointer-events-none z-0"></div>
      )}

      {!isCurrentUser && (
        <div className="relative flex-shrink-0 mr-3 self-end">
          <img
            src={message.sender.avatar || FakeGroupAvatar}
            alt={message.sender.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
          />
        </div>
      )}

      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[75%]`}>
        {/* Sender name for group chats */}
        {isGroupChat && !isCurrentUser && showSenderName && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className="text-sm font-semibold text-gray-700">
              {message.sender.username}
            </span>
            <span className="text-xs text-gray-500">{formattedTime}</span>
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="mb-2 ml-1 pl-3 border-l-2 border-purple-400 bg-purple-50/50 rounded-r-md py-1.5 max-w-full">
            <div className="flex items-center gap-1 mb-0.5">
              <FaReply size={10} className="text-purple-500" />
              <span className="text-xs font-medium text-purple-700 truncate">
                {message.replyTo.sender.username}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate">{message.replyTo.content}</p>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Message bubble */}
          <div
            ref={bubbleRef}
            className={`relative rounded-2xl px-4 py-3 ${bubbleColors.bgColor} ${bubbleColors.textColor} ${bubbleColors.shadow} border ${bubbleColors.borderColor} ${
              isCurrentUser ? "rounded-br-md" : "rounded-bl-md"
            } ${message.optimistic ? "opacity-70" : ""} transition-all duration-200`}
          >
            {/* Message content */}
            <p className="break-words leading-relaxed text-sm">
              {message.content}
              {message.edited && (
                <span className="ml-1 text-xs opacity-70 italic">(edited)</span>
              )}
            </p>

            {/* Message footer */}
            <div className={`flex items-center justify-end gap-2 mt-2 text-xs ${
              isCurrentUser ? "text-indigo-100" : "text-gray-500"
            }`}>
              <span className={`font-medium ${isCurrentUser ? "text-white/90" : "text-gray-600"}`}>
                {!isGroupChat || isCurrentUser ? formattedTime : ''}
              </span>
              {isCurrentUser && !message.optimistic && (
                <div className="flex items-center">
                  {getReadStatus()}
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="relative">
            <button
              onClick={toggleActions}
              className={`p-1.5 rounded-full transition-all ${
                (isHovering || showActions)
                  ? "opacity-100 bg-gray-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <FiMoreVertical size={16} className="text-gray-500" />
            </button>

            {/* Actions menu */}
            {showActions && (
              <div
                ref={actionMenuRef}
                className={`absolute top-full mt-1 ${
                  isCurrentUser ? "left-0" : "right-0"
                } bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 min-w-[180px]`}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => handleActionButtonClick(e, 'reply')}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 rounded-md transition-colors group"
                  >
                    <FaReply size={14} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Reply</span>
                  </button>

                  <button
                    onClick={(e) => handleActionButtonClick(e, 'copy')}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-md transition-colors group"
                  >
                    <FaCopy size={14} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Copy</span>
                  </button>

                  {isCurrentUser && (
                    <>
                      <button
                        onClick={(e) => handleActionButtonClick(e, 'edit')}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-amber-50 rounded-md transition-colors group"
                      >
                        <FaEdit size={14} className="text-amber-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-700">Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleActionButtonClick(e, 'delete')}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-md transition-colors group"
                      >
                        <FaTrash size={14} className="text-red-600 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-700">Delete</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowActions(false)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors mt-1 border-t border-gray-100 pt-2"
                >
                  <IoClose size={14} />
                  <span>Close</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optimistic indicator */}
        {message.optimistic && (
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-medium text-gray-500">
              Sending...
            </p>
          </div>
        )}
      </div>

      {isCurrentUser && (
        <div className="relative flex-shrink-0 ml-3 self-end">
          <img
            src={message.sender.avatar || FakeGroupAvatar}
            alt={message.sender.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
          />
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
