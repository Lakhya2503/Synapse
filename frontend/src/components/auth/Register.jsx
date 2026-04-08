import { ChatBubbleLeftRightIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { FaGoogle, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaCamera, FaGithub, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RegisterImage } from "../../../public";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    submit: false,
    google: false,
    github: false,
  });

  const { register, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (error) setError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, GIF, WebP)");
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (error) setError("");
    }
  };

  const validateForm = () => {
    if (!form.username.trim()) return "Username is required";
    if (form.username.length < 3) return "Username must be at least 3 characters";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email format";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('password', form.password);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await register(formData);
      navigate('/login', {
        state: { successMessage: "Registration successful! Please login." }
      });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGitHub = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGithub();
    } catch (err) {
      setError(err.message || "GitHub login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10">

        {/* Left Side - Professional Sized Image */}
        <div className="relative h-full max-w-lg">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-2xl blur-xl"></div>
          <img
            src={RegisterImage}
            alt="Secure Registration Illustration"
            className="relative h-auto w-full border-4 border-white/90 rounded-2xl shadow-xl shadow-indigo-500/20"
          />
          <div className="absolute -bottom-3 -right-3 h-24 w-24 bg-gradient-to-br from-cyan-400/30 to-indigo-400/30 rounded-full blur-md"></div>
          <div className="absolute -top-3 -left-3 h-20 w-20 bg-gradient-to-tr from-purple-400/30 to-pink-400/30 rounded-full blur-md"></div>
        </div>

        {/* Right Side - Professional Sized Form */}
        <div className="w-full h-full max-w-md">
          {/* Header with professional spacing */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg blur opacity-30"></div>
                <div className="relative h-10 w-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Synapse
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600 text-sm">Join thousands of communicators</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-6 md:p-7 relative overflow-hidden">
            {/* Gradient background elements */}
            <div className="absolute -top-16 -right-16 h-40 w-40 bg-gradient-to-br from-indigo-200/20 to-cyan-200/20 rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 h-40 w-40 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full"></div>

            <div className="relative z-10">
              {/* Messages with professional spacing */}
              {successMessage && (
                <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                  <p className="text-emerald-700 text-sm flex items-center gap-2">
                    <span className="h-5 w-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </span>
                    {successMessage}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg">
                  <p className="text-rose-700 text-sm flex items-center gap-2">
                    <span className="h-5 w-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                      <FaExclamationTriangle className="text-white text-xs" />
                    </span>
                    {error}
                  </p>
                </div>
              )}

              {/* Form with professional spacing */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-3 border-white bg-gradient-to-br from-indigo-100 to-cyan-100 shadow-md flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-indigo-300">
                          <FaUser className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-10 w-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200">
                      <FaCamera className="h-4 w-4 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
                      <FaUser className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="john_doe"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200 group-hover:border-indigo-400"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
                      <FaEnvelope className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200 group-hover:border-indigo-400"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
                      <FaLock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-sm bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200 group-hover:border-indigo-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-1">Minimum 6 characters with letters and numbers</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !form.username || !form.email || !form.password}
                  onMouseEnter={() => setHoverStates(prev => ({ ...prev, submit: true }))}
                  onMouseLeave={() => setHoverStates(prev => ({ ...prev, submit: false }))}
                  className="w-full py-3 bg-gradient-to-br from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group mt-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 to-cyan-600 transition-opacity duration-300 ${
                    hoverStates.submit ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider with professional spacing */}
              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300/60"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white/90 text-gray-500 font-medium">Or sign up with</span>
                  </div>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleLoginWithGoogle}
                  disabled={loading}
                  onMouseEnter={() => setHoverStates(prev => ({ ...prev, google: true }))}
                  onMouseLeave={() => setHoverStates(prev => ({ ...prev, google: false }))}
                  className="flex-1 py-2.5 bg-white border border-gray-300/60 rounded-lg hover:bg-gray-50 hover:border-indigo-400/60 hover:shadow-sm disabled:opacity-50 transition-all duration-200 relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-indigo-50/30 to-cyan-50/30 transition-opacity duration-300 ${
                    hoverStates.google ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  <span className="relative flex items-center justify-center gap-2.5">
                    <FaGoogle className="h-4 w-4 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Google
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLoginWithGitHub}
                  disabled={loading}
                  onMouseEnter={() => setHoverStates(prev => ({ ...prev, github: true }))}
                  onMouseLeave={() => setHoverStates(prev => ({ ...prev, github: false }))}
                  className="flex-1 py-2.5 bg-white border border-gray-300/60 rounded-lg hover:bg-gray-50 hover:border-gray-800/60 hover:shadow-sm disabled:opacity-50 transition-all duration-200 relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-gray-50/30 to-gray-100/30 transition-opacity duration-300 ${
                    hoverStates.github ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  <span className="relative flex items-center justify-center gap-2.5">
                    <FaGithub className="h-4 w-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      GitHub
                    </span>
                  </span>
                </button>
              </div>

              {/* Sign In Link */}
              <div className="mt-6 pt-5 border-t border-gray-300/60 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-cyan-700 transition-all relative group"
                  >
                    Sign In
                    <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-indigo-600 to-cyan-600 transition-all duration-300"></span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
