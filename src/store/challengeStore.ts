import { create } from 'zustand';
import { Challenge } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ChallengeState {
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  isLoading: boolean;
  error: string | null;
  filter: {
    status: string;
    difficulty: string;
    searchQuery: string;
    tags: string[];
  };
  fetchChallenges: () => Promise<void>;
  setFilter: (filter: Partial<ChallengeState['filter']>) => void;
  clearFilters: () => void;
  updateChallengeStatus: (challengeId: string, newStatus: 'Active' | 'Completed') => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  filteredChallenges: [],
  isLoading: false,
  error: null,
  filter: {
    status: '',
    difficulty: '',
    searchQuery: '',
    tags: [],
  },
  
  fetchChallenges: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!challengesData) {
        throw new Error('No challenges data received');
      }

      // Update status based on deadline
      const now = new Date();
      const updatedChallenges = await Promise.all(challengesData.map(async (challengeData) => {
        if (!challengeData) {
          return null;
        }

        const { data: companyData, error: companyError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, company_details')
          .eq('id', challengeData.company_id)
          .eq('role', 'company')
          .maybeSingle();

        if (companyError) {
          console.error('Error fetching company data:', companyError);
        }

        const deadline = new Date(challengeData.deadline);
        let newStatus = challengeData.status;

        if (deadline < now && challengeData.status !== 'Completed') {
          newStatus = 'Completed';
          await supabase
            .from('challenges')
            .update({ status: 'Completed' })
            .eq('id', challengeData.id);
        }

        return {
          id: challengeData.id,
          title: challengeData.title,
          description: challengeData.description,
          company: {
            id: companyData?.id || challengeData.company_id,
            name: companyData?.full_name || 'Unknown Company',
            logo: companyData?.avatar_url || `https://ui-avatars.com/api/?name=${companyData?.full_name || 'Unknown+Company'}`,
            description: companyData?.company_details?.description,
            website: companyData?.company_details?.website,
          },
          deadline: challengeData.deadline,
          prizeMoney: challengeData.prize_money,
          difficulty: challengeData.difficulty,
          tags: challengeData.tags || [],
          participants: challengeData.participants_count,
          status: newStatus,
          requirements: challengeData.requirements || [],
          evaluationCriteria: challengeData.evaluation_criteria as any[] || [],
        };
      }));

      const validChallenges = updatedChallenges.filter((c): c is NonNullable<typeof c> => c !== null);

      set({
        challenges: validChallenges,
        filteredChallenges: validChallenges,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      set({ 
        error: error.message || 'Failed to load challenges',
        isLoading: false,
        challenges: [],
        filteredChallenges: []
      });
      toast.error('Failed to load challenges');
    }
  },
  
  updateChallengeStatus: async (challengeId, newStatus) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status: newStatus })
        .eq('id', challengeId);

      if (error) throw error;

      set(state => ({
        challenges: state.challenges.map(challenge =>
          challenge.id === challengeId ? { ...challenge, status: newStatus } : challenge
        ),
        filteredChallenges: state.filteredChallenges.map(challenge =>
          challenge.id === challengeId ? { ...challenge, status: newStatus } : challenge
        )
      }));

      toast.success('Challenge status updated successfully');
    } catch (error: any) {
      console.error('Error updating challenge status:', error);
      toast.error('Failed to update challenge status');
    }
  },
  
  setFilter: (filter) => {
    const newFilter = { ...get().filter, ...filter };
    set({ filter: newFilter });
    
    const { status, difficulty, searchQuery, tags } = newFilter;
    const filtered = get().challenges.filter(challenge => {
      if (status && challenge.status !== status) return false;
      if (difficulty && challenge.difficulty !== difficulty) return false;
      if (searchQuery && !challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !challenge.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (tags.length > 0 && !tags.some(tag => challenge.tags.includes(tag))) {
        return false;
      }
      return true;
    });
    
    set({ filteredChallenges: filtered });
  },
  
  clearFilters: () => {
    set({
      filter: {
        status: '',
        difficulty: '',
        searchQuery: '',
        tags: [],
      },
      filteredChallenges: get().challenges
    });
  }
}));