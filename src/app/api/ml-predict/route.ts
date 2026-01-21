/**
 * ML Prediction API Route
 * Proxies requests to the ML service with A/B testing and fallback scoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { getHybridViralScore } from '@/lib/scoring/hybrid-scorer'
import { getMLPrediction, toMLInput, checkMLHealth } from '@/lib/api/ml-service'
import { getVariant, logExposure, type ScoringMethod } from '@/lib/scoring/ab-test'
import { calculateViralScore } from '@/lib/scoring/viral-score'

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100 // requests per minute
const RATE_WINDOW_MS = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

function getViralCategory(score: number): 'low' | 'medium' | 'high' | 'ultra' {
  if (score >= 85) return 'ultra'
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (typeof body.views !== 'number' || typeof body.likes !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: views, likes' },
        { status: 400 }
      )
    }

    // Get user ID for A/B testing (from auth or generate)
    const userId = body.user_id || request.headers.get('x-user-id') || ip
    const variant: ScoringMethod = getVariant(userId)

    // Log A/B test exposure
    logExposure(userId, variant, { endpoint: 'ml-predict' })

    let result

    switch (variant) {
      case 'ml':
        // ML-only scoring
        try {
          const mlInput = toMLInput(body)
          const prediction = await getMLPrediction(mlInput)
          result = {
            viral_score: prediction.viral_score,
            viral_category: prediction.viral_class,
            confidence: prediction.confidence,
            source: 'ml',
            model_version: prediction.model_version,
            top_features: prediction.top_features,
            probabilities: prediction.probabilities,
          }
        } catch {
          // Fallback to formula
          const score = calculateViralScore(body)
          result = {
            viral_score: score,
            viral_category: getViralCategory(score),
            source: 'formula_fallback',
          }
        }
        break

      case 'gemini':
        // Gemini scoring is handled elsewhere, return placeholder
        result = {
          viral_score: body.gemini_viral_score || calculateViralScore(body),
          viral_category: body.viral_category || 'medium',
          source: 'gemini',
        }
        break

      case 'formula':
        // Formula-only scoring
        const formulaScore = calculateViralScore(body)
        result = {
          viral_score: formulaScore,
          viral_category: getViralCategory(formulaScore),
          source: 'formula',
        }
        break

      case 'hybrid':
      default:
        // Hybrid scoring (default)
        const hybrid = await getHybridViralScore(body)
        result = {
          viral_score: hybrid.final_score,
          viral_category: hybrid.viral_category,
          confidence: hybrid.ml_confidence,
          source: 'hybrid',
          model_version: hybrid.model_version,
          top_features: hybrid.top_features,
          scores: {
            ml: hybrid.ml_score,
            gemini: hybrid.gemini_score,
            formula: hybrid.formula_score,
          },
          weights: hybrid.weights_used,
          sources_available: hybrid.sources_available,
        }
        break
    }

    return NextResponse.json({
      success: true,
      ...result,
      variant, // Include for debugging/analytics
    })
  } catch (error) {
    console.error('ML prediction error:', error)

    // Fallback to formula scoring on any error
    try {
      const body = await request.clone().json()
      const fallbackScore = calculateViralScore({
        views: body.views || 0,
        likes: body.likes || 0,
        comments: body.comments || 0,
        shares: body.shares || 0,
      })

      return NextResponse.json({
        success: true,
        viral_score: fallbackScore,
        viral_category: getViralCategory(fallbackScore),
        source: 'formula_fallback',
        error_fallback: true,
      })
    } catch {
      return NextResponse.json(
        { error: 'Prediction failed', detail: String(error) },
        { status: 500 }
      )
    }
  }
}

export async function GET() {
  // Health check for the ML integration
  try {
    const health = await checkMLHealth()

    return NextResponse.json({
      ml_service: health.status,
      model_loaded: health.model_loaded,
      model_version: health.model_version,
      model_accuracy: health.model_accuracy,
      ab_test_enabled: process.env.ML_AB_TEST_ENABLED !== 'false',
    })
  } catch (error) {
    return NextResponse.json({
      ml_service: 'unavailable',
      model_loaded: false,
      error: String(error),
      fallback_active: true,
    })
  }
}
