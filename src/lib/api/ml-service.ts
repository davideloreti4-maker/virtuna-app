/**
 * ML Service API Client
 * Handles communication with the FastAPI ML service on Railway
 */

import type { AISuggestion } from '@/types/analysis'

// Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY || ''
const ML_TIMEOUT_MS = 10000 // 10 second timeout

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MLVideoInput {
  views: number
  likes: number
  comments: number
  shares: number
  bookmarks?: number
  creator_followers: number
  creator_verified?: boolean
  creator_following?: number
  video_duration?: number
  video_width?: number
  video_height?: number
  title?: string
  hashtags?: string[]
  song_id?: string | null
  song_title?: string | null
  song_artist?: string | null
  song_duration?: number | null
  creator_username?: string | null
  creator_total_videos?: number
  uploaded_at?: string | null
}

export interface MLPrediction {
  viral_class: 'low' | 'medium' | 'high' | 'ultra'
  viral_score: number
  confidence: number
  probabilities: {
    low: number
    medium: number
    high: number
    ultra: number
  }
  top_features: Array<{ feature: string; importance: number }>
  model_version: string
  prediction_time_ms: number
}

export interface MLHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  model_loaded: boolean
  model_version: string | null
  model_accuracy: number | null
  last_trained: string | null
  uptime_seconds: number
}

export interface MLModelInfo {
  version: string
  accuracy: number
  trained_at: string
  feature_count: number
}

interface MLAnalysisRequest {
  videoId: string
  metadata: {
    description: string
    hashtags: string[]
    duration: number
    soundName: string
    engagement: {
      likes: number
      comments: number
      shares: number
      views: number
    }
  }
}

interface MLAnalysisResponse {
  overallScore: number
  hookScore: number
  trendScore: number
  audioScore: number
  timingScore: number
  hashtagScore: number
  suggestions: AISuggestion[]
}

// ============================================================================
// Error Handling
// ============================================================================

export class MLServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'MLServiceError'
  }
}

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Make a request to the ML service with timeout and retry
 */
