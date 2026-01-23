import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  LockClosedIcon,
  BellIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  StarIcon,
  ChartBarIcon,
  BoltIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

function Profile() {
  const { user, updateProfile, resendVerificationEmail } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || 'Tell us about yourself...',
    location: user?.location || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      bio: user?.bio || 'Tell us about yourself...',
      location: user?.location || '',
      phoneNumber: user?.phoneNumber || '',
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically upload to Cloudinary
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    setResendStatus(null);
    try {
      await resendVerificationEmail();
      setResendStatus({ type: 'success', message: 'Verification email sent successfully!' });
    } catch (error) {
      setResendStatus({ type: 'error', message: 'Failed to send verification email. Please try again.' });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleVerifyAccount = () => {
    navigate('/verify-account');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats data
  const userStats = [
    { label: 'Activity Score', value: '89%', color: 'from-emerald-500 to-teal-600', icon: ChartBarIcon },
    { label: 'Response Rate', value: '95%', color: 'from-blue-500 to-cyan-600', icon: BoltIcon },
    { label: 'Engagement', value: '4.8/5', color: 'from-purple-500 to-pink-600', icon: StarIcon },
    { label: 'Streak', value: '42 days', color: 'from-orange-500 to-red-500', icon: FireIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-8">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:-translate-x-1"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Profile Dashboard
                </h2>
              </div>
              <p className="text-gray-600 ml-1">
                Manage your account settings and track your progress
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="group relative inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <PencilIcon className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleProfileSubmit}
                  className="group relative inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Email Verification Banner */}
        {!user?.isEmailVerified && (
          <div className="mb-8 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-red-50/70 border border-amber-200 rounded-2xl p-6 shadow-lg backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
            <div className="relative flex items-start">
              <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Email Verification Required</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Please verify your email address to unlock all premium features and enhance your security.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    <button
                      onClick={handleResendVerification}
                      disabled={isResendingEmail}
                      className="group relative inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {isResendingEmail ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white relative z-10" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="relative z-10">Sending...</span>
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-4 w-4 mr-2 relative z-10" />
                          <span className="relative z-10">Resend Email</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleVerifyAccount}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Verify Account
                    </button>
                  </div>
                </div>
                {resendStatus && (
                  <div className={`mt-4 p-4 rounded-lg border ${resendStatus.type === 'success' ? 'bg-emerald-50/90 border-emerald-200' : 'bg-rose-50/90 border-rose-200'} backdrop-blur-sm`}>
                    <p className={`text-sm font-medium ${resendStatus.type === 'success' ? 'text-emerald-800' : 'text-rose-800'} flex items-center`}>
                      {resendStatus.type === 'success' ? (
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 mr-2" />
                      )}
                      {resendStatus.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                  style={{ width: stat.value.includes('%') ? stat.value : '85%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 backdrop-blur-sm">
              {/* Avatar Section */}
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="relative flex flex-col items-center">
                  <div className="relative group mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile"
                        className="relative h-full w-full rounded-2xl object-cover border-4 border-white shadow-2xl"
                      />
                    ) : (
                      <div className="relative h-100 w-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-4 border-white shadow-2xl flex items-center justify-center">
                        <UserCircleIcon className="h-24 w-24 text-white" />
                      </div>
                    )}
                    {isEditing && (
                      <>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                        >
                          <div className="p-3 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md">
                            <CameraIcon className="h-8 w-8 text-white" />
                          </div>
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {formData.username || user?.username || 'User'}
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center mt-1">
                    <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                    {user?.email}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${user?.role === 'ADMIN' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'}`}>
                      {user?.role || 'USER'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${user?.isEmailVerified ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'}`}>
                      {user?.isEmailVerified ? (
                        <>
                          <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                          Unverified
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 p-5">
                {[
                  { id: 'profile', label: 'Personal Info', icon: UserCircleIcon, color: 'from-indigo-500 to-purple-500' },
                  { id: 'account', label: 'Account Details', icon: IdentificationIcon, color: 'from-blue-500 to-cyan-500' },
                  { id: 'security', label: 'Security', icon: LockClosedIcon, color: 'from-emerald-500 to-teal-500' },
                  { id: 'notifications', label: 'Notifications', icon: BellIcon, color: 'from-amber-500 to-orange-500' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden ${
                      activeTab === tab.id
                        ? `text-white bg-gradient-to-r ${tab.color} shadow-lg`
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                    <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}

                {!user?.isEmailVerified && (
                  <button
                    onClick={handleVerifyAccount}
                    className="group relative flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <ShieldCheckIcon className="h-5 w-5 mr-3 relative z-10" />
                    <span className="relative z-10">Verify Email</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Account Stats */}
            <div className="mt-8 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl p-6 border border-gray-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                  <TrophyIcon className="h-4 w-4 mr-2 text-amber-500" />
                  Account Stats
                </h4>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                  Active
                </span>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200/50">
                  <div className="flex items-center text-gray-500 mb-2">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <p className="text-xs font-bold uppercase">Member Since</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200/50">
                  <div className="flex items-center text-gray-500 mb-2">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <p className="text-xs font-bold uppercase">Last Updated</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {user?.updatedAt ? formatDateTime(user.updatedAt) : 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200/50">
                  <div className="flex items-center text-gray-500 mb-2">
                    <IdentificationIcon className="h-4 w-4 mr-2" />
                    <p className="text-xs font-bold uppercase">Login Type</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent capitalize">
                    {user?.loginType?.toLowerCase().replace('_', ' ') || 'Email'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200/50">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Personal Information
                      </h3>
                      <p className="text-gray-600 mt-2">Update your personal details and preferences</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100">
                      <UserCircleIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                          <UserCircleIcon className="h-4 w-4 mr-2 text-indigo-500" />
                          Username
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                            placeholder="Enter your username"
                          />
                        ) : (
                          <div className="p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner">
                            <p className="text-gray-900 font-medium">{formData.username || 'Not set'}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-indigo-500" />
                          Email Address
                        </label>
                        <div className="p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner flex items-center justify-between">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-900 font-medium">{user?.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${user?.isEmailVerified ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'}`}>
                              {user?.isEmailVerified ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <XCircleIcon className="h-3 w-3 mr-1.5" />
                                  Unverified
                                </>
                              )}
                            </span>
                            {!user?.isEmailVerified && (
                              <button
                                onClick={handleVerifyAccount}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                              >
                                Verify Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-2 text-indigo-500" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className="block w-full border border-gray-300 rounded-xl shadow-sm py-3.5 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                              placeholder="+1 (555) 123-4567"
                            />
                            <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        ) : (
                          <div className="p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <p className="text-gray-900 font-medium">{formData.phoneNumber || 'Not set'}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2 text-indigo-500" />
                          Location
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="block w-full border border-gray-300 rounded-xl shadow-sm py-3.5 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                              placeholder="City, Country"
                            />
                            <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        ) : (
                          <div className="p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner flex items-center">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <p className="text-gray-900 font-medium">{formData.location || 'Not set'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <GlobeAltIcon className="h-4 w-4 mr-2 text-indigo-500" />
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="4"
                          className="block w-full border border-gray-300 rounded-xl shadow-sm py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner">
                          <p className="text-gray-900 whitespace-pre-line">{formData.bio}</p>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="pt-8 border-t border-gray-200/50">
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="group relative inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <CheckIcon className="h-4 w-4 mr-2 relative z-10" />
                            <span className="relative z-10">Save Changes</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Account Details Tab */}
              {activeTab === 'account' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200/50">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Account Details
                      </h3>
                      <p className="text-gray-600 mt-2">View and manage your account information</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100">
                      <IdentificationIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl p-8 border border-indigo-100/50 backdrop-blur-sm">
                      <h4 className="text-xl font-bold text-gray-900 mb-6">Account Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-xl shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md mr-4">
                              <IdentificationIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500">Account Type</h5>
                              <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{user?.role}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Your current role and permissions</p>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-xl shadow-lg border border-gray-200/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md mr-4">
                              <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500">Account Age</h5>
                              <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {user?.createdAt
                                  ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
                                  : 'N/A'
                                }
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-gray-50/50 to-white p-6 rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-md mr-4">
                              <EnvelopeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-gray-900">Email Verification</h5>
                              <p className="text-sm text-gray-600">Status: {user?.isEmailVerified ? 'Verified' : 'Pending'}</p>
                            </div>
                          </div>
                          {!user?.isEmailVerified && (
                            <div className="flex space-x-3">
                              <button
                                onClick={handleResendVerification}
                                disabled={isResendingEmail}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              >
                                {isResendingEmail ? 'Sending...' : 'Resend Email'}
                              </button>
                              <button
                                onClick={handleVerifyAccount}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all duration-300 transform hover:scale-105"
                              >
                                Verify Now
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50/50 to-white p-6 rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md mr-4">
                            <LockClosedIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-gray-900">Login Method</h5>
                            <p className="text-sm text-gray-600">{user?.loginType?.replace('_', ' ') || 'Email & Password'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
