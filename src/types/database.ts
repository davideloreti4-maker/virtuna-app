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
