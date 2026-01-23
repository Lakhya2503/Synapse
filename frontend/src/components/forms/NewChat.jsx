import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestHandler } from '../../utils';
import { getAllUser, createUserChat } from '../../api';

const NewChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchUsers();
    }
  }, [user?._id]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    await requestHandler(
      () => getAllUser(),
      null,
      (res) => {
        const userList = res.data || [];
        setUsers(userList);
        setFilteredUsers(userList);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u._id !== user?._id &&
        (u.username || u.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users, user?._id]);

  const handleUserSelect = async (userToSelect) => {
    if (creatingChat || selectedUser?._id === userToSelect._id) return;

    setCreatingChat(true);
    setSelectedUser(userToSelect);

    await requestHandler(
      () => createUserChat(userToSelect._id),
      null,
      (res) => {
        navigate(`/synapse/chat`);
        setTimeout(() => {
          setCreatingChat(false);
          setSelectedUser(null);
        }, 500);
      },
      (err) => {
        setError(err.message || "Unable to create chat");
        setCreatingChat(false);
        setSelectedUser(null);
      }
    );
  };

  const handleBackClick = () => {
    navigate("/synapse/chat");
  };

  const getUserDisplayName = (u) => u?.username || u?.email || "Unknown User";

  const getInitials = (name = "U") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (!user?._id) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F9FAFB]">
        <div className="text-center flex flex-col gap-3 p-8 bg-white rounded-xl border border-[#E5E7EB]">
          <p className="text-lg text-[#6B7280]">Please login first</p>
          <button
            className="bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-2.5 rounded-lg text-white transition-colors"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#F9FAFB]">
      {/* User List */}
      <div className="w-96 border-r border-[#E5E7EB] bg-white overflow-auto">
        <div className="p-6 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#6B7280]"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h3 className="text-2xl font-bold text-[#111827]">
              New Chat
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#9CA3AF]" size={18} />
            <input
              className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#111827] placeholder-[#9CA3AF]"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {loading && (
            <div className="p-8 text-center text-[#6B7280]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto mb-2"></div>
              Loading users...
            </div>
          )}

          {error && (
            <div className="p-6 text-[#EF4444] text-center bg-[#FEF2F2] border border-[#FECACA]">
              {error}
              <button
                onClick={fetchUsers}
                className="ml-2 underline hover:text-[#DC2626]"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="p-12 text-center text-[#6B7280]">
              <div className="text-4xl mb-4">👥</div>
              <p>No users found</p>
              <p className="text-sm mt-1 text-[#9CA3AF]">Try a different search term</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserSelect(u)}
                className={`p-5 cursor-pointer hover:bg-[#F3F4F6] transition-colors border-l-4 ${
                  selectedUser?._id === u._id
                    ? "bg-[#DBEAFE] border-[#2563EB]"
                    : "border-transparent"
                } ${creatingChat ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={getUserDisplayName(u)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(getUserDisplayName(u))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827] truncate">
                      {getUserDisplayName(u)}
                    </p>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                      {u.email ? u.email.split('@')[0] + '@...' : 'No email'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      u.online
                        ? 'text-[#22C55E] font-medium'
                        : 'text-[#9CA3AF]'
                    }`}>
                      {u.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex-1 flex items-center justify-center bg-white">
        {!selectedUser ? (
          <div className="text-center text-[#9CA3AF] p-8">
            <div className="text-6xl mb-6 mx-auto w-24 h-24 bg-[#F3F4F6] rounded-xl flex items-center justify-center">
              💬
            </div>
            <h3 className="text-2xl font-semibold text-[#6B7280] mb-2">Select a user</h3>
            <p className="text-lg">Choose someone to start chatting with</p>
          </div>
        ) : (
          <div className="w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#2563EB] rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(getUserDisplayName(selectedUser))}
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">
              {getUserDisplayName(selectedUser)}
            </h2>
            {creatingChat ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
                <p className="text-[#6B7280]">Creating your conversation...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
                <p className="text-[#6B7280] mb-6">Your chat will be created automatically!</p>
                <button
                  onClick={() => navigate('/synapse/chat')}
                  className="w-full bg-[#2563EB] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#1D4ED8] transition-colors"
                >
                  Go to Chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChat;
