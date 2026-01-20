import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanLimit } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan as 'pro' | 'agency'

        if (userId && plan) {
          // Update user's plan and limits
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('profiles') as any)
            .update({
              plan,
              analyses_limit: getPlanLimit(plan),
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          console.log(`User ${userId} upgraded to ${plan}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (userId) {
          // Check subscription status
          const isActive = ['active', 'trialing'].includes(subscription.status)
          const plan = subscription.metadata?.plan as 'pro' | 'agency'

          if (isActive && plan) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('profiles') as any)
              .update({
                plan,
                analyses_limit: getPlanLimit(plan),
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (userId) {
          // Downgrade to free plan
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('profiles') as any)
            .update({
              plan: 'free',
              analyses_limit: 5,
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          console.log(`User ${userId} downgraded to free`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
        // Get subscription ID from the invoice (can be string, subscription object, or null)
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription as Stripe.Subscription)?.id

        if (subscriptionId) {
          // Get subscription to find user
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.user_id

          if (userId) {
            // Reset monthly analysis count on successful payment
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('profiles') as any)
              .update({
                analyses_count: 0,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)

            console.log(`Reset analysis count for user ${userId}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // Could send an email notification here
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Note: In Next.js App Router, request.text() already provides the raw body
// No additional configuration needed for webhook signature verification
