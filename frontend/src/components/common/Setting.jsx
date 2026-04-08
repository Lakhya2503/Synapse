import {
  Bell,
  Calendar,
  Camera,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Save,
  Trash2,
  User,
  Verified,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestHandler } from '../../utils';
import { deleteUser, updateUsername, updateUserAvatar } from '../../api';

const Setting = () => {
  const { user, logout, updateUser } = useAuth();
  const [notifications, setNotifications] = useState({
    messages: true,
    email: true,
    push: true,
    sound: true
  });
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({
    username: '',
    email: '',
    phoneNumber: '+1 234 567 8900',
  });
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Initialize edited fields with user data
  useEffect(() => {
    if (user) {
      setEditedFields({
        username: user?.username || '',
        email: user?.email || '',
        phoneNumber: '+1 234 567 8900',
      });
    }
  }, [user]);

  const handleFieldChange = (field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    await requestHandler(
      () => updateUserAvatar(avatarFile),
      () => setLoading(true),
      (res) => {
        if (res.data?.data?.user) {
          updateUser(res.data.data.user);
        }
        alert('Profile picture updated successfully!');
        setAvatarFile(null);
        setAvatarPreview(null);
      },
      (error) => {
        alert('Failed to update profile picture');
        console.error(error);
      },
      () => setLoading(false)
    );
  };

  const handleToggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete your account ${user?.username}? This action cannot be undone.`);
    if (!confirmed) {
      setShowDeleteConfirm(false);
      return;
    }

    await requestHandler(
      () => deleteUser(),
      () => setLoading(true),
      (res) => {
        alert('Account deleted successfully');
        logout();
      },
      (error) => {
        alert('Failed to delete account');
        console.error(error);
      },
      () => {
        setLoading(false);
        setShowDeleteConfirm(false);
      }
    );
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      let hasChanges = false;

      // Update username if changed
      if (editedFields.username !== user?.username && editedFields.username.trim()) {
        hasChanges = true;
        await requestHandler(
          () => updateUsername(editedFields.username),
          null,
          (res) => {
            if (res.data?.data?.user) {
              updateUser(res.data.data.user);
            }
          },
          (error) => {
            alert('Failed to update username');
            throw error;
          }
        );
      }

      if (hasChanges) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('No changes detected.');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedFields({
      username: user?.username || '',
      email: user?.email || '',
      phoneNumber: '+1 234 567 8900',
    });
    setIsEditing(false);
  };
  
  const settingsSections = [
    {
      id: 'account',
      title: 'Account',
      icon: <User className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      settings: [
        {
          label: 'Profile Picture',
          value: avatarPreview || user?.avatar,
          type: 'avatar',
          icon: <Camera className="w-4 h-4" />,
          hasFile: !!avatarFile
        },
        {
          label: 'Username',
          value: isEditing ? editedFields.username : user?.username,
          type: isEditing ? 'edit-text' : 'text',
          icon: <User className="w-4 h-4" />,
          field: 'username'
        },
        {
          label: 'Email Address',
          value: isEditing ? editedFields.email : user?.email,
          type: isEditing ? 'edit-email' : 'email',
          icon: <Mail className="w-4 h-4" />,
          verified: user?.isEmailVerified,
          field: 'email'
        },
      ]
    },
  ];

  const renderSettingValue = (setting) => {
    switch (setting.type) {
      case 'avatar':
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={setting.value || 'https://via.placeholder.com/48'}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-500/20"></div>
            </div>
            <div className="flex flex-col space-y-1">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="text-sm text-purple-600 font-medium hover:text-purple-700 cursor-pointer"
              >
                Change photo
              </label>
              {setting.hasFile && (
                <button
                  onClick={handleUploadAvatar}
                  className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        );

      case 'edit-text':
      case 'edit-email':
        return (
          <input
            type={setting.type === 'edit-email' ? 'email' : 'text'}
            value={setting.value}
            onChange={(e) => handleFieldChange(setting.field, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      default:
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">{setting.value}</span>
            {setting.verified && (
              <Verified className="w-4 h-4 text-green-500" />
            )}
          </div>
        );
    }
  };

  const currentSection = settingsSections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/50 p-4 md:p-6">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={logout}
              className="px-4 py-2.5 flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors rounded-xl hover:bg-white/80"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>

            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 flex items-center space-x-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-xl"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="px-6 py-2.5 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {loading ? 'Saving...' : 'Save'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Card */}
              <div className="p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-1">
                      <img
                        src={user?.avatar || 'https://via.placeholder.com/96'}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    </div>
                    <button
                      onClick={() => document.getElementById('avatar-upload-sidebar').click()}
                      className="absolute bottom-2 right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      id="avatar-upload-sidebar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                  <p className="text-gray-600 text-sm mt-1 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {user?.email}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    ID: {user?._id}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4">
                <div className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 border border-purple-100 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} text-white`}>
                        {section.icon}
                      </div>
                      <span className="font-medium">{section.title}</span>
                      {activeSection === section.id && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Account Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Account Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Joined</span>
                      <span className="font-medium text-gray-900 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Account Type</span>
                      <span className="font-medium text-gray-900">{user?.role || 'User'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Settings List */}
              <div className="p-6">
                <div className="space-y-4">
                  {currentSection.settings.map((setting, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 group-hover:from-purple-50 group-hover:to-blue-50 group-hover:text-purple-600 transition-all duration-200">
                          {setting.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{setting.label}</h3>
                            {setting.verified === false && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                Verify
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {setting.description || 'Manage this setting'}
                          </p>
                        </div>
                      </div>

                      <div className="ml-4">
                        {renderSettingValue(setting)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Danger Zone</h3>
                      <p className="text-gray-600 text-sm">Irreversible and destructive actions</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className={`px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  {showDeleteConfirm
                    ? 'Are you absolutely sure? This will permanently delete your account and all data.'
                    : 'Once you delete your account, there is no going back. Please be certain.'}
                </p>
                {showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel deletion
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
