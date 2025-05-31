import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { initializeAuth, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // User is already logged in via session
        try {
          await initializeAuth(); // Update store state
          const from = location.state?.from?.pathname || (user?.role === 'company' ? '/company/dashboard' : '/challenges');
          navigate(from, { replace: true });
        } catch (error) {
          console.error('Error during auto-login with existing session:', error);
          navigate('/login', { replace: true });
        }
      } else {
        // No session, try to exchange code
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (code) {
          try {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) throw exchangeError;

            // After exchanging code, session should be available, try to login again
            await initializeAuth();
            const from = location.state?.from?.pathname || (user?.role === 'company' ? '/company/dashboard' : '/challenges');
            navigate(from, { replace: true });

          } catch (error) {
            console.error('Error exchanging auth code:', error);
            navigate('/login', { replace: true });
          }
        } else {
          // No code and no session, redirect to login
          navigate('/login', { replace: true });
        }
      }
    };

    handleAuth();
  }, [initializeAuth, navigate, location.search, location.state, user]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-gray-600">Loading user session...</p>
    </div>
  );
};

export default AuthCallbackPage;

