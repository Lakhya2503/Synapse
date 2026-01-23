import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { getAllUser, createGroup } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils";

function NewGroup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupCreationError, setGroupCreationError] = useState("");

  const isAuthenticated = Boolean(user?._id);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    await requestHandler(
      () => getAllUser(),
      null,
      (res) => {
        setUsers(res.data || []);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      }
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u._id !== user?._id &&
        (u.username || u.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, user?._id]);

  const getUserDisplayName = (u) =>
    u?.username || u?.email || "Unknown User";

  const getInitials = (name = "U") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleSelectUser = (selectedUser) => {
    setSelectedUserIds((prev) =>
      prev.includes(selectedUser._id)
        ? prev.filter((id) => id !== selectedUser._id)
        : [...prev, selectedUser._id]
    );
  };

  const getSelectedUsers = useMemo(() => {
    return users.filter(u => selectedUserIds.includes(u._id));
  }, [users, selectedUserIds]);

  const handleCreateGroup = async () => {
    if (selectedUserIds.length === 0) {
      setGroupCreationError("Please select at least one user");
      return;
    }

    if (!groupName.trim()) {
      setGroupCreationError("Please enter a group name");
      return;
    }

    if (groupName.trim().length < 3) {
      setGroupCreationError("Group name must be at least 3 characters");
      return;
    }

    if (selectedUserIds.length < 2) {
      setGroupCreationError("Group must have at least 2 members (including you)");
      return;
    }

    try {
      setIsCreatingGroup(true);
      setGroupCreationError("");
      setError(null);

      const groupData = {
        name: groupName.trim(),
        participants: [...selectedUserIds]
      };

      await requestHandler(
        async () => await createGroup(groupData),
        null,
        (res) => {
          alert(`Group "${groupName}" created successfully!`);
          navigate("/synapse/chat");
        },
        (err) => {
          setGroupCreationError(err.message || "Failed to create group. Please try again.");
        }
      );

    } catch (err) {
      setGroupCreationError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleBackClick = () => navigate("/synapse/chat");

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F9FAFB]">
        <div className="text-center flex flex-col gap-3">
          <p className="text-lg text-[#6B7280]">Please login first</p>
          <button
            className="bg-[#2563EB] px-4 py-2 rounded-lg text-white hover:bg-[#1D4ED8] transition-colors"
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
        <div className="p-4 border-b border-[#E5E7EB] bg-white sticky top-0">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBackClick} className="text-[#6B7280] hover:text-[#111827]">
              <FaArrowLeft />
            </button>
            <h3 className="text-xl font-semibold text-[#111827]">New Group</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#9CA3AF]" size={18} />
            <input
              className="w-full pl-10 py-3 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#111827] placeholder-[#9CA3AF]"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="p-4 text-center text-[#6B7280]">Loading users...</p>}
        {error && <p className="p-4 text-[#EF4444]">{error}</p>}

        {!loading &&
          !error &&
          filteredUsers.map((u) => {
            const isSelected = selectedUserIds.includes(u._id);

            return (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`p-4 cursor-pointer hover:bg-[#F3F4F6] flex items-center justify-between ${
                  isSelected ? "bg-[#DBEAFE]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-[#E5E7EB] overflow-hidden">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={getUserDisplayName(u)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2563EB] flex items-center justify-center text-white font-semibold">
                        {getInitials(getUserDisplayName(u))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-[#111827]">
                      {getUserDisplayName(u)}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {u.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <IoMdCheckmarkCircle className="text-[#16A34A] text-[20px]" />
                )}
              </div>
            );
          })}
      </div>

      {/* Group Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6">
        <div className="w-full max-w-md bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 text-[#6B7280]">👥</div>
            <h2 className="text-2xl font-bold text-[#111827]">Create New Group</h2>
            <p className="text-[#6B7280] mt-2">Add group name and selected members</p>
          </div>

          {/* Group Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setGroupCreationError("");
              }}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#111827] placeholder-[#9CA3AF]"
              placeholder="Enter group name..."
              maxLength={50}
            />
            <div className="text-xs text-[#6B7280] mt-1 flex justify-between">
              <span>Minimum 3 characters</span>
              <span>{groupName.length}/50</span>
            </div>
          </div>

          {/* Selected Users Summary */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-[#111827]">
                Selected Members ({selectedUserIds.length})
              </label>
              {selectedUserIds.length > 0 && (
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="text-sm text-[#EF4444] hover:text-[#DC2626]"
                  type="button"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedUserIds.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-[#E5E7EB] rounded-lg">
                <p className="text-[#9CA3AF]">No users selected yet</p>
                <p className="text-sm text-[#9CA3AF] mt-1">Select users from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                {getSelectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser._id}
                    className="flex items-center justify-between p-3 bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
                        {selectedUser.avatar ? (
                          <img
                            src={selectedUser.avatar}
                            alt={getUserDisplayName(selectedUser)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#2563EB] font-semibold">
                            {getInitials(getUserDisplayName(selectedUser))}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#111827]">{getUserDisplayName(selectedUser)}</p>
                        <p className="text-xs text-[#6B7280]">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectUser(selectedUser)}
                      className="text-[#6B7280] hover:text-[#EF4444] p-1 rounded-full hover:bg-[#FEF2F2] transition-colors"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Size Info */}
          <div className="mb-6 p-4 bg-[#DBEAFE] rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-[#111827]">Total Group Size</p>
                <p className="text-sm text-[#6B7280]">Including you</p>
              </div>
              <div className="text-2xl font-bold text-[#2563EB]">
                {selectedUserIds.length + 1}
              </div>
            </div>
            <div className="mt-2 text-xs text-[#6B7280]">
              {selectedUserIds.length < 2 ? (
                <span className="text-[#F59E0B] flex items-center gap-1">
                  <span>ⓘ</span>
                  <span>Need at least 2 more members to create a group</span>
                </span>
              ) : (
                <span className="text-[#16A34A] flex items-center gap-1">
                  <span>✓</span>
                  <span>Ready to create group</span>
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {groupCreationError && (
            <div className="mb-4 p-3 bg-[#FEF2F2] text-[#EF4444] rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{groupCreationError}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBackClick}
              className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] hover:bg-[#F3F4F6] transition-colors font-medium"
              disabled={isCreatingGroup}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={
                isCreatingGroup ||
                selectedUserIds.length < 2 ||
                !groupName.trim() ||
                groupName.trim().length < 3
              }
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                isCreatingGroup || selectedUserIds.length < 2 || !groupName.trim() || groupName.trim().length < 3
                  ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                  : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              }`}
              type="button"
            >
              {isCreatingGroup ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Group"
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] text-center">
              💡 Tip: Choose a meaningful name and add at least 2 members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewGroup;
