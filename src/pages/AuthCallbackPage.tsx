import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Create profile if it doesn't exist
          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                  email: session.user.email,
                  avatar_url: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${session.user.user_metadata?.name || session.user.email?.split('@')[0]}`,
                  career_score: 0,
                  badges: [],
                },
              ]);

            if (profileError) throw profileError;
          }
        }

        // Redirect to challenges page
        navigate('/challenges');
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Completing registration...</h2>
        <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

