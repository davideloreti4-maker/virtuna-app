import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/video-upload/[id]
 * Get a single uploaded video analysis
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
    const { data: analysis, error } = await (supabase.from('uploaded_analyses') as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Video upload GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/video-upload/[id]
 * Delete an uploaded video and its analysis
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

    // Get the analysis first to get the file URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: analysis, error: fetchError } = await (supabase.from('uploaded_analyses') as any)
      .select('file_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Extract file path from URL and delete from storage
    try {
      const url = new URL(analysis.file_url)
      const pathMatch = url.pathname.match(/\/videos\/(.+)$/)
      if (pathMatch) {
        await supabase.storage.from('videos').remove([pathMatch[1]])
      }
    } catch (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase.from('uploaded_analyses') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Video upload DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    )
  }
}
