import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchTikTokVideo } from '@/lib/api/tiktok'
import { analyzeVideo } from '@/lib/api/ml-service'
import { getHybridViralScore, type VideoData } from '@/lib/scoring/hybrid-scorer'
import { getVariant, logExposure, type ScoringMethod } from '@/lib/scoring/ab-test'
import { analyzeSchema } from '@/lib/utils/validation'
import {
  XP_ACTIONS,
  calculateLevel,
  shouldIncrementStreak,
  getStreakReward,
} from '@/lib/gamification'
import type { AnalysisWithDetails, MLScoringMetadata } from '@/types/analysis'
import type { Profile } from '@/types/database'

/**
 * POST /api/analyze
 * Analyze a TikTok video for viral potential
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check quota
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Cast profile to typed version
    const userProfile = profile as unknown as Profile

    // Check analysis quota
    if (userProfile.analyses_count >= userProfile.analyses_limit) {
      return NextResponse.json(
        {
          error: 'Analysis limit reached',
          upgradeUrl: '/settings?upgrade=true',
          currentPlan: userProfile.plan,
          limit: userProfile.analyses_limit,
          used: userProfile.analyses_count,
        },
        { status: 403 }
      )
    }

    // Validate input
    const body = await request.json()
    const parsed = analyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Fetch video metadata from TikTok
    let videoData
    try {
      videoData = await fetchTikTokVideo(parsed.data.videoUrl)
    } catch (error) {
      console.error('TikTok fetch error:', error)
      return NextResponse.json(
        { error: 'Could not fetch video. Make sure the URL is correct and the video is public.' },
        { status: 400 }
      )
    }

    // Extract video ID from URL
    const videoIdMatch = parsed.data.videoUrl.match(/(\d{19}|\w{8,})/)
    const videoId = videoIdMatch ? videoIdMatch[1] : `vid_${Date.now()}`

    // Get A/B test variant for scoring method
    const variant: ScoringMethod = getVariant(user.id)
    logExposure(user.id, variant, { endpoint: 'analyze', videoId })

    // Run legacy ML analysis for sub-scores (hook, trend, audio, timing, hashtag)
    const mlResult = await analyzeVideo({
      videoId,
      metadata: {
        description: videoData.description,
        hashtags: videoData.hashtags,
        duration: videoData.duration,
        soundName: videoData.soundName,
        engagement: {
          likes: videoData.likeCount,
          comments: videoData.commentCount,
          shares: videoData.shareCount,
          views: videoData.viewCount,
        },
      },
    })

    // Run hybrid scoring for the overall viral score
    const hybridInput: VideoData = {
      views: videoData.viewCount,
      likes: videoData.likeCount,
      comments: videoData.commentCount,
      shares: videoData.shareCount,
      creator_followers: 0, // Not available from TikTok scraper
      video_duration: videoData.duration,
      title: videoData.description,
      hashtags: videoData.hashtags,
      // Pass Gemini score if we had one (for future integration)
      gemini_viral_score: undefined,
    }

    const hybridScore = await getHybridViralScore(hybridInput)

    // Use hybrid score as the overall score
    const overallScore = hybridScore.final_score

    // Build ML scoring metadata for response
    const mlScoringMetadata: MLScoringMetadata = {
      ml_score: hybridScore.ml_score,
      ml_confidence: hybridScore.ml_confidence,
      ml_class: hybridScore.ml_class,
      gemini_score: hybridScore.gemini_score,
      formula_score: hybridScore.formula_score,
      model_version: hybridScore.model_version,
      top_features: hybridScore.top_features,
      scoring_method: variant,
      weights_used: hybridScore.weights_used,
      sources_available: hybridScore.sources_available,
    }

    const processingTime = Date.now() - startTime

    // Save to database
    const insertData = {
      user_id: user.id,
      video_url: parsed.data.videoUrl,
      video_id: videoId,
      overall_score: overallScore, // Use hybrid score
      hook_score: mlResult.hookScore,
      trend_score: mlResult.trendScore,
      audio_score: mlResult.audioScore,
      timing_score: mlResult.timingScore,
      hashtag_score: mlResult.hashtagScore,
      metadata: {
        ...videoData,
        ml_scoring: mlScoringMetadata, // Store ML metadata
      } as unknown,
      suggestions: mlResult.suggestions as unknown,
      processing_time: processingTime,
    }

    const { data: analysis, error: insertError } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('analyses') as any)
      .insert(insertData)
      .select()
      .single()

    if (insertError || !analysis) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    // Note: The analyses_count is incremented automatically by a database trigger

    // Update gamification data
    const isViral = overallScore >= 85
    const isFirstViral = isViral && (userProfile.total_viral_count || 0) === 0
    const shouldIncrement = shouldIncrementStreak(userProfile.last_analysis_date || null)

    // Calculate XP earned
    let xpEarned = XP_ACTIONS.analysis_complete
    if (isFirstViral) {
      xpEarned += XP_ACTIONS.first_viral_score
    } else if (isViral) {
      xpEarned += XP_ACTIONS.viral_score
    }

    // Calculate new streak
    const newStreak = shouldIncrement
      ? (userProfile.streak_days || 0) + 1
      : (userProfile.streak_days || 0)

    // Add streak XP if streak is active
    if (shouldIncrement && newStreak > 1) {
      const streakReward = getStreakReward(newStreak)
      xpEarned += streakReward.xp
    }

    // Calculate new total XP and level
    const newXp = (userProfile.xp || 0) + xpEarned
    const newLevel = calculateLevel(newXp)

    // Update profile with gamification data
    const { error: updateError } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('profiles') as any)
      .update({
        xp: newXp,
        level: newLevel,
        streak_days: newStreak,
        last_analysis_date: new Date().toISOString(),
        total_viral_count: isViral
          ? (userProfile.total_viral_count || 0) + 1
          : (userProfile.total_viral_count || 0),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Gamification update error:', updateError)
      // Don't fail the request, gamification is not critical
    }

    // Cast to expected type and override metadata/suggestions with typed versions
    const result = {
      ...(analysis as unknown as AnalysisWithDetails),
      metadata: videoData,
      suggestions: mlResult.suggestions,
    }

    return NextResponse.json({
      analysis: result,
      processingTime,
      remaining: userProfile.analyses_limit - userProfile.analyses_count - 1,
      gamification: {
        xpEarned,
        newXp,
        newLevel,
        streakDays: newStreak,
        isViral,
        isFirstViral,
      },
      mlScoring: mlScoringMetadata,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
