/**
 * A/B Testing Framework for Viral Scoring Methods
 * Handles experiment assignment and tracking
 */

export type ScoringMethod = 'ml' | 'gemini' | 'formula' | 'hybrid'

interface ABTestConfig {
  testId: string
  enabled: boolean
  variants: Record<ScoringMethod, number> // Percentages (should sum to 100)
}

// Default A/B test configuration
const DEFAULT_CONFIG: ABTestConfig = {
  testId: 'viral_scoring_v1',
  enabled: process.env.ML_AB_TEST_ENABLED !== 'false',
  variants: {
    hybrid: 40, // 40% get hybrid (ML + Gemini + Formula)
    ml: 30, // 30% get ML-only
    gemini: 20, // 20% get Gemini-only
    formula: 10, // 10% get formula-only (control)
  },
}

/**
 * Simple hash function for deterministic bucket assignment
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get the scoring method variant for a user
 * Assignment is deterministic based on userId + testId
 */
export function getVariant(
  userId: string,
  config: ABTestConfig = DEFAULT_CONFIG
): ScoringMethod {
  if (!config.enabled) {
    return 'hybrid' // Default to hybrid when A/B testing disabled
  }

  // Hash user ID with test ID for deterministic assignment
  const hash = hashString(userId + config.testId)
  const bucket = hash % 100

  // Find which variant this bucket falls into
  let cumulative = 0
  for (const [variant, percentage] of Object.entries(config.variants)) {
    cumulative += percentage
    if (bucket < cumulative) {
      return variant as ScoringMethod
    }
  }

  // Fallback (shouldn't reach here if percentages sum to 100)
  return 'hybrid'
}

/**
 * Check if a user is in a specific variant
 */
export function isInVariant(
  userId: string,
  variant: ScoringMethod,
  config: ABTestConfig = DEFAULT_CONFIG
): boolean {
  return getVariant(userId, config) === variant
}

/**
 * Get all users' variant distribution (for debugging/analytics)
 */
export function getVariantDistribution(
  userIds: string[],
  config: ABTestConfig = DEFAULT_CONFIG
): Record<ScoringMethod, number> {
  const distribution: Record<ScoringMethod, number> = {
    ml: 0,
    gemini: 0,
    formula: 0,
    hybrid: 0,
  }

  for (const userId of userIds) {
    const variant = getVariant(userId, config)
    distribution[variant]++
  }

  return distribution
}

/**
 * Create a custom A/B test configuration
 */
export function createTestConfig(
  testId: string,
  variants: Partial<Record<ScoringMethod, number>>
): ABTestConfig {
  // Ensure percentages sum to 100
  const total = Object.values(variants).reduce((sum, v) => sum + (v || 0), 0)
  if (total !== 100) {
    console.warn(`A/B test variants should sum to 100 (got ${total})`)
  }

  return {
    testId,
    enabled: true,
    variants: {
      ml: 0,
      gemini: 0,
      formula: 0,
      hybrid: 0,
      ...variants,
    },
  }
}

/**
 * Log experiment exposure (for analytics)
 */
export function logExposure(
  userId: string,
  variant: ScoringMethod,
  metadata?: Record<string, unknown>
): void {
  // In production, this would send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('A/B Test Exposure:', {
      userId: userId.slice(0, 8) + '...',
      variant,
      timestamp: new Date().toISOString(),
      ...metadata,
    })
  }

  // TODO: Integrate with your analytics (Mixpanel, Amplitude, etc.)
}

/**
 * Log experiment outcome (for measuring success)
 */
export function logOutcome(
  userId: string,
  variant: ScoringMethod,
  outcome: {
    predicted_score: number
    actual_score?: number
    user_satisfaction?: number
    prediction_accepted?: boolean
  }
): void {
  // In production, this would send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('A/B Test Outcome:', {
      userId: userId.slice(0, 8) + '...',
      variant,
      outcome,
      timestamp: new Date().toISOString(),
    })
  }

  // TODO: Integrate with your analytics
}

// Export config for use in other modules
export const abTestConfig = DEFAULT_CONFIG
