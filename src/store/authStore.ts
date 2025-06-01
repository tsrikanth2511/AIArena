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
  }) => Promise<void>;
  initializeAuth: () => Promise<User | undefined>;
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
          .maybeSingle();

        if (profile) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.full_name || session.user.email!.split('@')[0],
            role: profile.role,
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || '')}`,
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
          
          return userData;
        }
      }
      set({ isAuthenticated: false, user: null, isLoading: false });
    } catch (error) {
      console.error('Auth initialization error:', error);
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
        .maybeSingle();

      if (!profile) throw new Error('Profile not found');

      const userData = {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: profile.full_name || data.session.user.email!.split('@')[0],
        role: profile.role,
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || '')}`,
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

      return userData;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  },

  loginWithGithub: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      window.location.href = '/';
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },

  register: async (name, email, password, role, companyDetails) => {
    set({ isLoading: true, error: null });
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create or update the profile using upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: name,
          email,
          role: role,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          career_score: 0,
          badges: [],
          company_details: role === 'company' ? companyDetails : null,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw new Error('Failed to create profile');
      }

      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        name,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
        careerScore: 0,
        badges: [],
        joinedAt: authData.user.created_at,
        companyDetails: role === 'company' ? companyDetails : null,
        user_metadata: authData.user.user_metadata
      };

      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      set({ 
        error: error.message,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  },

  registerWithGithub: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            role: role,
          },
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  registerWithGoogle: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            role: role,
          },
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.name,
          bio: profileData.bio,
          github_url: profileData.githubUrl,
          github_username: profileData.githubUsername,
          portfolio_url: profileData.portfolioUrl,
        });

      if (updateError) throw updateError;

      set((state) => ({
        user: state.user ? {
          ...state.user,
          name: profileData.name,
          bio: profileData.bio,
          githubUrl: profileData.githubUrl,
          portfolioUrl: profileData.portfolioUrl,
        } : null,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },
}));

// Auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
    if (session?.user) {
      try {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile) {
          // If no profile exists, create one
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
              email: session.user.email,
              role: session.user.user_metadata.role || 'individual',
              avatar_url: session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '')}`,
              career_score: 0,
              badges: [],
              company_details: session.user.user_metadata.role === 'company' ? session.user.user_metadata.companyDetails : null,
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (insertError) throw insertError;
          profile = newProfile;
        }

        useAuthStore.setState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: profile.full_name || session.user.email!.split('@')[0],
            role: profile.role,
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || '')}`,
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
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error in auth state change:', error);
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to load user profile'
        });
      }
    }
  }
});

export default useAuthStore;