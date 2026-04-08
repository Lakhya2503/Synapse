import { AlertCircle, Check, LogOut, MoreVertical, Pencil, Shield, Trash2, UserPlus, Users, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FakeGroupAvatar } from "../../../public/index";
import { archivedOneOnOneChat, blockOneOnOneChat, deleteGroupChat, leaveGroupChat, removeUserFromGroup, unArchivedOneOnOneChat, unBlockOneOnOneChat, updateGroupName } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils";
import AddParticipantsModal from "../forms/AddParticipantsModal";

// ==================== Constants & Types ====================
const USER_PROFILE_DEFAULTS = {
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

// ==================== Helper Components ====================
const ActionButton = ({
  onClick,
  label,
  icon: Icon,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled = false
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700',
    danger: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300',
    warning: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300',
    info: 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300',
    secondary: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
      ) : (
        <Icon size={20} />
      )}
      {label}
    </button>
  );
};

const ProfileHeader = ({ title, description, onClose }) => (
  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 pb-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold text-2xl text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Close profile"
      >
        <X size={24} className="text-gray-600" />
      </button>
    </div>
  </div>
);

const AvatarSection = ({ src, alt, size = 40, isOnline, isEditable, onEditClick }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const avatarSize = {
    40: "w-40 h-40",
    14: "w-14 h-14",
    12: "w-12 h-12",
  }[size] || "w-14 h-14";

  return (
    <div className="relative group">
      <div className={`relative ${avatarSize} rounded-full overflow-hidden shadow-lg border-4 border-white`}>
        {src ? (
          <img
            src={src}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            alt={alt}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {getInitials(alt)}
            </span>
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
        )}
      </div>
      {isEditable && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
          <button
            onClick={onEditClick}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
            aria-label="Edit avatar"
          >
            <Pencil size={20} className="text-gray-900" />
          </button>
        </div>
      )}
    </div>
  );
};

