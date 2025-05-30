import { create } from 'zustand';
import { Challenge } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ChallengeState {
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  isLoading: boolean;
  filter: {
    status: string;
    difficulty: string;
    searchQuery: string;
    tags: string[];
  };
  fetchChallenges: () => Promise<void>;
  setFilter: (filter: Partial<ChallengeState['filter']>) => void;
  clearFilters: () => void;
  updateChallengeStatus: (challengeId: string, newStatus: 'Active' | 'Completed' | 'Upcoming') => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  filteredChallenges: [],
  isLoading: false,
  filter: {
    status: '',
    difficulty: '',
    searchQuery: '',
    tags: [],
  },
  
  fetchChallenges: async () => {
    set({ isLoading: true });
    try {
      const { data: challenges, error } = await supabase
        .from('challenges')
        .select(`
          *,
          company:company_id (
            id,
            full_name,
            avatar_url,
            company_details
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update status based on deadline
      const now = new Date();
      const updatedChallenges = await Promise.all(challenges.map(async (challenge) => {
        const deadline = new Date(challenge.deadline);
        let newStatus = challenge.status;

        if (deadline < now && challenge.status !== 'Completed') {
          newStatus = 'Completed';
          // Update status in database
          await supabase
            .from('challenges')
            .update({ status: 'Completed' })
            .eq('id', challenge.id);
        } else if (deadline > now && challenge.status === 'Upcoming' && 
                  deadline.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
          newStatus = 'Active';
          // Update status in database
          await supabase
            .from('challenges')
            .update({ status: 'Active' })
            .eq('id', challenge.id);
        }

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          company: {
            id: challenge.company.id,
            name: challenge.company.full_name || 'Unknown Company',
            logo: challenge.company.avatar_url || `https://ui-avatars.com/api/?name=${challenge.company.full_name}`,
            description: challenge.company.company_details?.description,
            website: challenge.company.company_details?.website,
          },
          deadline: challenge.deadline,
          prizeMoney: challenge.prize_money,
          difficulty: challenge.difficulty,
          tags: challenge.tags || [],
          participants: challenge.participants_count,
          status: newStatus,
          requirements: challenge.requirements || [],
          evaluationCriteria: challenge.evaluation_criteria as any[] || [],
        };
      }));

      set({
        challenges: updatedChallenges,
        filteredChallenges: updatedChallenges,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
      set({ isLoading: false });
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
    
    // Apply filters
    const { status, difficulty, searchQuery, tags } = newFilter;
    const filtered = get().challenges.filter(challenge => {
      // Filter by status
      if (status && challenge.status !== status) return false;
      
      // Filter by difficulty
      if (difficulty && challenge.difficulty !== difficulty) return false;
      
      // Filter by search query
      if (searchQuery && !challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !challenge.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by tags
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