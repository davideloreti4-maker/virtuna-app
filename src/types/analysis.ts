import type { Analysis } from './database'

/**
 * Video metadata extracted from TikTok
 */
export interface VideoMetadata {
  author: string | null
  authorNickname?: string | null
  authorAvatar: string
  description: string
  duration: number // seconds
  thumbnailUrl: string
  likeCount: number
  commentCount: number
  shareCount: number
  viewCount: number
  hashtags: string[]
  soundName: string
  soundAuthor: string | null
  soundPlayCount?: number
  createTime?: string
  // ML scoring metadata (added by hybrid scorer)
  ml_scoring?: MLScoringMetadata
}

/**
 * AI-generated suggestion for improving viral potential
 */
export interface AISuggestion {
  category: 'hook' | 'trend' | 'audio' | 'timing' | 'hashtag'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
}

/**
 * Full analysis result with typed metadata and suggestions
 */
export interface AnalysisWithDetails extends Omit<Analysis, 'metadata' | 'suggestions'> {
  metadata: VideoMetadata
  suggestions: AISuggestion[]
}

/**
 * Score breakdown for display
 */
export interface ScoreBreakdown {
  overall: number
  hook: number
  trend: number
  audio: number
  timing: number
  hashtag: number
}

/**
 * Score range classification
 */
export type ScoreLabel = 'ultra-viral' | 'viral' | 'high' | 'moderate' | 'low' | 'very-low'

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 90) return 'ultra-viral'
  if (score >= 80) return 'viral'
  if (score >= 60) return 'high'
  if (score >= 40) return 'moderate'
  if (score >= 20) return 'low'
  return 'very-low'
}

/**
 * Get display color class for score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-virtuna'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

/**
 * Get background color class for score badge
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30'
  if (score >= 60) return 'bg-virtuna/20 border-virtuna/30'
  if (score >= 40) return 'bg-amber-500/20 border-amber-500/30'
  return 'bg-red-500/20 border-red-500/30'
}

/**
 * Analysis request payload
 */
export interface AnalyzeRequest {
  videoUrl: string
}

/**
 * ML scoring metadata
 */
export interface MLScoringMetadata {
  ml_score: number | null
  ml_confidence: number | null
  ml_class: string | null
  gemini_score: number | null
  formula_score: number
  model_version: string | null
  top_features: Array<{ feature: string; importance: number }>
  scoring_method: 'hybrid' | 'ml' | 'gemini' | 'formula'
  weights_used: {
    ml: number
    gemini: number
    formula: number
  }
  sources_available: {
    ml: boolean
    gemini: boolean
    formula: boolean
  }
}

/**
 * Analysis response from API
 */
export interface AnalyzeResponse {
  analysis: AnalysisWithDetails
  mlScoring?: MLScoringMetadata
}

/**
 * Analyses list response with pagination
 */
export interface AnalysesListResponse {
  analyses: AnalysisWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Analyses list query params
 */
export interface AnalysesQueryParams {
  page?: number
  limit?: number
  sort?: 'date' | 'score'
  order?: 'asc' | 'desc'
  minScore?: number
  maxScore?: number
  search?: string
}