const EditableField = ({
  value,
  onSave,
  onCancel,
  isEditing,
  onEditClick,
  isEditable = true,
  label,
  inputType = "text",
  placeholder = ""
}) => {
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
  };

  const handleCancel = () => {
    setTempValue(value);
    onCancel();
  };

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      {!isEditing ? (
        <>
          <span className="text-lg font-semibold text-gray-900">{value || placeholder}</span>
          {isEditable && (
            <button
              onClick={onEditClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Edit ${label}`}
            >
              <Pencil size={18} className="text-gray-600" />
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type={inputType}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="border-2 border-blue-500 px-4 py-2 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[200px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder={placeholder}
          />
          <button
            onClick={handleSave}
            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            aria-label="Save changes"
          >
            <Check size={20} />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            aria-label="Cancel editing"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const ParticipantMenu = ({
  participant,
  position,
  onClose,
  onRemove,
  onViewProfile,
  onMakeAdmin,
  isRemoving = false,
  error = null
}) => {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-64"
      style={{
        top: Math.min(position.y, window.innerHeight - 300),
        left: Math.min(position.x, window.innerWidth - 280),
      }}
    >
      <div className="p-3 border-b border-gray-100">
        <p className="font-semibold text-gray-900 truncate">{participant.username}</p>
        <p className="text-xs text-gray-500 truncate">{participant.email}</p>
      </div>

      <div className="py-2">
        {error && (
          <div className="px-4 py-2 mx-3 my-1 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button
          onClick={onViewProfile}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          View Profile
        </button>

        <button
          onClick={onMakeAdmin}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Shield size={16} />
          Make Group Admin
        </button>

        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isRemoving ? (
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
      </div>

      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={onClose}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          disabled={isRemoving}
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const ProfileSection = memo(({
  otherUser,
  onClose,
  isOpen,
  chatId,
  onParticipantsUpdated,
  oneOnOneChat
}) => {
  const { user } = useAuth();

  // ---------- States ----------
  const [isImageClick, setIsImageClick] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [userName, setUserName] = useState("");
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [userData, setUserData] = useState(USER_PROFILE_DEFAULTS);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(USER_PROFILE_DEFAULTS.bio);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showRemoveMenu, setShowRemoveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isRemovingParticipant, setIsRemovingParticipant] = useState(false);
  const [removalError, setRemovalError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(oneOnOneChat?.isBlock || false);
  const [isArchived, setIsArchived] = useState(oneOnOneChat?.isArchived || false);




  const imageMenuRef = useRef(null);
  const participantMenuRef = useRef(null);

  // ---------- Memoized Values ----------
  const isGroupChat = useMemo(() => otherUser?.isGroupChat || false, [otherUser]);

  const admin = useMemo(
    () => isGroupChat ? otherUser?.participants?.find((p) => p._id === otherUser.admin) || null : null,
    [otherUser, isGroupChat]
  );

  const otherParticipants = useMemo(
    () =>
      isGroupChat ? otherUser?.participants?.filter(
        (p) => p._id !== admin?._id && p._id !== user?._id
      ) || [] : [],
    [otherUser, admin, user, isGroupChat]
  );

  const isAdmin = isGroupChat && user?._id === admin?._id;
  const isSelf = !isGroupChat && user?._id === otherUser?._id;

  // ---------- Effects ----------
  useEffect(() => {
    if (otherUser) {
      setGroupName(otherUser.name || otherUser.username || "");
      setUserName(otherUser.username || otherUser.name || "User");
    }
  }, [otherUser]);



  useEffect(() => {
    if (oneOnOneChat) {
      setIsBlocked(oneOnOneChat.isBlock || false);
      setIsArchived(oneOnOneChat.isArchived || false);
    }
  }, [oneOnOneChat]);

  // ---------- API Handlers ----------
  const handleBlockToggle = async () => {
    const action = isBlocked ? unBlockOneOnOneChat : blockOneOnOneChat;
    const message = isBlocked
      ? `Are you sure you want to unblock ${otherUser.username}?`
      : `Are you sure you want to block ${otherUser.username}?`;

    if (!window.confirm(message)) return;

    await requestHandler(
      () => action(chatId),
      null,
      () => {
        setIsBlocked(!isBlocked);
        const actionText = isBlocked ? "unblocked" : "blocked";
        alert(`${otherUser.username} has been ${actionText}`);
      },
      (err) => alert(err.message)
    );
  };

  const handleArchiveToggle = async () => {
    const action = isArchived ? unArchivedOneOnOneChat : archivedOneOnOneChat;
    const message = isArchived
      ? `Unarchive chat with ${otherUser.username}?`
      : `Archive chat with ${otherUser.username}? You can always unarchive it later.`;

    if (!window.confirm(message)) return;

    await requestHandler(
      () => action(chatId),
      null,
      () => {
        setIsArchived(!isArchived);
        const actionText = isArchived ? "unarchived" : "archived";
        alert(`Chat has been ${actionText}`);
      },
      (err) => alert(err.message)
    );
  };

  const handleUpdateGroupName = async (newName) => {
    if (!newName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    if (newName === otherUser.name) {
      setIsEditingName(false);
      return;
    }

    await requestHandler(
      () => updateGroupName(chatId, newName),
      null,
      () => {
        alert("Group name updated successfully!");
        setIsEditingName(false);
        // Update local state
        setGroupName(newName);
      },
      (err) => alert(err.message)
    );
  };

  const handleLeaveChat = async () => {
    let confirmMessage = "";
    let actionText = "";

    if (isGroupChat) {
      confirmMessage = isAdmin
        ? "Are you sure you want to delete this group? This action cannot be undone."
        : "Are you sure you want to leave this group? You will need to be re-invited to join again.";
      actionText = isAdmin ? "delete" : "leave";
    } else {
      confirmMessage = "Are you sure you want to delete this chat? All messages will be permanently deleted.";
      actionText = "delete";
    }

    if (!window.confirm(confirmMessage)) return;

    const action = isGroupChat ? leaveGroupChat : deleteGroupChat;

    await requestHandler(
      () => action(chatId),
      null,
      (res) => {
        alert(res?.data?.message || `Chat ${actionText}ed successfully`);
        onClose();
      },
      (err) => alert(err.message)
    );
  };

  const handleRemoveParticipant = async () => {
    if (!selectedParticipant || !isAdmin || isRemovingParticipant) return;

    const confirmMessage = `Are you sure you want to remove ${selectedParticipant.username} from the group?`;

    if (!window.confirm(confirmMessage)) {
      setShowRemoveMenu(false);
      setSelectedParticipant(null);
      return;
    }

    setIsRemovingParticipant(true);
    setRemovalError(null);

    await requestHandler(
      async () => removeUserFromGroup(chatId, selectedParticipant._id),
      null,
      (res) => {
        const successMessage = res?.data?.message || `${selectedParticipant.username} has been removed from the group`;
        alert(successMessage);

        if (onParticipantsUpdated) {
          onParticipantsUpdated({
            type: 'removed',
            participant: selectedParticipant,
            chatId
          });
        }

        setShowRemoveMenu(false);
        setSelectedParticipant(null);
      },
      (err) => {
        const errorMessage = err.response?.data?.message || err.message || "Failed to remove participant";
        setRemovalError(errorMessage);
      }
    ).finally(() => {
      setIsRemovingParticipant(false);
    });
  };

  // ---------- Event Handlers ----------
  const handleParticipantClick = useCallback((member, event) => {
    if (!isAdmin || member._id === user?._id) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: event.clientX,
      y: event.clientY
    });

    setSelectedParticipant(member);
    setShowRemoveMenu(true);
    setRemovalError(null);
  }, [isAdmin, user?._id]);

  const handleViewParticipantProfile = useCallback(() => {
    if (!selectedParticipant) return;
    alert(`Viewing profile of ${selectedParticipant.username}`);
    setShowRemoveMenu(false);
    setSelectedParticipant(null);
  }, [selectedParticipant]);

  const handleMakeAdmin = useCallback(() => {
    if (!selectedParticipant || !isAdmin) return;
    alert(`Make ${selectedParticipant.username} admin feature coming soon!`);
    setShowRemoveMenu(false);
    setSelectedParticipant(null);
  }, [selectedParticipant, isAdmin]);

  console.log(user);


  // ---------- Render Functions ----------
  const renderGroupProfile = () => (
    <>
      {/* Profile Image & Name Section */}
      <div className="flex flex-col items-center mb-8">
        <AvatarSection
          src={otherUser.avatar || FakeGroupAvatar}
          alt={groupName}
          isEditable={isAdmin}
          onEditClick={() => setIsImageClick(!isImageClick)}
        />

        {/* Group Name */}
        <div className="mt-6 text-center">
          <EditableField
            value={groupName}
            onSave={handleUpdateGroupName}
            onCancel={() => {
              setGroupName(otherUser.name);
              setIsEditingName(false);
            }}
            isEditing={isEditingName}
            onEditClick={() => setIsEditingName(true)}
            isEditable={isAdmin}
            label="group name"
            placeholder="Enter group name"
          />

          <div className="mt-2 flex items-center justify-center gap-2">
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
          {/* Current User */}
          {user && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <AvatarSection
                src={user.avatar || FakeGroupAvatar}
                alt="You"
                size={14}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">You</p>
                    <p className="text-[14px] text-gray-600">{user.email.slice(0,5)}..@gmail.com</p>
                  </div>
                  {isAdmin && (
                    <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs font-semibold rounded-full">
                      Group Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin (if not current user) */}
          {admin && admin._id !== user?._id && (
            <div
              className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${
                isAdmin ? 'border-gray-200 hover:border-blue-300 cursor-pointer' : 'border-gray-200'
              } transition-colors`}
              onClick={(e) => isAdmin && handleParticipantClick(admin, e)}
            >
              <div className="relative">
                <AvatarSection
                  src={admin.avatar || FakeGroupAvatar}
                  alt={admin.username}
                  size={14}
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
              <AvatarSection
                src={member.avatar}
                alt={member.username}
                size={12}
              />
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

      {/* Participant Menu */}
      {showRemoveMenu && selectedParticipant && (
        <ParticipantMenu
          participant={selectedParticipant}
          position={menuPosition}
          onClose={() => {
            setShowRemoveMenu(false);
            setSelectedParticipant(null);
            setRemovalError(null);
          }}
          onRemove={handleRemoveParticipant}
          onViewProfile={handleViewParticipantProfile}
          onMakeAdmin={handleMakeAdmin}
          isRemoving={isRemovingParticipant}
          error={removalError}
        />
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Add Participants Button */}
        {isAdmin && (
          <ActionButton
            onClick={() => setShowAddParticipants(true)}
            label="Add Participants"
            icon={UserPlus}
            variant="primary"
          />
        )}

        {/* Delete/Leave Group Button */}
        <ActionButton
          onClick={handleLeaveChat}
          label={isAdmin ? "Delete Group" : "Leave Group"}
          icon={isAdmin ? Trash2 : LogOut}
          variant={isAdmin ? "danger" : "warning"}
        />
      </div>
    </>
  );

  const renderUserProfile = () => (
    <div className="space-y-8">
      {/* Profile Header Section */}
      <div className="flex flex-col items-center mb-8">
        <AvatarSection
          src={otherUser.avatar || FakeGroupAvatar}
          alt={otherUser.username}
          isOnline={userData.isOnline}
        />

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">{otherUser.username}</h2>
            {isBlocked && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                Blocked
              </span>
            )}
            {isArchived && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                Archived
              </span>
            )}
          </div>

          <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {otherUser.email}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              User ID: {otherUser._id?.slice(-6) || 'N/A'}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Joined: {new Date(otherUser.createdAt || userData.joinedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <UserPlus size={18} className="text-gray-600" />
            Bio
          </h4>
          <p className="text-gray-700">
            {userData.bio || "No bio provided"}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-2">Details</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{userData.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium">{userData.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${userData.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {userData.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {userData.synapseBadges?.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={18} className="text-amber-600" />
              Synapse Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {userData.synapseBadges.map((badge, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mt-8">
        {/* Block/Unblock Button */}
        <ActionButton
          onClick={handleBlockToggle}
          label={isBlocked ? "Unblock User" : "Block User"}
          icon={isBlocked ? Check : AlertCircle}
          variant={isBlocked ? "success" : "danger"}
        />




        {/* Archive/Unarchive Button */}
        <ActionButton
          onClick={handleArchiveToggle}
          label={isArchived ? "Unarchive Chat" : "Archive Chat"}
          icon={Check}
          variant={isArchived ? "primary" : "info"}
        />
      </div>
    </div>
  );

  // Don't render if not open or no otherUser
  if (!isOpen || !otherUser) return null;

  return (
    <>
      <div className="w-96 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 shadow-xl h-screen overflow-y-auto">
        <ProfileHeader
          title={isGroupChat ? "Group Info" : "Contact Info"}
          description={isGroupChat ? "Manage group settings and participants" : "View and manage contact details"}
          onClose={onClose}
        />

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
          onParticipantsUpdated?.({ type: 'added', chatId });
        }}
      />
    </>
  );
});

ProfileSection.displayName = 'ProfileSection';

export default ProfileSection;
