import { create } from 'zustand';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, companyDetails?: {
    name: string;
    website?: string;
    description?: string;
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
  }) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.full_name || session.user.email!.split('@')[0],
            role: profile.role || 'individual',
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`,
            bio: profile.bio || '',
            githubUrl: profile.github_url || '',
            githubUsername: profile.github_username || '',
            portfolioUrl: profile.portfolio_url || '',
            careerScore: profile.career_score || 0,
            badges: profile.badges || [],
            joinedAt: session.user.created_at,
            companyDetails: profile.company_details,
            user_metadata: session.user.user_metadata
          };

          set({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
            error: null
          });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: 'Failed to initialize authentication'
      });
    }
  },

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.session?.user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const userData = {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: profile.full_name || data.session.user.email!.split('@')[0],
        role: profile.role || 'individual',
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`,
        bio: profile.bio || '',
        githubUrl: profile.github_url || '',
        githubUsername: profile.github_username || '',
        portfolioUrl: profile.portfolio_url || '',
        careerScore: profile.career_score || 0,
        badges: profile.badges || [],
        joinedAt: data.session.user.created_at,
        companyDetails: profile.company_details,
        user_metadata: data.session.user.user_metadata
      };

      set({
        isAuthenticated: true,
        user: userData,
        isLoading: false,
        error: null
      });

      toast.success('Login successful!');
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      set({ 
        error: error.message || 'Failed to login',
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      toast.error('Login failed. Please check your credentials.');
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
      return;
    } catch (error: any) {
      set({ error: error.message || 'Failed to login with GitHub' });
      toast.error('GitHub login failed. Please try again.');
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
      return;
    } catch (error: any) {
      set({ error: error.message || 'Failed to login with Google' });
      toast.error('Google login failed. Please try again.');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ error: error.message || 'Failed to logout' });
      toast.error('Failed to logout');
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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name,
              email,
              role : role,
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
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${name}`,
            careerScore: 0,
            badges: [],
            joinedAt: data.user.created_at,
            companyDetails,
            user_metadata: data.user.user_metadata
          },
          isAuthenticated: true,
          error: null,
        });

        toast.success('Registration successful!');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to register' });
      toast.error('Registration failed. Please try again.');
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

      set((state) => ({
        user: state.user ? {
          ...state.user,
          name: profileData.name,
          bio: profileData.bio,
          githubUrl: profileData.githubUrl,
          portfolioUrl: profileData.portfolioUrl,
        } : null,
      }));

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      set({ error: error.message || 'Failed to update profile' });
      toast.error('Failed to update profile');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  } else if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      useAuthStore.setState({
        user: {
          id: session.user.id,
          email: session.user.email!,
          name: profile.full_name || session.user.email!.split('@')[0],
          role: profile.role || 'individual',
          avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`,
          bio: profile.bio || '',
          githubUrl: profile.github_url || '',
          githubUsername: profile.github_username || '',
          portfolioUrl: profile.portfolio_url || '',
          careerScore: profile.career_score || 0,
          badges: profile.badges || [],
          joinedAt: session.user.created_at,
          companyDetails: profile.company_details,
          user_metadata: session.user.user_metadata
        },
        isAuthenticated: true,
        error: null,
      });
    }
  }
});