import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

/**
 * PATCH /api/user/onboarding
 * Update user's onboarding status
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { has_seen_onboarding } = body

    if (typeof has_seen_onboarding !== 'boolean') {
      return NextResponse.json(
        { error: 'has_seen_onboarding must be a boolean' },
        { status: 400 }
      )
    }

    const { data: profile, error } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('profiles') as any)
      .update({
        has_seen_onboarding,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error || !profile) {
      console.error('Onboarding update error:', error)
      return NextResponse.json(
        { error: 'Failed to update onboarding status' },
        { status: 500 }
      )
    }

    const typedProfile = profile as unknown as Profile

    return NextResponse.json({
      user: {
        ...typedProfile,
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Onboarding update error:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding status' },
      { status: 500 }
    )
  }
}
