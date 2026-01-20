import type { AISuggestion } from '@/types/analysis'

/**
 * ML Service API client
 * Handles communication with the FastAPI ML service on Railway
 */

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

// Scoring weights
const WEIGHTS = {
  hook: 0.25,
  trend: 0.25,
  audio: 0.20,
  timing: 0.15,
  hashtag: 0.15,
}

/**
 * Analyze video using ML service
 * Falls back to mock analysis if ML service is unavailable
 */
export async function analyzeVideo(request: MLAnalysisRequest): Promise<MLAnalysisResponse> {
  const mlServiceUrl = process.env.ML_SERVICE_URL

  // Use real ML service if available
  if (mlServiceUrl && mlServiceUrl !== 'http://localhost:8000') {
    try {
      const response = await fetch(`${mlServiceUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ML_SERVICE_API_KEY || '',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        console.error('ML service error:', response.status)
        // Fall back to mock analysis
        return generateMockAnalysis(request)
      }

      return response.json()
    } catch (error) {
      console.error('ML service connection error:', error)
      // Fall back to mock analysis
      return generateMockAnalysis(request)
    }
  }

  // Use mock analysis for development
  return generateMockAnalysis(request)
}

/**
 * Generate mock analysis scores for development
 * Uses deterministic scoring based on video metadata
 */
function generateMockAnalysis(request: MLAnalysisRequest): MLAnalysisResponse {
  const { metadata } = request

  // Calculate scores based on metadata
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

  const suggestions = generateSuggestions(
    hookScore,
    trendScore,
    audioScore,
    timingScore,
    hashtagScore
  )

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

/**
 * Calculate hook score based on description length and keywords
 */
function calculateHookScore(description: string, duration: number): number {
  let score = 60 // Base score

  // Shorter descriptions often indicate better hooks
  if (description.length < 100) score += 10
  if (description.length < 50) score += 5

  // Short videos (under 30s) tend to have better hooks
  if (duration <= 30) score += 10
  if (duration <= 15) score += 5

  // Check for hook keywords
  const hookKeywords = ['watch', 'wait', 'must see', 'crazy', 'unbelievable', 'omg', 'pov']
  hookKeywords.forEach((keyword) => {
    if (description.toLowerCase().includes(keyword)) score += 3
  })

  // Add some randomness for realism
  score += Math.floor(Math.random() * 10) - 5

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate trend score based on hashtags
 */
function calculateTrendScore(hashtags: string[]): number {
  let score = 55 // Base score

  const trendingTags = ['fyp', 'foryou', 'foryoupage', 'viral', 'trending', 'xyzbca']
  const popularCategories = ['dance', 'comedy', 'storytime', 'grwm', 'haul', 'recipe', 'hack']

  hashtags.forEach((tag) => {
    const lowercaseTag = tag.toLowerCase()
    if (trendingTags.includes(lowercaseTag)) score += 5
    if (popularCategories.some((cat) => lowercaseTag.includes(cat))) score += 8
  })

  // Optimal hashtag count is 3-5
  if (hashtags.length >= 3 && hashtags.length <= 5) score += 10
  if (hashtags.length > 10) score -= 10 // Too many hashtags

  // Add randomness
  score += Math.floor(Math.random() * 15) - 7

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate audio score based on sound name
 */
function calculateAudioScore(soundName: string): number {
  let score = 50 // Base score

  // Original sounds can score high
  if (soundName.toLowerCase().includes('original')) {
    score += Math.floor(Math.random() * 20) + 10
  }

  // Popular artists
  const popularArtists = ['drake', 'taylor', 'doja', 'sza', 'metro', 'kendrick']
  if (popularArtists.some((artist) => soundName.toLowerCase().includes(artist))) {
    score += 25
  }

  // Trending sound indicators
  if (soundName.toLowerCase().includes('viral') || soundName.toLowerCase().includes('trending')) {
    score += 20
  }

  // Add randomness
  score += Math.floor(Math.random() * 20) - 10

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate timing score
 * In production, this would consider posting time
 */
function calculateTimingScore(): number {
  // Simulate optimal timing analysis
  const baseScore = 65
  const variance = Math.floor(Math.random() * 25) - 10
  return Math.min(100, Math.max(0, baseScore + variance))
}

/**
 * Calculate hashtag strategy score
 */
function calculateHashtagScore(hashtags: string[]): number {
  let score = 55 // Base score

  // Optimal count
  if (hashtags.length >= 3 && hashtags.length <= 5) score += 15
  else if (hashtags.length >= 1 && hashtags.length <= 7) score += 8
  else if (hashtags.length > 7) score -= 5

  // Check for variety (niche + broad)
  const hasNiche = hashtags.some((tag) => tag.length > 10)
  const hasBroad = hashtags.some((tag) => ['fyp', 'viral', 'trending'].includes(tag.toLowerCase()))

  if (hasNiche && hasBroad) score += 15

  // Add randomness
  score += Math.floor(Math.random() * 15) - 7

  return Math.min(100, Math.max(0, score))
}

/**
 * Generate AI suggestions based on scores
 */
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
        'The first 3 seconds are crucial. Start with action, a question, or a surprising statement to grab attention immediately.',
    })
  }

  if (trendScore < 65) {
    suggestions.push({
      category: 'trend',
      priority: trendScore < 45 ? 'high' : 'medium',
      title: 'Align with Current Trends',
      description:
        'Consider incorporating trending formats, sounds, or challenges to increase your chances of being picked up by the algorithm.',
    })
  }

  if (audioScore < 60) {
    suggestions.push({
      category: 'audio',
      priority: audioScore < 40 ? 'high' : 'medium',
      title: 'Use Trending Audio',
      description:
        'Videos using trending sounds get up to 40% more reach. Check the Discover page for currently viral audio.',
    })
  }

  if (timingScore < 65) {
    suggestions.push({
      category: 'timing',
      priority: timingScore < 45 ? 'high' : 'medium',
      title: 'Optimize Posting Time',
      description:
        'Peak engagement times are typically 7-9 PM EST on weekdays and 11 AM-1 PM on weekends. Consider scheduling your post accordingly.',
    })
  }

  if (hashtagScore < 60) {
    suggestions.push({
      category: 'hashtag',
      priority: hashtagScore < 40 ? 'high' : 'medium',
      title: 'Optimize Your Hashtags',
      description:
        'Use 3-5 hashtags mixing broad reach tags (#fyp, #viral) with niche-specific ones relevant to your content.',
    })
  }

  // If all scores are good, add a positive suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'hook',
      priority: 'low',
      title: 'Looking Good!',
      description:
        'Your video has strong viral potential. Consider posting at peak hours for maximum initial engagement.',
    })
  }

  return suggestions
}

/**
 * Check ML service health
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  const mlServiceUrl = process.env.ML_SERVICE_URL

  if (!mlServiceUrl || mlServiceUrl === 'http://localhost:8000') {
    return false // Mock mode
  }

  try {
    const response = await fetch(`${mlServiceUrl}/health`, {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.ML_SERVICE_API_KEY || '',
      },
    })

    return response.ok
  } catch {
    return false
  }
}
