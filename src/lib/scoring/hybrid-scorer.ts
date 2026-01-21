/**
 * Hybrid Viral Scorer
 * Combines ML model, Gemini AI, and formula-based scoring
 */

import { calculateViralScore, calculateViralScoreWithBreakdown } from './viral-score'
import {
  getMLPrediction,
  isMLServiceAvailable,
  toMLInput,
  MLPrediction,
  MLServiceError,
} from '@/lib/api/ml-service'

// Scoring weights (should sum to 1.0)
const WEIGHTS = {
  ml: 0.5, // ML model (primary)
  gemini: 0.3, // Gemini AI (contextual)
  formula: 0.2, // Mathematical formula (baseline)
}

// Fallback weights when ML is unavailable
const FALLBACK_WEIGHTS = {
  ml: 0,
  gemini: 0.6,
  formula: 0.4,
}

export interface HybridScoreResult {
  // Final combined score
  final_score: number
  viral_category: 'low' | 'medium' | 'high' | 'ultra'

  // Individual scores
  ml_score: number | null
  ml_confidence: number | null
  ml_class: string | null
  gemini_score: number | null
  formula_score: number

  // Metadata
  weights_used: typeof WEIGHTS
  sources_available: {
    ml: boolean
    gemini: boolean
    formula: boolean
  }

  // Top features from ML
  top_features: Array<{ feature: string; importance: number }>

  // Model version
  model_version: string | null
}

export interface VideoData {
  views: number
  likes: number
  comments: number
  shares: number
  bookmarks?: number
  creator_followers?: number
  creator_verified?: boolean
  video_duration?: number
  title?: string
  caption?: string
  hashtags?: string[]
  watch_time_seconds?: number
  video_duration_seconds?: number
  follower_count?: number
  upload_date?: Date | string
  // Gemini analysis results (if already computed)
  gemini_viral_score?: number
  viral_score?: number
  [key: string]: unknown
}

/**
 * Get score category from numeric score
 */
function getCategory(score: number): 'low' | 'medium' | 'high' | 'ultra' {
  if (score >= 85) return 'ultra'
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

/**
 * Get hybrid viral score combining all available sources
 */
export async function getHybridViralScore(video: VideoData): Promise<HybridScoreResult> {
  // Calculate formula score (always available)
  const formulaScore = calculateViralScore({
    views: video.views,
    likes: video.likes,
    comments: video.comments,
    shares: video.shares,
    watch_time_seconds: video.watch_time_seconds,
    video_duration_seconds: video.video_duration_seconds || video.video_duration,
    follower_count: video.follower_count || video.creator_followers,
    upload_date: video.upload_date,
  })

  // Try ML prediction
  let mlScore: number | null = null
  let mlConfidence: number | null = null
  let mlClass: string | null = null
  let topFeatures: Array<{ feature: string; importance: number }> = []
  let modelVersion: string | null = null
  let mlAvailable = false

  if (process.env.ENABLE_ML_PREDICTIONS !== 'false') {
    try {
      const mlInput = toMLInput(video)
      const prediction = await getMLPrediction(mlInput)

      mlScore = prediction.viral_score
      mlConfidence = prediction.confidence
      mlClass = prediction.viral_class
      topFeatures = prediction.top_features
      modelVersion = prediction.model_version
      mlAvailable = true
    } catch (error) {
      if (error instanceof MLServiceError) {
        console.warn(`ML prediction unavailable: ${error.message}`)
      } else {
        console.error('ML prediction error:', error)
      }
    }
  }

  // Get Gemini score (may already be computed)
  const geminiScore = video.gemini_viral_score ?? video.viral_score ?? null
  const geminiAvailable = geminiScore !== null

  // Determine weights based on availability
  let weights: typeof WEIGHTS
  if (mlAvailable && geminiAvailable) {
    weights = WEIGHTS
  } else if (mlAvailable && !geminiAvailable) {
    weights = {
      ml: 0.65,
      gemini: 0,
      formula: 0.35,
    }
  } else if (!mlAvailable && geminiAvailable) {
    weights = FALLBACK_WEIGHTS
  } else {
    weights = {
      ml: 0,
      gemini: 0,
      formula: 1.0,
    }
  }

  // Calculate weighted final score
  let finalScore = 0
  if (mlAvailable && mlScore !== null) {
    finalScore += mlScore * weights.ml
  }
  if (geminiAvailable && geminiScore !== null) {
    finalScore += geminiScore * weights.gemini
  }
  finalScore += formulaScore * weights.formula

  finalScore = Math.round(Math.min(100, Math.max(0, finalScore)))

  return {
    final_score: finalScore,
    viral_category: getCategory(finalScore),
    ml_score: mlScore,
    ml_confidence: mlConfidence,
    ml_class: mlClass,
    gemini_score: geminiScore,
    formula_score: formulaScore,
    weights_used: weights,
    sources_available: {
      ml: mlAvailable,
      gemini: geminiAvailable,
      formula: true,
    },
    top_features: topFeatures,
    model_version: modelVersion,
  }
}

/**
 * Get detailed hybrid score with breakdown
 */
export async function getHybridViralScoreWithBreakdown(video: VideoData): Promise<{
  hybrid: HybridScoreResult
  formula_breakdown: ReturnType<typeof calculateViralScoreWithBreakdown>
}> {
  const [hybrid, formulaBreakdown] = await Promise.all([
    getHybridViralScore(video),
    Promise.resolve(
      calculateViralScoreWithBreakdown({
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        shares: video.shares,
        watch_time_seconds: video.watch_time_seconds,
        video_duration_seconds: video.video_duration_seconds || video.video_duration,
        follower_count: video.follower_count || video.creator_followers,
        upload_date: video.upload_date,
      })
    ),
  ])

  return {
    hybrid,
    formula_breakdown: formulaBreakdown,
  }
}

/**
 * Quick check if ML scoring is available
 */
export async function isMLScoringAvailable(): Promise<boolean> {
  if (process.env.ENABLE_ML_PREDICTIONS === 'false') {
    return false
  }
  return isMLServiceAvailable()
}
