import Stripe from 'stripe'

// Lazy-load Stripe client to avoid build-time initialization errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return _stripe
}

// For backward compatibility - use getStripe() for new code
export const stripe = {
  get webhooks() { return getStripe().webhooks },
  get checkout() { return getStripe().checkout },
  get subscriptions() { return getStripe().subscriptions },
  get customers() { return getStripe().customers },
}

// Price IDs from Stripe Dashboard
export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  agency_monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!,
  agency_yearly: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID!,
} as const

// Plan configurations
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    analyses: 5,
    features: [
      '5 analyses per month',
      'Basic score breakdown',
      'Standard processing',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceYearly: 190,
    analyses: 100,
    features: [
      '100 analyses per month',
      'Full score breakdown',
      'Priority processing',
      'AI suggestions',
      'Trend insights',
    ],
    popular: true,
  },
  agency: {
    name: 'Agency',
    price: 79,
    priceYearly: 790,
    analyses: -1, // Unlimited
    features: [
      'Unlimited analyses',
      'Everything in Pro',
      'Team features (coming soon)',
      'API access (coming soon)',
      'Priority support',
    ],
  },
} as const

export type PlanType = keyof typeof PLANS

// Helper to get plan limits
export function getPlanLimit(plan: PlanType): number {
  const planConfig = PLANS[plan]
  return planConfig.analyses === -1 ? 999999 : planConfig.analyses
}

// Helper to format price
export function formatPrice(price: number, yearly = false): string {
  if (price === 0) return 'Free'
  return `$${price}${yearly ? '/year' : '/mo'}`
}
