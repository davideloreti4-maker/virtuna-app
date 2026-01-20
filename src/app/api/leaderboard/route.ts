import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/leaderboard
 * Fetch leaderboard rankings by different metrics
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'xp'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const supabase = await createClient()

    // Get current user for highlighting
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Determine sort column based on type
    let orderColumn: string
    switch (type) {
      case 'streak':
        orderColumn = 'streak_days'
        break
      case 'analyses':
        orderColumn = 'analyses_count'
        break
      case 'viral':
        orderColumn = 'total_viral_count'
        break
      case 'xp':
      default:
        orderColumn = 'xp'
        break
    }

    // Fetch leaderboard data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles, error } = await (supabase.from('profiles') as any)
      .select('id, full_name, avatar_url, xp, level, streak_days, analyses_count, total_viral_count, badges')
      .order(orderColumn, { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Leaderboard fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Add rank to each entry and check if current user
    const leaderboard = profiles.map((profile: {
      id: string
      full_name: string
      avatar_url: string | null
      xp: number
      level: number
      streak_days: number
      analyses_count: number
      total_viral_count: number
      badges: string[]
    }, index: number) => ({
      rank: index + 1,
      id: profile.id,
      name: profile.full_name || 'Anonymous Creator',
      avatarUrl: profile.avatar_url,
      xp: profile.xp || 0,
      level: profile.level || 1,
      streakDays: profile.streak_days || 0,
      analysesCount: profile.analyses_count || 0,
      viralCount: profile.total_viral_count || 0,
      badges: profile.badges || [],
      isCurrentUser: user?.id === profile.id,
    }))

    // If current user is not in top results, fetch their rank separately
    let currentUserRank = null
    if (user && !leaderboard.some((p: { isCurrentUser: boolean }) => p.isCurrentUser)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userProfile } = await (supabase.from('profiles') as any)
        .select('id, full_name, avatar_url, xp, level, streak_days, analyses_count, total_viral_count, badges')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        // Count how many users are ahead
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count } = await (supabase.from('profiles') as any)
          .select('*', { count: 'exact', head: true })
          .gt(orderColumn, userProfile[orderColumn] || 0)

        currentUserRank = {
          rank: (count || 0) + 1,
          id: userProfile.id,
          name: userProfile.full_name || 'Anonymous Creator',
          avatarUrl: userProfile.avatar_url,
          xp: userProfile.xp || 0,
          level: userProfile.level || 1,
          streakDays: userProfile.streak_days || 0,
          analysesCount: userProfile.analyses_count || 0,
          viralCount: userProfile.total_viral_count || 0,
          badges: userProfile.badges || [],
          isCurrentUser: true,
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      type,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
