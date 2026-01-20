import type { Profile } from './database'
import type { User } from '@supabase/supabase-js'

/**
 * User with profile data
 */
export interface UserWithProfile {
  id: string
  email: string
  profile: Profile
}

/**
 * Plan details
 */
export interface PlanDetails {
  name: 'free' | 'pro' | 'agency'
  displayName: string
  price: number // monthly price in dollars
  analysesLimit: number | null // null = unlimited
  features: string[]
}

/**
 * Available plans
 */
export const PLANS: Record<Profile['plan'], PlanDetails> = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    analysesLimit: 5,
    features: [
      '5 analyses per month',
      'Basic viral score',
      'Score breakdown',
      'AI suggestions',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 19,
    analysesLimit: 100,
    features: [
      '100 analyses per month',
      'Priority processing',
      'Detailed trend analysis',
      'Posting time optimization',
      'Export reports',
    ],
  },
  agency: {
    name: 'agency',
    displayName: 'Agency',
    price: 79,
    analysesLimit: null,
    features: [
      'Unlimited analyses',
      'Team collaboration',
      'API access',
      'White-label reports',
      'Priority support',
      'Custom integrations',
    ],
  },
}

/**
 * Get plan details by name
 */
export function getPlanDetails(plan: Profile['plan']): PlanDetails {
  return PLANS[plan]
}

/**
 * Check if user has reached their analysis limit
 */
export function hasReachedLimit(profile: Profile): boolean {
  const plan = PLANS[profile.plan]
  if (plan.analysesLimit === null) return false
  return profile.analyses_count >= plan.analysesLimit
}

/**
 * Get remaining analyses for user
 */
export function getRemainingAnalyses(profile: Profile): number | null {
  const plan = PLANS[profile.plan]
  if (plan.analysesLimit === null) return null
  return Math.max(0, plan.analysesLimit - profile.analyses_count)
}

/**
 * User stats for dashboard
 */
export interface UserStats {
  totalAnalyses: number
  viralHits: number // analyses with score >= 80
  averageScore: number
  thisMonth: number
  lastMonth: number
  successRate: number // percentage of viral hits
}

/**
 * Auth state for the application
 */
export interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}
