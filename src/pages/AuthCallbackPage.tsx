import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback process...');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', location.search);

        // Get the session after OAuth redirect
        console.log('Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session response:', { 
          hasSession: !!session,
          hasUser: !!session?.user,
          sessionError: sessionError?.message,
          userMetadata: session?.user?.user_metadata
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(`Failed to get session: ${sessionError.message}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!session) {
          // Try to exchange the code for a session
          console.log('No session found, trying to exchange code...');
          const { data: { session: newSession }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(location.search);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError(`Failed to exchange code: ${exchangeError.message}`);
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          if (!newSession) {
            console.error('No session after code exchange');
            setError('Failed to get session after code exchange');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('Session obtained after code exchange');
        }

        const currentSession = session || (await supabase.auth.getSession()).data.session;
        
        if (!currentSession?.user) {
          console.error('No user in session');
          setError('No user found in session. Please try logging in again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('User found:', {
          id: currentSession.user.id,
          email: currentSession.user.email,
          metadata: currentSession.user.user_metadata
        });

        // Check if profile exists
        console.log('Checking for existing profile...');
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        console.log('Profile check result:', { 
          hasProfile: !!existingProfile,
          profileError: profileError?.message
        });

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError);
          setError(`Failed to check profile: ${profileError.message}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          console.log('Creating new profile...');
          const profileData = {
            id: currentSession.user.id,
            full_name: currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0],
            email: currentSession.user.email,
            avatar_url: currentSession.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0]}`,
            github_username: currentSession.user.user_metadata?.user_name || null,
            career_score: 0,
            badges: [],
          };
          
          console.log('Profile data to insert:', profileData);

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (insertError) {
            console.error('Profile creation error:', insertError);
            setError(`Failed to create profile: ${insertError.message}`);
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('Profile created successfully');
        } else {
          console.log('Profile already exists');
        }

        // Redirect based on role
        if (user) {
          const userRole = user.user_metadata?.role;
          if (userRole === 'company') {
            navigate('/company/dashboard');
          } else {
            navigate('/challenges');
          }
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!error) {
        console.error('Auth callback timed out');
        setError('Request timed out. Please try again.');
        navigate('/login');
      }
    }, 10000); // 10 second timeout

    handleCallback();

    return () => clearTimeout(timeoutId);
  }, [navigate, location, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

