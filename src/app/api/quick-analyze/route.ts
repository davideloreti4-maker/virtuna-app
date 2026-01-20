import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeNiche } from '@/lib/api/niche-analysis'
import { z } from 'zod'

const quickAnalyzeSchema = z.object({
  niche: z.string().min(2, 'Niche must be at least 2 characters').max(100, 'Niche must be less than 100 characters'),
  subNiche: z.string().max(100).optional(),
})

/**
 * POST /api/quick-analyze
 * Analyze a niche/topic without a specific video URL
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const parsed = quickAnalyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Run niche analysis
    const startTime = Date.now()
    const analysis = await analyzeNiche({
      niche: parsed.data.niche,
      subNiche: parsed.data.subNiche,
    })
    const processingTime = Date.now() - startTime

    return NextResponse.json({
      analysis,
      processingTime,
    })
  } catch (error) {
    console.error('Quick analyze error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
