import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createHookSchema = z.object({
  hookText: z.string().min(1, 'Hook text is required').max(500, 'Hook text is too long'),
  hookType: z.enum(['question', 'statement', 'story', 'shock', 'challenge', 'other']).default('other'),
  effectivenessScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  analysisId: z.string().uuid().optional(),
  sourceUrl: z.string().url().optional(),
})

/**
 * POST /api/hooks
 * Create a new saved hook
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createHookSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { hookText, hookType, effectivenessScore, notes, tags, analysisId, sourceUrl } = parsed.data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hook, error } = await (supabase.from('saved_hooks') as any)
      .insert({
        user_id: user.id,
        hook_text: hookText,
        hook_type: hookType,
        effectiveness_score: effectivenessScore,
        notes: notes || null,
        tags: tags || [],
        analysis_id: analysisId || null,
        source_url: sourceUrl || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create hook error:', error)
      return NextResponse.json(
        { error: 'Failed to save hook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ hook })
  } catch (error) {
    console.error('Hooks POST error:', error)
    return NextResponse.json(
      { error: 'Failed to save hook' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/hooks
 * List user's saved hooks with filtering
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('saved_hooks') as any)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('hook_type', type)
    }

    if (search) {
      query = query.ilike('hook_text', `%${search}%`)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data: hooks, error, count } = await query

    if (error) {
      console.error('List hooks error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch hooks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      hooks: hooks || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Hooks GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hooks' },
      { status: 500 }
    )
  }
}
