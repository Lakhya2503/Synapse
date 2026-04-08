import { ChatBubbleLeftRightIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginImage } from "../../../public";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    submit: false,
    google: false,
    github: false,
  });

  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }

    if (location.state?.error) {
      setError(location.state.error);
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!form.password) {
      setError("Password is required");
      return;
    }

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      await login(form);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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

  const handleGithubLogin = async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10">







        {/* Right Side - Professional Sized Login Form */}
        <div className="w-full lg:w-1/2 max-w-md order-1 lg:order-2">
          {/* Header with professional spacing */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur opacity-30"></div>
                <div className="relative h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Synapse
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to continue your conversations</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-6 md:p-7 relative overflow-hidden">
            {/* Gradient background elements */}
            <div className="absolute -top-16 -right-16 h-40 w-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 h-40 w-40 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full"></div>

            <div className="relative z-10">
              {/* Messages with professional spacing */}
              {successMessage && (
                <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-lg shadow-sm">
                  <p className="text-emerald-700 text-sm flex items-center gap-2">
                    <span className="h-5 w-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </span>
                    {successMessage}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-gradient-to-r from-rose-50 to-rose-50/50 border border-rose-200 rounded-lg shadow-sm">
                  <p className="text-rose-700 text-sm flex items-center gap-2">
                    <span className="h-5 w-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </span>
                    {error}
                  </p>
                </div>
              )}

              {/* Form with professional spacing */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <EnvelopeIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200 group-hover:border-blue-400"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password-request')}
                      className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <LockClosedIcon className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-sm bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200 group-hover:border-blue-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ?
                        <FaEyeSlash className="h-4 w-4" /> :
                        <FaEye className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-3 group"
                  >
                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all duration-200 ${
                      rememberMe
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {rememberMe && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      Remember me
                    </span>
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !form.email || !form.password}
                  onMouseEnter={() => setHoverStates(prev => ({ ...prev, submit: true }))}
                  onMouseLeave={() => setHoverStates(prev => ({ ...prev, submit: false }))}
                  className="w-full py-3 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group mt-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 transition-opacity duration-300 ${
                    hoverStates.submit ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
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
                    <span className="px-3 bg-white/90 text-gray-500 font-medium">Or sign in with</span>
                  </div>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-3">
                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  onMouseEnter={() => setHoverStates(prev => ({ ...prev, google: true }))}
                  onMouseLeave={() => setHoverStates(prev => ({ ...prev, google: false }))}
                  className="flex-1 py-2.5 bg-white border border-gray-300/60 rounded-lg hover:bg-gray-50 hover:border-blue-400/60 hover:shadow-sm disabled:opacity-50 transition-all duration-200 relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 transition-opacity duration-300 ${
                    hoverStates.google ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  <span className="relative flex items-center justify-center gap-2.5">
                    <FaGoogle className="h-4 w-4 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Google
                    </span>
                  </span>
                </button>

                {/* GitHub Login */}
                <button
                  type="button"
                  onClick={handleGithubLogin}
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

              {/* Sign Up Link */}
              <div className="mt-6 pt-5 border-t border-gray-300/60 text-center">
                <p className="text-sm text-gray-600">
                  New to Synapse?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all relative group"
                  >
                    Create an account
                    <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"></span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>


             {/* Left Side - Professional Sized Image */}
        <div className="relative w-full lg:w-1/2 max-w-lg order-2 lg:order-1">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"></div>
          <img
            src={LoginImage}
            alt="Secure Login Illustration"
            className="relative h-auto w-full border-4 border-white/90 rounded-2xl shadow-xl shadow-blue-500/20"
          />
          <div className="absolute -bottom-3 -right-3 h-24 w-24 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-md"></div>
          <div className="absolute -top-3 -left-3 h-20 w-20 bg-gradient-to-tr from-purple-400/30 to-pink-400/30 rounded-full blur-md"></div>
        </div>

      </div>
    </div>
  );
};

export default Login;
