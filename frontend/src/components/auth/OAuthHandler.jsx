import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LocalStorage } from '../../utils';

const OAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for token in URL parameters (common pattern)
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          navigate('/login', {
            state: { error: `Authentication failed: ${error}` }
          });
          return;
        }

        if (token) {
          // Store token
          LocalStorage.set('token', token);

          // Fetch user data with the token
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SERVER_URI}/current-user`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.data) {
                LocalStorage.set('user', data.data);

                // Redirect based on email verification
                const redirectPath = LocalStorage.get('redirectAfterOAuth') || '/synapse';
                LocalStorage.remove('redirectAfterOAuth');

                if (data.data.isEmailVerified) {
                  navigate(redirectPath);
                } else {
                  navigate('/verify-account');
                }
              }
            }
          } catch (fetchError) {
            console.error('Failed to fetch user:', fetchError);
            navigate('/login', {
              state: { error: 'Failed to retrieve user information' }
            });
          }
        } else {
          // If no token in URL, the backend might have set session cookies
          // Try to get current user
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SERVER_URI}/current-user`,
              {
                credentials: 'include'
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.data) {
                LocalStorage.set('user', data.data);

                if (data.accessToken) {
                  LocalStorage.set('token', data.accessToken);
                }

                const redirectPath = LocalStorage.get('redirectAfterOAuth') || '/synapse';
                LocalStorage.remove('redirectAfterOAuth');

                if (data.data.isEmailVerified) {
                  navigate(redirectPath);
                } else {
                  navigate('/verify-account');
                }
              }
            } else {
              navigate('/login', {
                state: { error: 'Authentication failed. Please try again.' }
              });
            }
          } catch (error) {
            console.error('Failed to get user:', error);
            navigate('/login', {
              state: { error: 'Authentication failed. Please try again.' }
            });
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login', {
          state: { error: 'Authentication failed. Please try again.' }
        });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-700">
          Completing authentication...
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we finish signing you in.
        </p>
      </div>
    </div>
  );
};

export default OAuthHandler;
