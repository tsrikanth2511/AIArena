import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a code to exchange
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Initialize auth state
        const userData = await initializeAuth();
        
        if (userData) {
          const redirectPath = userData.role === 'company' ? '/company/dashboard' : '/challenges';
          navigate(redirectPath, { replace: true });
          toast.success('Successfully signed in!');
        } else {
          throw new Error('Failed to load user data');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, location.search, initializeAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Completing Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication...
          </p>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;