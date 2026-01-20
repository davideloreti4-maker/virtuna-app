import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnalysisWithDetails } from '@/types/analysis'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/analyses/[id]
 * Get a single analysis by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: analysisData, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Cast to the expected type
    const analysis = analysisData as unknown as AnalysisWithDetails

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/analyses/[id]
 * Delete an analysis
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First verify the analysis belongs to the user
    const { data: existing, error: fetchError } = await supabase
      .from('analyses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Delete the analysis
    const { error: deleteError } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Analysis deleted' })
  } catch (error) {
    console.error('Analysis delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    )
  }
}
