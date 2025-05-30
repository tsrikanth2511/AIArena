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

      if (error) {
        throw error;
      }

      const formattedChallenges: Challenge[] = challenges.map(challenge => ({
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
        status: challenge.status,
        requirements: challenge.requirements || [],
        evaluationCriteria: challenge.evaluation_criteria as any[] || [],
      }));

      set({
        challenges: formattedChallenges,
        filteredChallenges: formattedChallenges,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
      set({ isLoading: false });
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