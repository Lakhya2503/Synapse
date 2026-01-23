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

  // Fetch users
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

  // Filter users
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
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center flex flex-col gap-3 p-8">
          <p className="text-lg text-gray-600">Please login first</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl text-white transition-colors"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* User List */}
      <div className="w-96 border-r bg-white shadow-sm overflow-auto">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              New Chat
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              Loading users...
            </div>
          )}

          {error && (
            <div className="p-6 text-red-500 text-center bg-red-50 border-r border-red-200">
              {error}
              <button
                onClick={fetchUsers}
                className="ml-2 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p>No users found</p>
              <p className="text-sm mt-1 text-gray-400">Try a different search term</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserSelect(u)}
                className={`p-5 cursor-pointer hover:bg-gray-50 transition-all border-l-4 ${
                  selectedUser?._id === u._id
                    ? "bg-purple-50 border-purple-500 shadow-sm"
                    : "border-transparent hover:border-purple-100"
                } ${creatingChat ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border-2 border-gray-100 flex-shrink-0">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={getUserDisplayName(u)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(getUserDisplayName(u))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {getUserDisplayName(u)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {u.email ? u.email.split('@')[0] + '@...' : 'No email'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      u.online
                        ? 'text-green-600 font-medium'
                        : 'text-gray-400'
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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        {!selectedUser ? (
          <div className="text-center text-gray-400 p-8">
            <div className="text-6xl mb-6 mx-auto w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center">
              💬
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">Select a user</h3>
            <p className="text-lg">Choose someone to start chatting with</p>
          </div>
        ) : (
          <div className="w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
              {getInitials(getUserDisplayName(selectedUser))}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getUserDisplayName(selectedUser)}
            </h2>
            {creatingChat ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">Creating your conversation...</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <p className="text-gray-500 mb-6">Your chat will be created automatically!</p>
                <button
                  onClick={() => navigate('/synapse/chat')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-4 px-6 rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
