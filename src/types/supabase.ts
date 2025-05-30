export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          deadline: string
          prize_money: number
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          tags: string[]
          participants_count: number
          status: 'Active' | 'Upcoming' | 'Completed'
          requirements: string[]
          evaluation_criteria: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          deadline: string
          prize_money: number
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          tags?: string[]
          participants_count?: number
          status?: 'Active' | 'Upcoming' | 'Completed'
          requirements?: string[]
          evaluation_criteria?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          deadline?: string
          prize_money?: number
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
          tags?: string[]
          participants_count?: number
          status?: 'Active' | 'Upcoming' | 'Completed'
          requirements?: string[]
          evaluation_criteria?: Json
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          repo_url: string
          deck_url: string | null
          video_url: string | null
          score: number | null
          feedback: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          repo_url: string
          deck_url?: string | null
          video_url?: string | null
          score?: number | null
          feedback?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          repo_url?: string
          deck_url?: string | null
          video_url?: string | null
          score?: number | null
          feedback?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          avatar_url: string | null
          bio: string | null
          github_url: string | null
          portfolio_url: string | null
          career_score: number | null
          badges: Json[] | null
          created_at: string | null
          updated_at: string | null
          full_name: string | null
          github_username: string | null
          role: 'individual' | 'company'
          company_details: Json | null
        }
        Insert: {
          id: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          career_score?: number | null
          badges?: Json[] | null
          created_at?: string | null
          updated_at?: string | null
          full_name?: string | null
          github_username?: string | null
          role?: 'individual' | 'company'
          company_details?: Json | null
        }
        Update: {
          id?: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          career_score?: number | null
          badges?: Json[] | null
          created_at?: string | null
          updated_at?: string | null
          full_name?: string | null
          github_username?: string | null
          role?: 'individual' | 'company'
          company_details?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      challenge_difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
      challenge_status: 'Active' | 'Upcoming' | 'Completed'
      user_role: 'individual' | 'company'
    }
  }
}