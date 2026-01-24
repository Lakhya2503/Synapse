import { Loader } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  userLogin,
  userLogout,
  userRegister,
  verificationOTPGenerate,
  verifyEmailWithOTP,
  getCurrentUser,
  refreshToken
} from '../api';
import { LocalStorage, requestHandler } from '../utils';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ---------- Refresh Token Function ---------- */
  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await refreshToken();
      const { accessToken } = response.data;

      if (accessToken) {
        setToken(accessToken);
        LocalStorage.set('token', accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);




  /* ---------- Initialize Auth ---------- */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = LocalStorage.get('token');
      const storedUser = LocalStorage.get('user');

      // If we have both token and user in localStorage, restore them immediately
      if (storedToken && storedUser) {
        // Set state from localStorage for instant UI
        setToken(storedToken);
        setUser(storedUser);
        console.log(storedUser);


        // Verify token is still valid by making an API call
        try {
          const response = await getCurrentUser();
          if (response.data) {
            // Update with fresh user data
            const freshUser = response.data.data;
            setUser(freshUser);
            LocalStorage.set('user', freshUser);
          }
        } catch (error) {
          console.warn('Token validation failed:', error);

          // If token is invalid (401), try to refresh it
          if (error.response?.status === 401) {
            const refreshSuccess = await refreshAuthToken();
            if (!refreshSuccess) {
              // Token refresh failed, clear auth and redirect to login
              LocalStorage.remove('user');
              LocalStorage.remove('token');
              setUser(null);
              setToken(null);
              navigate('/login');
            } else {
              // Token refreshed successfully, fetch user again
              try {
                const newResponse = await getCurrentUser();
                if (newResponse.data) {
                  setUser(newResponse.data);
                  LocalStorage.set('user', newResponse.data);
                }
              } catch (retryError) {
                console.error('Failed to fetch user after token refresh:', retryError);
              }
            }
          }
          // For other errors (network issues, server down), keep using stored user
        }
      }
      // If we have token but no user data, fetch user
      else if (storedToken) {
        setToken(storedToken);
        try {
          const response = await getCurrentUser();
          if (response.data) {
            const user = response.data;
            setUser(user);
            LocalStorage.set('user', user);
          }
        } catch (error) {
          console.error('Failed to fetch user with token:', error);
          if (error.response?.status === 401) {
            // Token is invalid, clear it
            LocalStorage.remove('token');
            setToken(null);
            navigate('/login');
          }
        }
      }
      // No auth data found, redirect to login
      else {
        navigate('/login');
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, [navigate, refreshAuthToken]);

  /* ---------- Login ---------- */
  const login = async (payload) => {
    setLoading(true);
    await requestHandler(
      async () => {
        const response = await userLogin(payload);
        return response;
      },
      null,
      (res) => {
        const { user, accessToken } = res.data;
        console.log(user);


        setUser(user);
        setToken(accessToken);

        LocalStorage.set('user', user);
        LocalStorage.set('token', accessToken);

        // Redirect based on email verification status
        if (user.isEmailVerified) {
          navigate('/synapse');
        } else {
          navigate('/verify-account');
        }
      },
      (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        alert(errorMessage);
      }
    ).finally(() => setLoading(false));
  };

  console.log(user);

  /* ---------- Register ---------- */
  const register = async (payload) => {
    setLoading(true);
    await requestHandler(
      async () => {
        // Handle file upload if avatar exists
        if (payload.avatar) {
          const formData = new FormData();
          Object.keys(payload).forEach(key => {
            if (key === 'avatar') {
              formData.append(key, payload[key]);
            } else {
              formData.append(key, payload[key]);
            }
          });
          return userRegister(formData);
        }
        return userRegister(payload);
      },
      null,
      (res) => {
        alert('Account created successfully. Please check your email for verification.');
        navigate('/login');
      },
      (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
        alert(errorMessage);
      }
    ).finally(() => setLoading(false));
  };

  /* ---------- Logout ---------- */
  const logout = async () => {
    setLoading(true);
    await requestHandler(
      async () => {
        return userLogout();
      },
      null,
      () => {
        // Clear local state
        setUser(null);
        setToken(null);
        setOtp(null);

        // Clear localStorage
        LocalStorage.remove('user');
        LocalStorage.remove('token');

        // Redirect to login
        navigate('/login');
      },
      (error) => {
        console.error('Logout error:', error);
        // Still clear local data even if server logout fails
        setUser(null);
        setToken(null);
        LocalStorage.remove('user');
        LocalStorage.remove('token');
        navigate('/login');
      }
    ).finally(() => setLoading(false));
  };

  /* ---------- Generate OTP ---------- */
  const generateOtp = async () => {
    setLoading(true);
    await requestHandler(
      async () => {
        return verificationOTPGenerate();
      },
      null,
      (res) => {
        alert('OTP has been sent to your email');
      },
      (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to generate OTP';
        alert(errorMessage);
      }
    ).finally(() => setLoading(false));
  };

  /* ---------- Verify OTP ---------- */
  const verifyEmailAndOtp = async (otpCode) => {
    setLoading(true);
    await requestHandler(
      async () => {
        return verifyEmailWithOTP(otpCode);
      },
      null,
      (res) => {
        setOtp(res.data);

        // Update user verification status
        if (user) {
          const updatedUser = { ...user, isEmailVerified: true };
          setUser(updatedUser);
          LocalStorage.set('user', updatedUser);
        }

        alert('Email verified successfully!');
        navigate('/synapse');
      },
      (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
        alert(errorMessage);
      }
    ).finally(() => setLoading(false));
  };

  /* ---------- Update User Profile ---------- */
  const updateProfile = async (updates) => {
    // This would call your update APIs (username, fullName, avatar)
    // After successful update, update both state and localStorage
    console.log('Profile updates:', updates);
  };

  /* ---------- Check Auth Status ---------- */
  const isAuthenticated = useMemo(() => {
    return !!token && !!user;
  }, [token, user]);

  /* ---------- Memoized Context Value ---------- */
  const value = useMemo(
    () => ({
      user,
      token,
      otp,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      generateOtp,
      verifyEmailAndOtp,
      refreshAuthToken,
      updateProfile
    }),
    [user, token, otp, loading, isAuthenticated, refreshAuthToken]
  );

  /* ---------- Loading State ---------- */
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
