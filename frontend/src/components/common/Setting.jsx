import {
  Bell,
  Calendar,
  Camera,
  CheckCircle,
  Edit3,
  Eye, EyeOff,
  Globe,
  Key,
  LogOut,
  Mail,
  Moon,
  Palette,
  Phone,
  Save,
  Shield,
  ShieldCheck, Smartphone,
  Trash2,
  User,
  Verified,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Setting = () => {
  const { user, logout } = useAuth();
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
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: '+1 234 567 8900',
  });
  const [activeSection, setActiveSection] = useState('account');

  const handleFieldChange = (field, value) => {
    setEditedFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      //  ('Saving changes:', editedFields);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
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
          value: user?.avatar,
          type: 'avatar',
          icon: <Camera className="w-4 h-4" />
        },
        {
          label: 'Username',
          value: isEditing ? 'editing' : user?.username,
          type: 'text',
          icon: <User className="w-4 h-4" />
        },
        {
          label: 'Email Address',
          value: user?.email,
          type: 'email',
          icon: <Mail className="w-4 h-4" />,
          verified: user?.isEmailVerified
        },
        {
          label: 'Phone Number',
          value: '+1 234 567 8900',
          type: 'tel',
          icon: <Phone className="w-4 h-4" />
        },
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      settings: [
        {
          label: 'Two-Factor Auth',
          value: false,
          type: 'toggle',
          icon: <ShieldCheck className="w-4 h-4" />
        },
        {
          label: 'Login Notifications',
          value: true,
          type: 'toggle',
          icon: <Bell className="w-4 h-4" />
        },
        {
          label: 'Active Sessions',
          value: '3 devices',
          type: 'info',
          icon: <Smartphone className="w-4 h-4" />
        },
        {
          label: 'Password',
          value: 'Change password',
          type: 'password',
          icon: <Key className="w-4 h-4" />
        },
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      settings: [
        { label: 'Message Alerts', value: notifications.messages, type: 'toggle' },
        { label: 'Email Updates', value: notifications.email, type: 'toggle' },
        { label: 'Push Notifications', value: notifications.push, type: 'toggle' },
        { label: 'Sound Effects', value: notifications.sound, type: 'toggle' },
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      color: 'from-orange-500 to-amber-500',
      settings: [
        {
          label: 'Dark Mode',
          value: darkMode,
          type: 'toggle',
          icon: <Moon className="w-4 h-4" />
        },
        {
          label: 'Language',
          value: 'English (US)',
          type: 'select',
          options: ['English (US)', 'Spanish', 'French', 'German'],
          icon: <Globe className="w-4 h-4" />
        },
        {
          label: 'Theme Color',
          value: 'Purple',
          type: 'select',
          options: ['Purple', 'Blue', 'Green', 'Red', 'Orange'],
          icon: <Palette className="w-4 h-4" />
        },
      ]
    }
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
            <span className="text-sm text-gray-600">Click to upload</span>
          </div>
        );

      case 'toggle':
        return (
          <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
            setting.value
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30'
              : 'bg-gray-200'
          }`}>
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
              setting.value ? 'left-8' : 'left-1'
            }`} />
          </div>
        );

      case 'select':
        return (
          <div className="relative group">
            <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium cursor-pointer hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md">
              {setting.value}
              <div className="absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 text-sm font-medium">••••••••</span>
            <button className="text-gray-400 hover:text-purple-600 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 flex items-center space-x-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-xl"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2.5 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Save</span>
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
                    <button className="absolute bottom-2 right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                  <p className="text-gray-600 text-sm mt-1 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {user?.email}
                  </p>

                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">42</div>
                      <div className="text-xs text-gray-500">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">128</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">1.2K</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>
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
                        {new Date(user?.createdAt).toLocaleDateString()}
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
                      <span className="font-medium text-gray-900">{user?.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div className={`p-6 bg-gradient-to-r ${currentSection.color} bg-opacity-10 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-r ${currentSection.color} text-white`}>
                      {currentSection.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{currentSection.title} Settings</h2>
                      <p className="text-gray-600 text-sm">Manage your {currentSection.title.toLowerCase()} preferences</p>
                    </div>
                  </div>
                </div>
              </div>

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

                {/* Additional Actions */}
                {activeSection === 'security' && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="p-4 text-left rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">View Login History</h4>
                            <p className="text-sm text-gray-500">Recent account activity</p>
                          </div>
                        </div>
                      </button>
                      <button className="p-4 text-left rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Privacy Checkup</h4>
                            <p className="text-sm text-gray-500">Review privacy settings</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
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
                  <button className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-medium">
                    Delete Account
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
