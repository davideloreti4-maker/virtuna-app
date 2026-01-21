/**
 * Formula-based Viral Score Calculator
 * Calculates a 0-100 score using engagement, retention, velocity, and reach metrics
 */

export interface VideoMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  watch_time_seconds?: number
  video_duration_seconds?: number
  follower_count?: number
  upload_date?: Date | string
}

export interface ScoreBreakdown {
  total_score: number
  breakdown: {
    engagement: { score: number; weight: string; description: string }
    retention: { score: number; weight: string; description: string }
    velocity: { score: number; weight: string; description: string }
    relative_reach: { score: number; weight: string; description: string }
  }
}

function calculateEngagementScore(
  likes: number,
  comments: number,
  shares: number,
  views: number
): number {
  if (views === 0) return 0
  const engagement_rate = ((likes + comments * 2 + shares * 3) / views) * 100
  return Math.min((engagement_rate / 10) * 100, 100)
}

function calculateRetentionScore(
  watch_time_seconds?: number,
  video_duration_seconds?: number
): number {
  if (!watch_time_seconds || !video_duration_seconds || video_duration_seconds === 0) {
    return 75 // Default assumption
  }
  return Math.min((watch_time_seconds / video_duration_seconds) * 100, 100)
}

function calculateVelocityScore(views: number, upload_date?: Date | string): number {
  if (!upload_date) {
    return views > 100000 ? 85 : views > 10000 ? 70 : 50
  }

  const uploadTime = typeof upload_date === 'string' ? new Date(upload_date) : upload_date
  const days_since_upload = Math.max(
    (Date.now() - uploadTime.getTime()) / (1000 * 60 * 60 * 24),
    1
  )
  const views_per_day = views / days_since_upload

  return Math.min((views_per_day / 10000) * 100, 100)
}

function calculateRelativeScore(views: number, follower_count?: number): number {
  if (!follower_count || follower_count === 0) {
    return views > 1000000 ? 90 : views > 100000 ? 75 : 60
  }

  const relative_reach = views / follower_count
  return Math.min((relative_reach / 10) * 100, 100)
}

/**
 * Calculate viral score from video metrics
 * Returns a score from 0-100
 */
export function calculateViralScore(videoData: VideoMetrics): number {
  const engagementScore = calculateEngagementScore(
    videoData.likes,
    videoData.comments,
    videoData.shares,
    videoData.views
  )

  const retentionScore = calculateRetentionScore(
    videoData.watch_time_seconds,
    videoData.video_duration_seconds
  )

  const velocityScore = calculateVelocityScore(videoData.views, videoData.upload_date)

  const relativeScore = calculateRelativeScore(videoData.views, videoData.follower_count)

  // Weighted combination
  const viralScore =
    engagementScore * 0.3 + // 30% - Engagement
    retentionScore * 0.25 + // 25% - Retention
    velocityScore * 0.25 + // 25% - Velocity
    relativeScore * 0.2 // 20% - Relative reach

  return Math.round(Math.min(viralScore, 100))
}

/**
 * Calculate viral score with detailed breakdown
 */
export function calculateViralScoreWithBreakdown(videoData: VideoMetrics): ScoreBreakdown {
  const engagementScore = Math.round(
    calculateEngagementScore(
      videoData.likes,
      videoData.comments,
      videoData.shares,
      videoData.views
    )
  )

  const retentionScore = Math.round(
    calculateRetentionScore(videoData.watch_time_seconds, videoData.video_duration_seconds)
  )

  const velocityScore = Math.round(calculateVelocityScore(videoData.views, videoData.upload_date))

  const relativeScore = Math.round(
    calculateRelativeScore(videoData.views, videoData.follower_count)
  )

  const viralScore = Math.round(
    engagementScore * 0.3 + retentionScore * 0.25 + velocityScore * 0.25 + relativeScore * 0.2
  )

  return {
    total_score: Math.min(viralScore, 100),
    breakdown: {
      engagement: {
        score: engagementScore,
        weight: '30%',
        description: 'Likes, comments & shares relative to views',
      },
      retention: {
        score: retentionScore,
        weight: '25%',
        description: 'Average watch time vs video length',
      },
      velocity: {
        score: velocityScore,
        weight: '25%',
        description: 'Views gained per day since upload',
      },
      relative_reach: {
        score: relativeScore,
        weight: '20%',
        description: 'Views relative to follower count',
      },
    },
  }
}

/**
 * Get category label for score
 */
export function getScoreCategory(score: number): 'low' | 'medium' | 'high' | 'ultra' {
  if (score >= 85) return 'ultra'
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

/**
 * Get human-readable label for score
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Elite Viral'
  if (score >= 70) return 'High Potential'
  if (score >= 50) return 'Trending'
  if (score >= 30) return 'Growing'
  return 'New'
}
