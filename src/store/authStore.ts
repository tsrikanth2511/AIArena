import { create } from 'zustand';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithGithub: () => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, companyDetails?: {
    name: string;
    logo: string;
    website?: string;
    description?: string;
    industry?: string;
    size?: string;
  }) => Promise<void>;
  registerWithGithub: (role: UserRole) => Promise<void>;
  registerWithGoogle: (role: UserRole) => Promise<void>;
  clearError: () => void;
  updateProfile: (profileData: {
    name: string;
    bio: string;
    githubUrl: string;
    portfolioUrl: string;
    githubUsername: string;
    companyDetails?: {
      name: string;
      logo: string;
      website?: string;
      description?: string;
      industry?: string;
      size?: string;
    };
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Starting login process...');
      
      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        console.log('Found existing session, signing out...');
        await supabase.auth.signOut();
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      if (!data?.session?.user) throw new Error('No user found');

      console.log('Session user:', data.session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      console.log('Profile data:', profile);

      const userData = {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: profile?.full_name || data.session.user.user_metadata?.name || data.session.user.email!.split('@')[0],
        role: data.session.user.user_metadata?.role || 'individual',
        avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || data.session.user.email!.split('@')[0]}`,
        bio: profile?.bio || '',
        githubUrl: profile?.github_url || '',
        githubUsername: profile?.github_username || '',
        portfolioUrl: profile?.portfolio_url || '',
        careerScore: profile?.career_score || 0,
        badges: profile?.badges || [],
        joinedAt: data.session.user.created_at,
        companyDetails: data.session.user.user_metadata?.companyDetails,
        user_metadata: data.session.user.user_metadata
      };

      set({
        isAuthenticated: true,
        user: userData,
        isLoading: false
      });

      return userData;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to login',
        isLoading: false 
      });
      throw error;
    }
  },

  loginWithGithub: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return null; // OAuth redirects, so we don't need to return user here
    } catch (error: any) {
      set({ error: error.message || 'Failed to login with GitHub' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return null; // OAuth redirects, so we don't need to return user here
    } catch (error: any) {
      set({ error: error.message || 'Failed to login with Google' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ error: error.message || 'Failed to logout' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (name, email, password, role, companyDetails) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            companyDetails,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name,
              email,
              role,
              avatar_url: `https://ui-avatars.com/api/?name=${name}`,
              career_score: 0,
              badges: [],
              company_details: companyDetails,
            },
          ]);

        if (profileError) throw profileError;

        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
            role,
            avatar: `https://ui-avatars.com/api/?name=${name}`,
            careerScore: 0,
            badges: [],
            joinedAt: data.user.created_at,
            companyDetails,
          },
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to register' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  registerWithGithub: async (role: UserRole) => {
    await useAuthStore.getState().loginWithGithub();
  },

  registerWithGoogle: async (role: UserRole) => {
    await useAuthStore.getState().loginWithGoogle();
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.name,
          bio: profileData.bio,
          github_url: profileData.githubUrl,
          github_username: profileData.githubUsername,
          portfolio_url: profileData.portfolioUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      set((state) => ({
        user: state.user ? {
          ...state.user,
          name: profileData.name,
          bio: profileData.bio,
          githubUrl: profileData.githubUrl,
          portfolioUrl: profileData.portfolioUrl,
        } : null,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update profile' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange(async (_, session) => {
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    useAuthStore.setState({
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.full_name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
        role: session.user.user_metadata?.role || 'individual',
        avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || session.user.email!.split('@')[0]}`,
        bio: profile?.bio || '',
        githubUrl: profile?.github_url || '',
        githubUsername: profile?.github_username || '',
        portfolioUrl: profile?.portfolio_url || '',
        careerScore: profile?.career_score || 0,
        badges: profile?.badges || [],
        joinedAt: session.user.created_at,
        companyDetails: session.user.user_metadata?.companyDetails,
        user_metadata: session.user.user_metadata
      },
      isAuthenticated: true,
      error: null,
    });
  } else {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  }
});