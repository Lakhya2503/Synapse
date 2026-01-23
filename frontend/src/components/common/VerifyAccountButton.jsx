import {
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verificationOTPGenerate } from '../../api/index';
import { useAuth } from '../../context/AuthContext';

function VerifyAccountButton() {
  const navigate = useNavigate();
  const { user, setVerificationPending } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigateAndGenerateOtp = async () => {
    try {
      setLoading(true);
      setError('');

      // Show verification pending state in auth context
      setVerificationPending?.(true);

      // Generate OTP
      await verificationOTPGenerate();

      // Store verification intent in localStorage for persistence
      localStorage.setItem('verification_intent', 'account_verification');

      // Navigate to OTP verification with state
      navigate('/otp-verify', {
        state: {
          purpose: 'account_verification',
          userId: user?.id,
          email: user?.email,
          phone: user?.phone
        }
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate OTP. Please try again.');
      setVerificationPending?.(false);
      console.error('OTP Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If user is already verified, show different message
  if (user?.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Account Verified</h1>
            <p className="text-gray-600">Your account is already verified and ready to use!</p>
          </div>

          <button
            onClick={() => navigate('/chat')}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Go to Chats <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Verify Your Account</h1>
          <p className="text-gray-600 mb-6">
            Complete verification to unlock all chat features and ensure account security
          </p>
        </div>

        <div className="space-y-6">
          {/* Verification Benefits */}
          {/* <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-blue-800">Verification Benefits:</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Full access to chat features</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Send unlimited messages</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Create and join group chats</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Enhanced account security</span>
              </li>
            </ul>
          </div> */}

          {/* User Information Display */}
          {user && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 items-center">
              <h3 className="font-semibold text-gray-700">Verification will be sent to:</h3>
              <div className="space-y-2">
                {user.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
                {/* {user.mobileNumber && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">{user.mobileNumber}</span>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={navigateAndGenerateOtp}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating OTP...
              </>
            ) : (
              <>
                Verify Account with OTP
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Additional Information */}
          {/* <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <p className="font-medium">Secure Verification Process</p>
            </div>
            <p>You will receive a 6-digit code on your registered email/phone</p>
            <p className="text-xs mt-2">The code expires in 10 minutes</p>
          </div> */}

          {/* Skip for now option (if applicable) */}
          {/* <button
            onClick={() => navigate('/chat')}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip verification for now
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default VerifyAccountButton;
