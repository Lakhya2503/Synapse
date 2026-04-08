import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { requestHandler } from "../../utils";
import { resetForgottenPassword } from "../../api";

const ResetForgottenPassword = () => {
  const { resetToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract token from URL - priority: params > query > path
  const [token, setToken] = useState(() => {
    if (resetToken) return resetToken;

    const hashToken = searchParams.get("hashToken") || searchParams.get("token");
    if (hashToken) return hashToken;

    // Fallback to URL path extraction
    const pathParts = window.location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];

    // Validate it looks like a token (not empty, not a route, has length)
    if (lastPart && lastPart.length > 20 &&
        !["reset-password", "forgot-password", "login"].includes(lastPart)) {
      return lastPart;
    }

    return null;
  });

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    return strength;
  };

  // Validate password in real-time
  useEffect(() => {
    if (!formData.password) {
      setPasswordErrors({});
      setPasswordStrength(0);
      return;
    }

    const errors = {};

    if (formData.password.length < 8) {
      errors.length = "At least 8 characters";
    }

    if (!/[A-Z]/.test(formData.password)) {
      errors.uppercase = "One uppercase letter (A-Z)";
    }

    if (!/[a-z]/.test(formData.password)) {
      errors.lowercase = "One lowercase letter (a-z)";
    }

    if (!/\d/.test(formData.password)) {
      errors.number = "One number (0-9)";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.special = "One special character (!@#$...)";
    }

    setPasswordErrors(errors);
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const validateForm = () => {
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Please enter a password");
      return false;
    }

    if (Object.keys(passwordErrors).length > 0) {
      setError("Please fix all password requirements");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please make it stronger.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await requestHandler(
        () => resetForgottenPassword(token, formData.password),
        setLoading,
        (res) => {
          setSuccess(true);

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            navigate("/login", {
              state: {
                message: "Password reset successful! Please login with your new password.",
                messageType: "success"
              },
              replace: true
            });
          }, 3000);
        },
        (err) => {
          const errorMessage = err?.response?.data?.message ||
                             err?.response?.data?.error ||
                             err?.message ||
                             "Failed to reset password. Please try again.";

          setError(errorMessage);

          // Handle specific error cases
          if (errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("not found")) {

            setTimeout(() => {
              navigate("/forgot-password", {
                state: {
                  message: "This reset link is invalid or has expired. Please request a new one.",
                  messageType: "error"
                }
              });
            }, 2000);
          }
        }
      );
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(""); // Clear error on input change
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  // Token missing screen
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.206 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Invalid Reset Link</h2>
            <p className="mt-3 text-gray-600">
              The password reset link is invalid, expired, or has already been used.
            </p>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Password Reset Successful!</h2>
            <p className="mt-3 text-gray-600">
              Your password has been successfully reset. Redirecting you to login...
            </p>
            <div className="mt-8 space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-green-600 h-2 rounded-full animate-pulse ${getStrengthColor()}`}></div>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Go to Login Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
          <p className="mt-2 text-gray-600">
            Create a new password for your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-red-600">{error}</p>
                {(error.toLowerCase().includes("invalid") || error.toLowerCase().includes("expired")) && (
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
                  >
                    Request a new reset link
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Password strength:</span>
                  <span className={`text-xs font-bold ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded ${index <= passwordStrength ? getStrengthColor() : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Password Requirements */}
            <div className="mt-3 space-y-1">
              {[
                { key: 'length', label: 'At least 8 characters' },
                { key: 'uppercase', label: 'One uppercase letter (A-Z)' },
                { key: 'lowercase', label: 'One lowercase letter (a-z)' },
                { key: 'number', label: 'One number (0-9)' },
                { key: 'special', label: 'One special character (!@#$...)' }
              ].map((req) => (
                <div key={req.key} className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${passwordErrors[req.key] ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className={`text-xs ${passwordErrors[req.key] ? 'text-gray-500' : 'text-green-600'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Object.keys(passwordErrors).length > 0 || formData.password !== formData.confirmPassword}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
              disabled={loading}
            >
              Back to Login
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:underline"
              disabled={loading}
            >
              Need help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetForgottenPassword;
