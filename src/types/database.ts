/**
 * Supabase Database Types
 * Generated from database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          plan: 'free' | 'pro' | 'agency'
          analyses_count: number
          analyses_limit: number
          // Gamification fields
          xp: number
          level: number
          streak_days: number
          last_analysis_date: string | null
          total_viral_count: number
          badges: string[]
          // Stripe fields
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          // Onboarding
          has_seen_onboarding: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'agency'
          analyses_count?: number
          analyses_limit?: number
          // Gamification fields
          xp?: number
          level?: number
          streak_days?: number
          last_analysis_date?: string | null
          total_viral_count?: number
          badges?: string[]
          // Stripe fields
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          // Onboarding
          has_seen_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'agency'
          analyses_count?: number
          analyses_limit?: number
          // Gamification fields
          xp?: number
          level?: number
          streak_days?: number
          last_analysis_date?: string | null
          total_viral_count?: number
          badges?: string[]
          // Stripe fields
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          // Onboarding
          has_seen_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          video_url: string
          video_id: string
          overall_score: number
          hook_score: number
          trend_score: number
          audio_score: number
          timing_score: number
          hashtag_score: number
          metadata: Json
          suggestions: Json
          processing_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_url: string
          video_id: string
          overall_score: number
          hook_score: number
          trend_score: number
          audio_score: number
          timing_score: number
          hashtag_score: number
          metadata?: Json
          suggestions?: Json
          processing_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_url?: string
          video_id?: string
          overall_score?: number
          hook_score?: number
          trend_score?: number
          audio_score?: number
          timing_score?: number
          hashtag_score?: number
          metadata?: Json
          suggestions?: Json
          processing_time?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analyses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      saved_hooks: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          hook_text: string
          hook_type: 'question' | 'statement' | 'story' | 'shock' | 'challenge' | 'other'
          effectiveness_score: number | null
          notes: string | null
          tags: string[]
          source_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          hook_text: string
          hook_type?: 'question' | 'statement' | 'story' | 'shock' | 'challenge' | 'other'
          effectiveness_score?: number | null
          notes?: string | null
          tags?: string[]
          source_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          hook_text?: string
          hook_type?: 'question' | 'statement' | 'story' | 'shock' | 'challenge' | 'other'
          effectiveness_score?: number | null
          notes?: string | null
          tags?: string[]
          source_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_hooks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saved_hooks_analysis_id_fkey'
            columns: ['analysis_id']
            isOneToOne: false
            referencedRelation: 'analyses'
            referencedColumns: ['id']
          }
        ]
      }
      uploaded_analyses: {
        Row: {
          id: string
          user_id: string
          file_url: string
          file_name: string
          file_size: number | null
          duration: number | null
          status: 'uploading' | 'processing' | 'completed' | 'failed'
          overall_score: number | null
          hook_score: number | null
          visual_score: number | null
          audio_score: number | null
          pacing_score: number | null
          ai_feedback: Json | null
          suggestions: Json | null
          processing_time: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          file_name: string
          file_size?: number | null
          duration?: number | null
          status?: 'uploading' | 'processing' | 'completed' | 'failed'
          overall_score?: number | null
          hook_score?: number | null
          visual_score?: number | null
          audio_score?: number | null
          pacing_score?: number | null
          ai_feedback?: Json | null
          suggestions?: Json | null
          processing_time?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          file_name?: string
          file_size?: number | null
          duration?: number | null
          status?: 'uploading' | 'processing' | 'completed' | 'failed'
          overall_score?: number | null
          hook_score?: number | null
          visual_score?: number | null
          audio_score?: number | null
          pacing_score?: number | null
          ai_feedback?: Json | null
          suggestions?: Json | null
          processing_time?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'uploaded_analyses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: 'free' | 'pro' | 'agency'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type ProfileInsert = InsertTables<'profiles'>
export type ProfileUpdate = UpdateTables<'profiles'>

export type Analysis = Tables<'analyses'>
export type AnalysisInsert = InsertTables<'analyses'>
export type AnalysisUpdate = UpdateTables<'analyses'>

export type SavedHook = Tables<'saved_hooks'>
export type SavedHookInsert = InsertTables<'saved_hooks'>
export type SavedHookUpdate = UpdateTables<'saved_hooks'>

export type UploadedAnalysis = Tables<'uploaded_analyses'>
export type UploadedAnalysisInsert = InsertTables<'uploaded_analyses'>
export type UploadedAnalysisUpdate = UpdateTables<'uploaded_analyses'>
