import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeVideoWithAI } from '@/lib/api/video-analysis'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

/**
 * POST /api/video-upload
 * Upload a video file and analyze it with Gemini Vision
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: MP4, MOV, WebM' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'mp4'
    const fileName = `${user.id}/${timestamp}.${ext}`

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)

      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { error: 'Video storage not configured. Please contact support.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(uploadData.path)

    const fileUrl = urlData.publicUrl

    // Create initial analysis record with 'processing' status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: analysis, error: insertError } = await (supabase.from('uploaded_analyses') as any)
      .insert({
        user_id: user.id,
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
        status: 'processing',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      // Clean up uploaded file
      await supabase.storage.from('videos').remove([uploadData.path])
      return NextResponse.json(
        { error: 'Failed to create analysis record' },
        { status: 500 }
      )
    }

    // Analyze video with Gemini Vision (async, but we'll wait for it)
    try {
      const analysisResult = await analyzeVideoWithAI({
        videoUrl: fileUrl,
        fileName: file.name,
      })

      const processingTime = Date.now() - startTime

      // Update analysis with results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updatedAnalysis, error: updateError } = await (supabase.from('uploaded_analyses') as any)
        .update({
          status: 'completed',
          overall_score: analysisResult.overallScore,
          hook_score: analysisResult.hookScore,
          visual_score: analysisResult.visualScore,
          audio_score: analysisResult.audioScore,
          pacing_score: analysisResult.pacingScore,
          ai_feedback: analysisResult.feedback,
          suggestions: analysisResult.suggestions,
          processing_time: processingTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysis.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
      }

      return NextResponse.json({
        analysis: updatedAnalysis || analysis,
        processingTime,
      })
    } catch (analysisError) {
      console.error('Analysis error:', analysisError)

      // Mark as failed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('uploaded_analyses') as any)
        .update({
          status: 'failed',
          processing_time: Date.now() - startTime,
        })
        .eq('id', analysis.id)

      return NextResponse.json({
        analysis: { ...analysis, status: 'failed' },
        error: 'Video analysis failed',
      })
    }
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video-upload
 * List user's uploaded video analyses
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: analyses, error, count } = await (supabase.from('uploaded_analyses') as any)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analyses: analyses || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Video upload GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}
