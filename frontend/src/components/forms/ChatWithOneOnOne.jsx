import React, { useEffect, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { requestHandler } from "../../utils";
import { sendMessage, getAllMessages } from "../../api";

function ChatWithOneOnOne({ chatId, currentUserId, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH MESSAGES ---------------- */
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setLoading(true);
      await requestHandler(
        async () => getAllMessages(chatId),
        null,
        (res) => {
          setMessages(res.data.data || []);
          setLoading(false);
        },
        () => setLoading(false)
      );
    };

    fetchMessages();
  }, [chatId]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const tempId = Date.now();
    const text = messageInput.trim();
    setMessageInput("");

    const optimisticMessage = {
      _id: tempId,
      content: text,
      sender: currentUserId,
      createdAt: new Date().toISOString(),
      isSending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const formData = new FormData();
    formData.append("content", text);

    await requestHandler(
      async () => sendMessage(chatId, formData),
      null,
      (res) => {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? res.data.data : msg))
        );
      },
      () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...msg, failed: true } : msg
          )
        );
      }
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b font-semibold flex items-center justify-between">
        <div className="flex items-center gap-3">
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser?.username || otherUser?.email}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {(otherUser?.username || otherUser?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div>{otherUser?.username || otherUser?.email}</div>
            {otherUser?.online && (
              <div className="text-xs text-green-600">Online</div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.sender === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs ${
                  msg.sender === currentUserId
                    ? "bg-purple-500 text-white rounded-br-none"
                    : "bg-gray-200 rounded-bl-none"
                } ${msg.failed ? "bg-red-300" : ""}`}
              >
                {msg.content}
                {msg.isSending && (
                  <span className="block text-xs opacity-70">Sending...</span>
                )}
                {msg.failed && (
                  <span className="block text-xs text-red-700">Failed</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="mx-auto mb-2" size={48} />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation by sending a message!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatWithOneOnOne;
