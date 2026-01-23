  import { Loader } from 'lucide-react';
  import { createContext, useContext, useEffect, useMemo, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import {
    userLogin,
    userLogout,
    userRegister,
    verificationOTPGenerate,
    verifyEmailWithOTP,
  } from '../api';
  import { LocalStorage, requestHandler } from '../utils';

  const AuthContext = createContext(null);

  export const useAuth = () => useContext(AuthContext);

  export const AuthProvider = ({ children }) => {
    const [isInitializing, setIsInitializing] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [otp, setOtp] = useState(null);

    const navigate = useNavigate();

    /* ---------- App Init ---------- */
    useEffect(() => {
      const storedUser = LocalStorage.get('user');
      const storedToken = LocalStorage.get('token');

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }

      setIsInitializing(false);
    }, []);

    /* ---------- Login ---------- */
    const login = async (payload) => {
      await requestHandler(
        () => userLogin(payload),
        null,
        (res) => {
          const {user, accessToken, refreshToken} = res.data;

          setUser(user);
          setToken(accessToken);


          LocalStorage.set('user', user);
          LocalStorage.set('token', accessToken);





          if (user.isEmailVerified && user.OTP) {
            navigate('/synapse');
          } else {
            navigate('/verify-account');
          }

        },
        alert
      );
    };

    /* ---------- Verify OTP ---------- */
    const verifyEmailAndOtp = async (payload) => {
      await requestHandler(
        () => verifyEmailWithOTP(payload),
        null,
        (res) => {
          setOtp(res.data);
          navigate('/synapse');
        },
        alert
      );
    };

    /* ---------- Register ---------- */
    const register = async (payload) => {
      await requestHandler(
        () => userRegister(payload),
        null,
        () => {
          alert('Account created successfully. Please login.');
          navigate('/login');
        },
        alert
      );
    };

    /* ---------- Logout ---------- */
    const logout = async () => {
      await requestHandler(
        () => userLogout(),
        null,
        () => {
          setUser(null);
          setToken(null);
          setOtp(null);

          LocalStorage.remove('user');
          LocalStorage.remove('token');

          navigate('/login');
        },
        alert
      );
    };

    /* ---------- Generate OTP ---------- */
    const generateOtp = async () => {
      await verificationOTPGenerate();
    };


    console.log(`token : ${token}`);







    /* ---------- Memoized Context ---------- */
    const value = useMemo(
      () => ({
        user,
        token,
        otp,
        login,
        register,
        logout,
        generateOtp,
        verifyEmailAndOtp,
      }),
      [user, token, otp]
    );

    if (isInitializing) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin" />
        </div>
      );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