async function mlFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(ML_SERVICE_API_KEY && { 'X-API-Key': ML_SERVICE_API_KEY }),
    ...(options.headers || {}),
  }

  try {
    const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new MLServiceError(
        error.error || `ML service error: ${response.status}`,
        response.status,
        error.code
      )
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof MLServiceError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new MLServiceError('ML service timeout', 504, 'TIMEOUT')
      }

      // Retry on network errors
      if (retries > 0 && error.message.includes('fetch')) {
        console.warn(`ML service retry (${retries} left): ${error.message}`)
        await new Promise((r) => setTimeout(r, 1000))
        return mlFetch(endpoint, options, retries - 1)
      }
    }

    throw new MLServiceError(
      `ML service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      503,
      'SERVICE_UNAVAILABLE'
    )
  }
}

/**
 * Get ML prediction for a single video
 */
export async function getMLPrediction(video: MLVideoInput): Promise<MLPrediction> {
  return mlFetch<MLPrediction>('/predict', {
    method: 'POST',
    body: JSON.stringify(video),
  })
}

/**
 * Get ML predictions for multiple videos (batch)
 */
export async function getMLPredictionsBatch(
  videos: MLVideoInput[]
): Promise<{ predictions: MLPrediction[]; total_time_ms: number }> {
  return mlFetch('/predict/batch', {
    method: 'POST',
    body: JSON.stringify({ videos }),
  })
}

/**
 * Check ML service health
 */
export async function checkMLHealth(): Promise<MLHealthStatus> {
  return mlFetch<MLHealthStatus>('/health', { method: 'GET' })
}

/**
 * Check if ML service is available
 */
export async function isMLServiceAvailable(): Promise<boolean> {
  try {
    const health = await checkMLHealth()
    return health.status === 'healthy' && health.model_loaded
  } catch {
    return false
  }
}

/**
 * Get model information
 */
export async function getMLModelInfo(): Promise<MLModelInfo> {
  return mlFetch('/model/info', { method: 'GET' })
}

// ============================================================================
// Data Conversion Helpers
// ============================================================================

/**
 * Convert raw video data to ML input format
 */
export function toMLInput(video: {
  views?: number
  likes?: number
  comments?: number
  shares?: number
  bookmarks?: number
  creator_followers?: number
  creator_verified?: boolean
  video_duration?: number
  title?: string
  caption?: string
  hashtags?: string[]
  song_id?: string | null
  song_title?: string | null
  song_artist?: string | null
  song_duration?: number | null
  creator_username?: string | null
  creator_total_videos?: number
  uploaded_at?: string | null
  creator_following?: number
  video_width?: number
  video_height?: number
  [key: string]: unknown
}): MLVideoInput {
  return {
    views: video.views || 0,
    likes: video.likes || 0,
    comments: video.comments || 0,
    shares: video.shares || 0,
    bookmarks: video.bookmarks || 0,
    creator_followers: video.creator_followers || 0,
    creator_verified: video.creator_verified || false,
    video_duration: video.video_duration || 30,
    title: video.title || video.caption || '',
    hashtags: video.hashtags || [],
    song_id: (video.song_id as string | null) || null,
    song_title: (video.song_title as string | null) || null,
    song_artist: (video.song_artist as string | null) || null,
    song_duration: (video.song_duration as number | null) || null,
    creator_username: (video.creator_username as string | null) || null,
    creator_total_videos: video.creator_total_videos || 0,
    uploaded_at: (video.uploaded_at as string | null) || null,
    creator_following: video.creator_following || 0,
    video_width: video.video_width || 1080,
    video_height: video.video_height || 1920,
  }
}

// ============================================================================
// Legacy Analysis Functions (for backward compatibility)
// ============================================================================

// Scoring weights
const WEIGHTS = {
  hook: 0.25,
  trend: 0.25,
  audio: 0.2,
  timing: 0.15,
  hashtag: 0.15,
}

/**
 * Analyze video using ML service
 * Falls back to mock analysis if ML service is unavailable
 */
export async function analyzeVideo(request: MLAnalysisRequest): Promise<MLAnalysisResponse> {
  // Use real ML service if available
  if (ML_SERVICE_URL && ML_SERVICE_URL !== 'http://localhost:8000') {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ML_SERVICE_API_KEY || '',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        console.error('ML service error:', response.status)
        return generateMockAnalysis(request)
      }

      return response.json()
    } catch (error) {
      console.error('ML service connection error:', error)
      return generateMockAnalysis(request)
    }
  }

  return generateMockAnalysis(request)
}

/**
 * Generate mock analysis scores for development
 */
function generateMockAnalysis(request: MLAnalysisRequest): MLAnalysisResponse {
  const { metadata } = request

  const hookScore = calculateHookScore(metadata.description, metadata.duration)
  const trendScore = calculateTrendScore(metadata.hashtags)
  const audioScore = calculateAudioScore(metadata.soundName)
  const timingScore = calculateTimingScore()
  const hashtagScore = calculateHashtagScore(metadata.hashtags)

  const overallScore = Math.round(
    hookScore * WEIGHTS.hook +
      trendScore * WEIGHTS.trend +
      audioScore * WEIGHTS.audio +
      timingScore * WEIGHTS.timing +
      hashtagScore * WEIGHTS.hashtag
  )

  const suggestions = generateSuggestions(hookScore, trendScore, audioScore, timingScore, hashtagScore)

  return {
    overallScore,
    hookScore,
    trendScore,
    audioScore,
    timingScore,
    hashtagScore,
    suggestions,
  }
}

function calculateHookScore(description: string, duration: number): number {
  let score = 60

  if (description.length < 100) score += 10
  if (description.length < 50) score += 5

  if (duration <= 30) score += 10
  if (duration <= 15) score += 5

  const hookKeywords = ['watch', 'wait', 'must see', 'crazy', 'unbelievable', 'omg', 'pov']
  hookKeywords.forEach((keyword) => {
    if (description.toLowerCase().includes(keyword)) score += 3
  })

  score += Math.floor(Math.random() * 10) - 5

  return Math.min(100, Math.max(0, score))
}

function calculateTrendScore(hashtags: string[]): number {
  let score = 55

  const trendingTags = ['fyp', 'foryou', 'foryoupage', 'viral', 'trending', 'xyzbca']
  const popularCategories = ['dance', 'comedy', 'storytime', 'grwm', 'haul', 'recipe', 'hack']

  hashtags.forEach((tag) => {
    const lowercaseTag = tag.toLowerCase()
    if (trendingTags.includes(lowercaseTag)) score += 5
    if (popularCategories.some((cat) => lowercaseTag.includes(cat))) score += 8
  })

  if (hashtags.length >= 3 && hashtags.length <= 5) score += 10
  if (hashtags.length > 10) score -= 10

  score += Math.floor(Math.random() * 15) - 7

  return Math.min(100, Math.max(0, score))
}

function calculateAudioScore(soundName: string): number {
  let score = 50

  if (soundName.toLowerCase().includes('original')) {
    score += Math.floor(Math.random() * 20) + 10
  }

  const popularArtists = ['drake', 'taylor', 'doja', 'sza', 'metro', 'kendrick']
  if (popularArtists.some((artist) => soundName.toLowerCase().includes(artist))) {
    score += 25
  }

  if (soundName.toLowerCase().includes('viral') || soundName.toLowerCase().includes('trending')) {
    score += 20
  }

  score += Math.floor(Math.random() * 20) - 10

  return Math.min(100, Math.max(0, score))
}

function calculateTimingScore(): number {
  const baseScore = 65
  const variance = Math.floor(Math.random() * 25) - 10
  return Math.min(100, Math.max(0, baseScore + variance))
}

function calculateHashtagScore(hashtags: string[]): number {
  let score = 55

  if (hashtags.length >= 3 && hashtags.length <= 5) score += 15
  else if (hashtags.length >= 1 && hashtags.length <= 7) score += 8
  else if (hashtags.length > 7) score -= 5

  const hasNiche = hashtags.some((tag) => tag.length > 10)
  const hasBroad = hashtags.some((tag) => ['fyp', 'viral', 'trending'].includes(tag.toLowerCase()))

  if (hasNiche && hasBroad) score += 15

  score += Math.floor(Math.random() * 15) - 7

  return Math.min(100, Math.max(0, score))
}

function generateSuggestions(
  hookScore: number,
  trendScore: number,
  audioScore: number,
  timingScore: number,
  hashtagScore: number
): AISuggestion[] {
  const suggestions: AISuggestion[] = []

  if (hookScore < 70) {
    suggestions.push({
      category: 'hook',
      priority: hookScore < 50 ? 'high' : 'medium',
      title: 'Strengthen Your Hook',
      description:
        'The first 3 seconds are crucial. Start with action, a question, or a surprising statement.',
    })
  }

  if (trendScore < 65) {
    suggestions.push({
      category: 'trend',
      priority: trendScore < 45 ? 'high' : 'medium',
      title: 'Align with Current Trends',
      description: 'Consider incorporating trending formats, sounds, or challenges.',
    })
  }

  if (audioScore < 60) {
    suggestions.push({
      category: 'audio',
      priority: audioScore < 40 ? 'high' : 'medium',
      title: 'Use Trending Audio',
      description: 'Videos using trending sounds get up to 40% more reach.',
    })
  }

  if (timingScore < 65) {
    suggestions.push({
      category: 'timing',
      priority: timingScore < 45 ? 'high' : 'medium',
      title: 'Optimize Posting Time',
      description: 'Peak engagement: 7-9 PM EST weekdays, 11 AM-1 PM weekends.',
    })
  }

  if (hashtagScore < 60) {
    suggestions.push({
      category: 'hashtag',
      priority: hashtagScore < 40 ? 'high' : 'medium',
      title: 'Optimize Your Hashtags',
      description: 'Use 3-5 hashtags mixing broad reach tags with niche-specific ones.',
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      category: 'hook',
      priority: 'low',
      title: 'Looking Good!',
      description: 'Your video has strong viral potential. Post at peak hours for maximum engagement.',
    })
  }

  return suggestions
}

/**
 * Check ML service health (legacy function)
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  if (!ML_SERVICE_URL || ML_SERVICE_URL === 'http://localhost:8000') {
    return false
  }

  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'X-API-Key': ML_SERVICE_API_KEY || '',
      },
    })

    return response.ok
  } catch {
    return false
  }
}
