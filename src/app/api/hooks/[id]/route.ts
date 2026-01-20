import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateHookSchema = z.object({
  hookText: z.string().min(1).max(500).optional(),
  hookType: z.enum(['question', 'statement', 'story', 'shock', 'challenge', 'other']).optional(),
  effectivenessScore: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  tags: z.array(z.string()).max(10).optional(),
})

/**
 * GET /api/hooks/[id]
 * Get a single hook by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hook, error } = await (supabase.from('saved_hooks') as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !hook) {
      return NextResponse.json(
        { error: 'Hook not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ hook })
  } catch (error) {
    console.error('Hook GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hook' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/hooks/[id]
 * Update a hook
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateHookSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (parsed.data.hookText !== undefined) updateData.hook_text = parsed.data.hookText
    if (parsed.data.hookType !== undefined) updateData.hook_type = parsed.data.hookType
    if (parsed.data.effectivenessScore !== undefined) updateData.effectiveness_score = parsed.data.effectivenessScore
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes
    if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hook, error } = await (supabase.from('saved_hooks') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !hook) {
      return NextResponse.json(
        { error: 'Hook not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ hook })
  } catch (error) {
    console.error('Hook PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update hook' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/hooks/[id]
 * Delete a hook
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('saved_hooks') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete hook error:', error)
      return NextResponse.json(
        { error: 'Failed to delete hook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hook DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete hook' },
      { status: 500 }
    )
  }
}
