import { Check, LogOut, Mail, Pencil, Phone, Calendar, MapPin, Shield, Trash2, User, UserPlus, Users, X, MessageCircle, Ban, Star, Search, MoreVertical, AlertCircle } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { FakeGroupAvatar } from "../../../public/index";
import { deleteGroupChat, getAllUser, updateGroupName, removeUserFromGroup } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils";
import AddParticipantsModal from "../forms/AddParticipantsModal";

// Dummy user data for demonstration
const dummyUserData = {
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  bio: "Software Developer | React Expert | Coffee Lover ☕",
  location: "San Francisco, CA",
  joinedDate: "January 15, 2023",
  status: "Active",
  lastSeen: "2 hours ago",
  isOnline: true,
  isBlocked: false,
  isFavorite: false,
  synapsePoints: 1250,
  synapseLevel: "Pro",
  synapseBadges: ["Early Adopter", "Bug Hunter", "Community Helper"],
  mutualGroups: 3,
  mutualFriends: 7,
  messageCount: 245
};

// Main ProfileSection Component
const ProfileSection = memo(({ otherUser, onClose, isOpen, chatId, onParticipantsUpdated, onGroupNameUpdated }) => {
  const { user } = useAuth();

  // Check if component should be rendered
  if (!isOpen) return null;
  if (!otherUser) return null;

  // ---------- States ----------
  const [isImageClick, setIsImageClick] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(otherUser.name || otherUser.username || "");
  const [userName, setUserName] = useState(otherUser.username || otherUser.name || "User");
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [userData, setUserData] = useState(dummyUserData);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(dummyUserData.bio);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showRemoveMenu, setShowRemoveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isRemovingParticipant, setIsRemovingParticipant] = useState(false);
  const [removalError, setRemovalError] = useState(null);
  const [isUpdatingGroupName, setIsUpdatingGroupName] = useState(false); // Added loading state for name update
  const [groupNameError, setGroupNameError] = useState(null); // Added error state for name update

  const imageMenuRef = useRef(null);
  const participantMenuRef = useRef(null);

  // Check if it's a group chat or individual chat
  const isGroupChat = useMemo(() => otherUser?.isGroupChat || false, [otherUser]);

  // For group chat: admin and participants
  const admin = useMemo(
    () => isGroupChat ? otherUser.participants?.find((p) => p._id === otherUser.admin) || null : null,
    [otherUser, isGroupChat]
  );

  const otherParticipants = useMemo(
    () =>
      isGroupChat ? otherUser.participants?.filter(
        (p) => p._id !== admin?._id && p._id !== user?._id
      ) || [] : [],
    [otherUser, admin, user, isGroupChat]
  );

  // Check if current user is admin (for groups) or viewing own profile
  const isAdmin = isGroupChat && user._id === admin?._id;
  const isSelf = !isGroupChat && user._id === otherUser._id;

  // ---------- Effects ----------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isImageClick && imageMenuRef.current && !imageMenuRef.current.contains(e.target)) {
        setIsImageClick(false);
      }

      if (showRemoveMenu && participantMenuRef.current && !participantMenuRef.current.contains(e.target)) {
        setShowRemoveMenu(false);
        setSelectedParticipant(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isImageClick, showRemoveMenu]);

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showRemoveMenu) {
        setShowRemoveMenu(false);
        setSelectedParticipant(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showRemoveMenu]);

  // Reset group name when otherUser changes
  useEffect(() => {
    if (otherUser?.name) {
      setGroupName(otherUser.name);
    }
  }, [otherUser?.name]);

  // ---------- Group Name Update Handler ----------
  const handleUpdateGroupName = useCallback(async () => {
    if (!groupName.trim() || isUpdatingGroupName) {
      setGroupNameError("Group name cannot be empty");
      return;
    }

    // Check if name actually changed
    if (groupName === otherUser.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingGroupName(true);
    setGroupNameError(null);

    try {
      await requestHandler(
        async () => updateGroupName(chatId, groupName), // API call with correct arguments
        null,
        (res) => {
          // Success
          const successMessage = res?.data?.message || "Group name updated successfully!";

          // Update the local state
          setGroupName(groupName);
          setIsEditingName(false);

          // Notify parent component about the update
          if (onGroupNameUpdated) {
            onGroupNameUpdated({
              chatId,
              newName: groupName,
              previousName: otherUser.name
            });
          }

          // Optional: Show success message
          alert(successMessage);
        },
        (err) => {
          // Error handling
          const errorMessage = err.response?.data?.message || err.message || "Failed to update group name";
          setGroupNameError(errorMessage);
          alert(`Error: ${errorMessage}`);
        }
      );
    } catch (error) {
      console.error("Error in handleUpdateGroupName:", error);
      setGroupNameError("An unexpected error occurred");
      alert("An unexpected error occurred");
    } finally {
      setIsUpdatingGroupName(false);
    }
  }, [groupName, chatId, otherUser.name, isUpdatingGroupName, onGroupNameUpdated]);

  // ---------- Participant Removal Handler ----------
  const handleRemoveParticipant = useCallback(async () => {
    if (!selectedParticipant || !isAdmin || isRemovingParticipant) return;

    const confirmMessage = `Are you sure you want to remove ${selectedParticipant.username} from the group?`;

    if (!window.confirm(confirmMessage)) {
      setShowRemoveMenu(false);
      setSelectedParticipant(null);
      return;
    }

    setIsRemovingParticipant(true);
    setRemovalError(null);

    try {
      await requestHandler(
        async () => removeUserFromGroup(chatId, selectedParticipant._id), // API call
        null,
        (res) => {
          // Success
          const successMessage = res?.data?.message || `${selectedParticipant.username} has been removed from the group`;
          alert(successMessage);

          // Notify parent component to refresh participants
          if (onParticipantsUpdated) {
            onParticipantsUpdated({
              type: 'removed',
              participant: selectedParticipant,
              chatId
            });
          }

          // Close menu and reset states
          setShowRemoveMenu(false);
          setSelectedParticipant(null);
        },
        (err) => {
          // Error handling
          const errorMessage = err.response?.data?.message || err.message || "Failed to remove participant";
          setRemovalError(errorMessage);
          alert(`Error: ${errorMessage}`);
        }
      );
    } catch (error) {
      console.error("Error in handleRemoveParticipant:", error);
      setRemovalError("An unexpected error occurred");
      alert("An unexpected error occurred");
    } finally {
      setIsRemovingParticipant(false);
    }
  }, [selectedParticipant, chatId, isAdmin, isRemovingParticipant, onParticipantsUpdated]);

  const handleParticipantClick = useCallback((member, event) => {
    // Only show remove option if current user is admin and not clicking on themselves
    if (!isAdmin || member._id === user._id) return;

    // Get click position for context menu
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: event.clientX,
      y: event.clientY
    });

    setSelectedParticipant(member);
    setShowRemoveMenu(true);
    setRemovalError(null);
  }, [isAdmin, user._id]);

  // ---------- Cancel Edit Handler ----------
  const handleCancelEdit = useCallback(() => {
    setGroupName(otherUser.name || "");
    setGroupNameError(null);
    setIsEditingName(false);
  }, [otherUser.name]);

  // RENDER GROUP PROFILE
  const renderGroupProfile = () => (
    <>
      {/* Profile Image & Name Section */}
      <div className="flex flex-col items-center mb-8">
        <div ref={imageMenuRef} className="relative group">
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <img
              src={otherUser.avatar || FakeGroupAvatar}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              alt={groupName}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => setIsImageClick(!isImageClick)}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Pencil size={20} className="text-gray-900" />
              </button>
            </div>
          </div>

          {isImageClick && (
            <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl p-2 w-48 z-50 border border-gray-200">
              <button
                onClick={handleViewImage}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User size={16} className="text-gray-600" />
                View Image
              </button>
              <button
                onClick={handleUploadImage}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Pencil size={16} className="text-gray-600" />
                Upload New
              </button>
              <button
                onClick={handleDeleteImage}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Group Name */}
        <div className="mt-6 text-center">
          <div className="flex flex-col items-center gap-3">
            {!isEditingName ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-gray-900">{groupName}</h2>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isUpdatingGroupName}
                    >
                      <Pencil size={18} className="text-gray-600" />
                    </button>
                  )}
                </div>
                {groupNameError && (
                  <div className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} />
                    {groupNameError}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => {
                      setGroupName(e.target.value);
                      setGroupNameError(null);
                    }}
                    className="flex-1 border-2 border-blue-500 px-4 py-2 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                    autoFocus
                    disabled={isUpdatingGroupName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isUpdatingGroupName) {
                        handleUpdateGroupName();
                      }
                      if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <button
                    onClick={handleUpdateGroupName}
                    disabled={isUpdatingGroupName || !groupName.trim()}
                    className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingGroupName ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
                    ) : (
                      <Check size={20} />
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdatingGroupName}
                    className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>
                {groupNameError && (
                  <div className="text-sm text-red-600 mt-1">
                    {groupNameError}
                  </div>
                )}
                {isUpdatingGroupName && (
                  <div className="text-sm text-blue-600 mt-1">
                    Updating group name...
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Group Chat
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {otherUser.participants?.length || 0} members
            </span>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Group Participants
          </h4>
          <span className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {otherUser.participants?.length || 0} total
          </span>
        </div>

        <div className="space-y-3">
          {/* YOU */}
          {user && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="relative">
                <img
                  src={user.avatar || FakeGroupAvatar}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  alt="You"
                />
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full">
                    <Shield size={12} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">You</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                      Group Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin (if not you) */}
          {admin && admin._id !== user?._id && (
            <div
              className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${
                isAdmin ? 'border-gray-200 hover:border-blue-300 cursor-pointer' : 'border-gray-200'
              } transition-colors`}
              onClick={(e) => isAdmin && handleParticipantClick(admin, e)}
            >
              <div className="relative">
                <img
                  src={admin.avatar || FakeGroupAvatar}
                  className="w-14 h-14 rounded-full object-cover shadow border-2 border-violet-700"
                  alt={admin.username}
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full">
                  <Shield size={12} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{admin.username}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      Group admin
                    </span>
                    {isAdmin && (
                      <MoreVertical size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Participants */}
          {otherParticipants.map((member) => (
            <div
              key={member._id}
              className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${
                isAdmin ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer' : 'border-gray-200'
              } transition-all group`}
              onClick={(e) => isAdmin && handleParticipantClick(member, e)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      className="w-full h-full rounded-full object-cover border-2 border-violet-700"
                      alt={member.username}
                    />
                  ) : (
                    <span className="font-bold text-gray-700 text-lg">
                      {getInitials(member.username)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{member.username}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              {isAdmin && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Remove Participant Menu */}
      {showRemoveMenu && selectedParticipant && (
        <div
          ref={participantMenuRef}
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-64"
          style={{
            top: Math.min(menuPosition.y, window.innerHeight - 300),
            left: Math.min(menuPosition.x, window.innerWidth - 280),
          }}
        >
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 truncate">{selectedParticipant.username}</p>
            <p className="text-xs text-gray-500 truncate">{selectedParticipant.email}</p>
          </div>

          <div className="py-2">
            <button
              onClick={handleViewParticipantProfile}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              disabled={isRemovingParticipant}
            >
              <User size={16} className="text-gray-600" />
              View Profile
            </button>

            {isAdmin && selectedParticipant._id !== user._id && (
              <>
                {removalError && (
                  <div className="px-4 py-2 mx-3 my-1 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} />
                    {removalError}
                  </div>
                )}

                <button
                  onClick={handleRemoveParticipant}
                  disabled={isRemovingParticipant}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRemovingParticipant ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Remove from Group
                    </>
                  )}
                </button>

                {selectedParticipant._id !== admin?._id && (
                  <button
                    onClick={handleMakeAdmin}
                    disabled={isRemovingParticipant}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Shield size={16} />
                    Make Admin
                  </button>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setShowRemoveMenu(false);
                setSelectedParticipant(null);
                setRemovalError(null);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              disabled={isRemovingParticipant}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Add Participants Button */}
        {isAdmin && (
          <button
            onClick={() => setShowAddParticipants(true)}
            className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            <UserPlus size={22} />
            Add Participants
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
              +
            </span>
          </button>
        )}

        {/* Delete/Leave Group Button */}
        <button
          onClick={handleDeleteChat}
          className={`w-full p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
            isAdmin
              ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300'
              : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300'
          }`}
        >
          {isAdmin ? (
            <>
              <Trash2 size={20} />
              Delete Group
            </>
          ) : (
            <>
              <LogOut size={20} />
              Leave Group
            </>
          )}
        </button>
      </div>
    </>
  );

  // Helper functions
  const getInitials = (name = "U") => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleDeleteChat = async () => {
    let confirmMessage = "";

    if (isGroupChat) {
      confirmMessage = isAdmin
        ? "Are you sure you want to delete this group? This action cannot be undone."
        : "Are you sure you want to leave this group? You will need to be re-invited to join again.";
    } else {
      confirmMessage = "Are you sure you want to delete this chat? All messages will be permanently deleted.";
    }

    if (!window.confirm(confirmMessage)) return;

    await requestHandler(
      () => deleteGroupChat(chatId),
      null,
      (res) => {
        const action = isGroupChat ? (isAdmin ? "deleted" : "left") : "deleted";
        alert(res?.data?.message || `Chat ${action} successfully`);
        onClose();
      },
      (err) => alert(err.message)
    );
  };

  const handleViewImage = () => {
    const avatar = otherUser.avatar || FakeGroupAvatar;
    window.open(avatar, '_blank');
  };

  const handleUploadImage = () => console.log("Upload image clicked");
  const handleDeleteImage = () => {
    if (!window.confirm("Are you sure you want to delete profile image?")) return;
    console.log("Delete image");
  };

  // Individual user profile functions (simplified for demo)
  const handleViewParticipantProfile = useCallback(() => {
    if (!selectedParticipant) return;
    alert(`Viewing profile of ${selectedParticipant.username}`);
    setShowRemoveMenu(false);
    setSelectedParticipant(null);
  }, [selectedParticipant]);

  const handleMakeAdmin = useCallback(async () => {
    if (!selectedParticipant || !isAdmin) return;
    alert(`Make ${selectedParticipant.username} admin feature coming soon!`);
    setShowRemoveMenu(false);
    setSelectedParticipant(null);
  }, [selectedParticipant, isAdmin]);

  // RENDER INDIVIDUAL USER PROFILE (simplified)
  const renderUserProfile = () => (
    <div className="text-center py-12">
      <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-lg">
        <img
          src={otherUser.avatar || FakeGroupAvatar}
          className="w-full h-full object-cover"
          alt={userName}
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{userName}</h2>
      <p className="text-gray-600 mb-6">{otherUser.email || userData.email}</p>

      <div className="space-y-4">
        <button className="w-full p-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <MessageCircle className="inline mr-2" size={18} />
          Send Message
        </button>

        <button
          onClick={handleDeleteChat}
          className="w-full p-3 bg-red-50 text-red-700 rounded-xl font-semibold border border-red-200 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="inline mr-2" size={18} />
          Delete Chat
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Profile Section */}
      <div className="w-96 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 shadow-xl h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-2xl text-gray-900">
                {isGroupChat ? "Group Info" : "Contact Info"}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {isGroupChat ? "Manage group settings and participants" : "View and manage contact details"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isGroupChat ? renderGroupProfile() : renderUserProfile()}
        </div>
      </div>

      {/* Add Participants Modal */}
      <AddParticipantsModal
        isOpen={showAddParticipants}
        onClose={() => setShowAddParticipants(false)}
        chatId={chatId}
        currentParticipants={otherUser.participants || []}
        onSuccess={() => {
          setShowAddParticipants(false);
          if (onParticipantsUpdated) {
            onParticipantsUpdated({
              type: 'added',
              chatId
            });
          }
        }}
      />
    </>
  );
});

ProfileSection.displayName = 'ProfileSection';

export default ProfileSection;
