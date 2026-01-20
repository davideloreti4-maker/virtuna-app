import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnalysesListResponse, AnalysisWithDetails } from '@/types/analysis'

/**
 * GET /api/analyses
 * List user's analyses with pagination and filtering
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const sort = searchParams.get('sort') || 'date'
    const order = searchParams.get('order') || 'desc'
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (minScore) {
      query = query.gte('overall_score', parseInt(minScore))
    }
    if (maxScore) {
      query = query.lte('overall_score', parseInt(maxScore))
    }
    if (search) {
      // Search in metadata JSONB (description field)
      query = query.or(`metadata->description.ilike.%${search}%,video_url.ilike.%${search}%`)
    }

    // Apply sorting
    if (sort === 'score') {
      query = query.order('overall_score', { ascending: order === 'asc' })
    } else {
      query = query.order('created_at', { ascending: order === 'asc' })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      console.error('Analyses fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      )
    }

    // Cast to the expected type
    const analyses = (data || []) as unknown as AnalysisWithDetails[]

    const response: AnalysesListResponse = {
      analyses,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analyses list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}
