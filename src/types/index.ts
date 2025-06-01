import { UserMetadata } from '@supabase/supabase-js';

export type UserRole = 'individual' | 'company';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  githubUrl?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  careerScore: number;
  badges: Badge[];
  joinedAt: string;
  companyDetails?: {
    name: string;
    website?: string;
    description?: string;
    industry?: string;
    size?: string;
  } | null;
  user_metadata?: UserMetadata;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  company: Company;
  deadline: string;
  prizeMoney: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  participants: number;
  status: 'Active' | 'Completed';
  requirements: string[];
  evaluationCriteria: EvaluationCriterion[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  description?: string;
  website?: string;
}

export interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number;
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  repoUrl: string;
  deckUrl?: string;
  videoUrl?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'Submitted' | 'Evaluating' | 'Scored' | 'Reviewed';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'submission' | 'score' | 'badge' | 'announcement';
  read: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  rank: number;
  badges: Badge[];
}