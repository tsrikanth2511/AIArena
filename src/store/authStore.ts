import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerWithGithub: () => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  clearError: () => void;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.email!.split('@')[0],
            avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name || data.user.email!.split('@')[0]}`,
            bio: profile?.bio || '',
            githubUrl: profile?.github_url || '',
            portfolioUrl: profile?.portfolio_url || '',
            careerScore: profile?.career_score || 0,
            badges: profile?.badges || [],
            joinedAt: data.user.created_at,
          },
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to login' });
      throw error;
    } finally {
      set({ isLoading: false });
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
      set({ error: error.message || 'Failed to login with GitHub' });
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
      set({ error: error.message || 'Failed to login with Google' });
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
    } catch (error: any) {
      set({ error: error.message || 'Failed to logout' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
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
              name,
              email,
              avatar_url: `https://ui-avatars.com/api/?name=${name}`,
              career_score: 0,
              badges: [],
            },
          ]);

        if (profileError) throw profileError;

        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
            avatar: `https://ui-avatars.com/api/?name=${name}`,
            careerScore: 0,
            badges: [],
            joinedAt: data.user.created_at,
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

  registerWithGithub: async () => {
    await useAuthStore.getState().loginWithGithub();
  },

  registerWithGoogle: async () => {
    await useAuthStore.getState().loginWithGoogle();
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
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
        name: profile?.name || session.user.email!.split('@')[0],
        avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name || session.user.email!.split('@')[0]}`,
        bio: profile?.bio || '',
        githubUrl: profile?.github_url || '',
        portfolioUrl: profile?.portfolio_url || '',
        careerScore: profile?.career_score || 0,
        badges: profile?.badges || [],
        joinedAt: session.user.created_at,
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