import { Loader } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import  {useNavigate}  from 'react-router-dom';

import {
  getCurrentUser,
  refreshToken,
  userLogin,
  userLogout,
  userRegister,
} from '../api';
import { LocalStorage } from '../utils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // -------------------- STATE --------------------
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => LocalStorage.get('user'));
  const [otp, setOtp] = useState(null);

  // -------------------- HELPERS --------------------
  const persistUser = useCallback((userData) => {
    if (userData) LocalStorage.set('user', userData);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setOtp(null);
    LocalStorage.remove('user');
  }, []);

  // -------------------- FETCH USER --------------------
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await getCurrentUser(); // must send cookies automatically
      const userData = res?.data?.data;
      if (userData) {
        setUser(userData);
        persistUser(userData);
      }
      return userData || null;
    } catch (err) {
      return null;
    }
  }, [persistUser]);

  // -------------------- TOKEN REFRESH --------------------
  const refreshAuthToken = useCallback(async () => {
    try {
      await refreshToken(); // backend refreshes cookie
      const userData = await fetchCurrentUser();
      if (!userData) throw new Error('Failed to fetch user after refresh');
      return true;
    } catch (err) {
      console.error('Refresh token failed:', err);
      clearAuth();
      navigate('/login');
      return false;
    }
  }, [fetchCurrentUser, clearAuth, navigate]);

  // -------------------- LOGOUT --------------------
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await userLogout(); // backend clears cookies
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      clearAuth();
      navigate('/login');
      setLoading(false);
    }
  }, [clearAuth, navigate]);

  // -------------------- LOGIN --------------------
  const login = async (payload) => {
    setLoading(true);
    try {
      await userLogin(payload); // backend sets cookies
      const userData = await fetchCurrentUser();
      if (!userData) throw new Error('Failed to fetch user');
      navigate('/synapse');
      return { success: true, user: userData };
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // -------------------- REGISTER --------------------
  const register = async (formData) => {
    setLoading(true);
    try {
      await userRegister(formData);
      // navigate('/login');
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  // -------------------- OAUTH -------------------- //
const openOAuthPopup = (url, name) => {
  const popup = window.open(
    url,
    name,
    'width=1000,height=700,scrollbars=yes,resizable=yes'
  );
  if (!popup) throw new Error('Popup blocked');
  return popup;
};

const handleOAuthPopup = (url) => {
  const popup = openOAuthPopup(url, 'oauth');

  const checkUser = setInterval(async () => {
    try {
      const userData = await fetchCurrentUser(); // 👈 FIX

      if (userData) {
        setUser(userData);
        LocalStorage.set('user', userData);

        clearInterval(checkUser);
        popup?.close();
        navigate('/synapse');
      }

      // stop polling if user manually closes popup
      if (popup?.closed) {
        clearInterval(checkUser);
      }
    } catch (err) {
      // still waiting for OAuth to finish
    }
  }, 1000);
};

const loginWithGoogle = () =>
  handleOAuthPopup(`${import.meta.env.VITE_SERVER_URI}/google`);

const loginWithGithub = () =>
  handleOAuthPopup(`${import.meta.env.VITE_SERVER_URI}/github`);

  // -------------------- INIT --------------------
  useEffect(() => {
    const init = async () => {
      try {
        await fetchCurrentUser(); 
      } catch (err) {
        await refreshAuthToken();
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [fetchCurrentUser, refreshAuthToken]);

  // -------------------- DERIVED --------------------
  const isAuthenticated = !!user;
  const isVerified = !!user?.isEmailVerified;

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      isVerified,
      login,
      register,
      logout,
      loginWithGoogle,
      loginWithGithub,
      refreshAuthToken,
      fetchCurrentUser,
    }),
    [user, loading, isAuthenticated, isVerified]
  );

  // -------------------- UI --------------------

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
