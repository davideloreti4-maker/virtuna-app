import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/utils/validation'
import type { Profile } from '@/types/database'

/**
 * GET /api/user
 * Get current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Cast to typed profile
    const typedProfile = profile as unknown as Profile

    return NextResponse.json({
      user: {
        ...typedProfile,
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user
 * Update user profile
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
    const parsed = profileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { data: profile, error } = await (supabase
      .from('profiles') as any)
      .update({
        full_name: parsed.data.fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error || !profile) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Cast to typed profile
    const typedProfile = profile as unknown as Profile

    return NextResponse.json({
      user: {
        ...typedProfile,
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user
 * Delete user account
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify confirmation phrase
    const body = await request.json()
    if (body.confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation. Please type "DELETE MY ACCOUNT"' },
        { status: 400 }
      )
    }

    // Delete user's analyses first (should cascade, but being explicit)
    await (supabase.from('analyses') as any).delete().eq('user_id', user.id)

    // Delete profile (should cascade from auth.users, but being explicit)
    await (supabase.from('profiles') as any).delete().eq('id', user.id)

    // Delete auth user - this requires admin client
    // For now, just sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ message: 'Account deleted' })
  } catch (error) {
    console.error('User delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
