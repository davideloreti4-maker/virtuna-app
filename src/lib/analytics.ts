/**
 * Analytics utility for tracking user events
 * Can be connected to a real analytics service (PostHog, Mixpanel, etc.) later
 */

type OnboardingEvent =
  | 'onboarding_shown'
  | 'onboarding_step_viewed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'first_analysis_completed'

type AnalyticsEvent =
  | OnboardingEvent
  | 'analysis_started'
  | 'analysis_completed'
  | 'video_uploaded'

interface EventProperties {
  [key: string]: string | number | boolean | undefined
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties || {})
  }

  // TODO: Connect to real analytics service
  // Examples:
  // - PostHog: posthog.capture(event, properties)
  // - Mixpanel: mixpanel.track(event, properties)
  // - Google Analytics: gtag('event', event, properties)
}

/**
 * Track onboarding shown
 */
export function trackOnboardingShown() {
  trackEvent('onboarding_shown')
}

/**
 * Track onboarding step viewed
 */
export function trackOnboardingStepViewed(step: number, stepTitle: string) {
  trackEvent('onboarding_step_viewed', { step, stepTitle })
}

/**
 * Track onboarding completed
 */
export function trackOnboardingCompleted(stepsViewed: number) {
  trackEvent('onboarding_completed', { stepsViewed })
}

/**
 * Track onboarding skipped
 */
export function trackOnboardingSkipped(lastStepViewed: number) {
  trackEvent('onboarding_skipped', { lastStepViewed })
}

/**
 * Track first analysis completed
 */
export function trackFirstAnalysisCompleted(score: number) {
  trackEvent('first_analysis_completed', { score })
}
