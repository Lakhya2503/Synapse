import { ChatBubbleLeftRightIcon } from "@heroicons/react/20/solid";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, loginWithGoogle, loginWithGithub } = useAuth();

  const navigate = useNavigate()

  const handleDataChange = (name) => (e) => {
    setData({
      ...data,
      [name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(data);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl text-center">
          <ChatBubbleLeftRightIcon className="h-32 w-32 text-indigo-600 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome Back to SYNAPSE
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect, chat, and collaborate with your team in real-time. Secure messaging with
            end-to-end encryption.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-indigo-600 font-bold">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">End-to-end encrypted messages</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-indigo-600 font-bold">⏱️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time</h3>
              <p className="text-gray-600 text-sm">Instant message delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">SYNAPSE</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">Sign in to continue your conversations</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={data.email}
                onChange={handleDataChange("email")}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={data.password}
                onChange={handleDataChange("password")}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !data.email || !data.password}
              className={`
                w-full px-4 py-3 rounded-xl text-white font-semibold transition duration-200 shadow-lg
                ${loading || !data.email || !data.password
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                "Sign in"
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
                  Or continue with
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
              Don't have an account?{" "}
             <button
                onClick={()=>navigate('/register')}
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
            >
                Create account
             </button>
            </p>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              By continuing, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
