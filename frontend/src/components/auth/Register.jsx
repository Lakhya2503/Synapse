import { ChatBubbleLeftRightIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { FaCamera, FaGithub, FaGoogle, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { userRegister } from "../../api";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);

  const { loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (error) setError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2); // Limit to 2 files
    setAvatars(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeAvatar = (index) => {
    const newAvatars = [...avatars];
    const newPreviews = [...previewUrls];

    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    newAvatars.splice(index, 1);
    newPreviews.splice(index, 1);

    setAvatars(newAvatars);
    setPreviewUrls(newPreviews);
  };

  const validateForm = () => {
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);

      avatars.forEach((file) => {
        formData.append("avatar", file);
      });

      const res = await userRegister(formData);
       (res.data);

      // Redirect to login page after successful registration
      navigate("/login", { state: { message: "Registration successful! Please login." } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      setError("");
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
    } catch (err) {
      setError(err.message || `Failed to login with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-800">
      {/* Left Panel - Chat Illustration */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-2xl text-center">
          <ChatBubbleLeftRightIcon className="h-32 w-32 text-emerald-600 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Join SYNAPSE Today
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create your account to start connecting, chatting, and collaborating with your team in real-time.
            Experience secure messaging with end-to-end encryption.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-emerald-600 font-bold">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">End-to-end encrypted messages</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-emerald-600 font-bold">👥</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600 text-sm">Group chats and channels</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-emerald-600 font-bold">📁</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">File Sharing</h3>
              <p className="text-gray-600 text-sm">Share files and media easily</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-emerald-600 font-bold">🌐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cross Platform</h3>
              <p className="text-gray-600 text-sm">Access from any device</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">SYNAPSE</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">Join SYNAPSE to start collaborating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaUser className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200 shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200 shadow-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200 shadow-sm"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200 shadow-sm"
              />
            </div>

            {/* Profile Pictures */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Profile Pictures (Optional, max 2)
              </label>
              <div className="space-y-4">
                {/* File Input */}
                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition duration-200">
                    <FaCamera className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 font-medium">
                      {avatars.length > 0
                        ? `${avatars.length} file(s) selected`
                        : "Click to upload images"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={avatars.length >= 2}
                  />
                </label>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeAvatar(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {avatars[index]?.name || `Image ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  You can upload up to 2 images. Supported formats: JPG, PNG, GIF.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.username || !form.email || !form.password || !confirmPassword}
              className={`
                w-full px-4 py-3 rounded-xl text-white font-semibold transition duration-200 shadow-lg
                ${loading || !form.username || !form.email || !form.password || !confirmPassword
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                type="button"
                className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaGoogle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-700">Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin("github")}
                disabled={loading}
                type="button"
                className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaGithub className="h-5 w-5 text-gray-900" />
                <span className="font-medium text-gray-700">GitHub</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              By creating an account, you agree to our{" "}
              <a href="#" className="text-emerald-600 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-emerald-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
