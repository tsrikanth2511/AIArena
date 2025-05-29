import { create } from 'zustand';
import { Challenge } from '../types';

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

// Mock data for challenges
const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Build a Real-Time Financial Sentiment Analyzer',
    description: 'Create an AI solution that analyzes financial news and social media in real-time to predict market sentiment and potential price movements.',
    company: {
      id: 'c1',
      name: 'FinTech Innovations',
      logo: 'https://images.pexels.com/photos/5980858/pexels-photo-5980858.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    deadline: '2024-07-15T23:59:59Z',
    prizeMoney: 5000,
    difficulty: 'Advanced',
    tags: ['Finance', 'NLP', 'Real-time Data'],
    participants: 187,
    status: 'Active',
    requirements: [
      'Solution must process financial news articles and social media posts',
      'Real-time sentiment analysis with < 5 second latency',
      'Dashboard with visualization of sentiment trends',
      'Documented approach to handling financial terminology',
      'Evaluation on historical data with at least 75% accuracy'
    ],
    evaluationCriteria: [
      { name: 'Accuracy', description: 'How accurate are the sentiment predictions?', weight: 30 },
      { name: 'Latency', description: 'How quickly does the system analyze new data?', weight: 25 },
      { name: 'Scalability', description: 'Can the system handle increasing volumes of data?', weight: 20 },
      { name: 'UX/UI', description: 'How intuitive and useful is the interface?', weight: 15 },
      { name: 'Innovation', description: 'Unique approaches or novel techniques used', weight: 10 }
    ]
  },
  {
    id: '2',
    title: 'Develop an AI-Powered Medical Diagnosis Assistant',
    description: 'Create a tool that helps medical professionals diagnose conditions from patient symptoms and medical history using advanced AI techniques.',
    company: {
      id: 'c2',
      name: 'HealthAI',
      logo: 'https://images.pexels.com/photos/6497642/pexels-photo-6497642.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    deadline: '2024-08-30T23:59:59Z',
    prizeMoney: 7500,
    difficulty: 'Expert',
    tags: ['Healthcare', 'Diagnosis', 'LLM', 'Medical Data'],
    participants: 124,
    status: 'Active',
    requirements: [
      'Interface for entering patient symptoms and history',
      'AI model that suggests possible diagnoses with confidence levels',
      'References to relevant medical literature',
      'Privacy-preserving design',
      'Explainable AI components to justify diagnoses'
    ],
    evaluationCriteria: [
      { name: 'Diagnostic Accuracy', description: 'How accurate are the diagnostic suggestions?', weight: 35 },
      { name: 'Usability', description: 'How easily can medical professionals use the system?', weight: 20 },
      { name: 'Explainability', description: 'How well does the system explain its reasoning?', weight: 25 },
      { name: 'Privacy', description: 'How well does the solution protect patient data?', weight: 15 },
      { name: 'Innovation', description: 'Novel approaches to medical AI diagnosis', weight: 5 }
    ]
  },
  {
    id: '3',
    title: 'Create an AI Writing Assistant for Technical Documentation',
    description: 'Build an AI assistant that helps developers write clear, accurate technical documentation by suggesting improvements, maintaining consistency, and ensuring completeness.',
    company: {
      id: 'c3',
      name: 'DevTools Inc',
      logo: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    deadline: '2024-07-05T23:59:59Z',
    prizeMoney: 3000,
    difficulty: 'Intermediate',
    tags: ['Documentation', 'Developer Tools', 'Content Generation'],
    participants: 256,
    status: 'Active',
    requirements: [
      'VSCode extension or web interface',
      'Real-time suggestions for technical writing',
      'Code example validation',
      'Consistency checking across documents',
      'Customizable style guide enforcement'
    ],
    evaluationCriteria: [
      { name: 'Writing Quality', description: 'How much does the tool improve documentation quality?', weight: 30 },
      { name: 'Technical Accuracy', description: 'Does the tool maintain technical accuracy?', weight: 30 },
      { name: 'User Experience', description: 'How seamless is the writing experience?', weight: 20 },
      { name: 'Customization', description: 'How adaptable is the tool to different documentation styles?', weight: 10 },
      { name: 'Performance', description: 'How responsive is the tool during use?', weight: 10 }
    ]
  },
  {
    id: '4',
    title: 'Build an AI Customer Support Optimization System',
    description: 'Create a system that analyzes customer support interactions and provides actionable insights to improve response time, quality, and customer satisfaction.',
    company: {
      id: 'c4',
      name: 'SupportIQ',
      logo: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    deadline: '2024-09-15T23:59:59Z',
    prizeMoney: 4500,
    difficulty: 'Intermediate',
    tags: ['Customer Support', 'Analytics', 'NLP'],
    participants: 143,
    status: 'Upcoming',
    requirements: [
      'Dashboard with key support metrics',
      'Sentiment analysis of customer interactions',
      'Automatic categorization of support tickets',
      'Suggestion system for response improvement',
      'Integration capabilities with common support platforms'
    ],
    evaluationCriteria: [
      { name: 'Insight Quality', description: 'How actionable are the insights provided?', weight: 35 },
      { name: 'Analysis Depth', description: 'How comprehensive is the support interaction analysis?', weight: 25 },
      { name: 'UX/UI', description: 'How intuitive and useful is the dashboard?', weight: 20 },
      { name: 'Integration', description: 'How easily can the tool integrate with existing systems?', weight: 15 },
      { name: 'Innovation', description: 'Unique approaches to support optimization', weight: 5 }
    ]
  },
  {
    id: '5',
    title: 'Develop an AI-Powered Code Review Assistant',
    description: 'Build a tool that automatically reviews code, identifies bugs, suggests improvements, and ensures code quality and best practices.',
    company: {
      id: 'c5',
      name: 'CodeGuardian',
      logo: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    deadline: '2024-06-30T23:59:59Z',
    prizeMoney: 6000,
    difficulty: 'Expert',
    tags: ['Code Review', 'Developer Tools', 'Static Analysis'],
    participants: 210,
    status: 'Completed',
    requirements: [
      'GitHub integration',
      'Automatic code quality assessment',
      'Security vulnerability detection',
      'Performance optimization suggestions',
      'Learning capabilities from team feedback'
    ],
    evaluationCriteria: [
      { name: 'Detection Accuracy', description: 'How accurate are the identified issues?', weight: 30 },
      { name: 'Suggestion Quality', description: 'How helpful are the improvement suggestions?', weight: 25 },
      { name: 'Integration', description: 'How smoothly does it integrate with development workflow?', weight: 20 },
      { name: 'Learning Ability', description: 'How well does the system learn from feedback?', weight: 15 },
      { name: 'Coverage', description: 'Range of programming languages and issue types covered', weight: 10 }
    ]
  }
];

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set({
      challenges: mockChallenges,
      filteredChallenges: mockChallenges,
      isLoading: false
    });
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