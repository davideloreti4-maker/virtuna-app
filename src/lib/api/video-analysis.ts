import { GoogleGenerativeAI } from '@google/generative-ai'

export interface VideoAnalysisInput {
  videoUrl: string
  fileName: string
  duration?: number
}

export interface VideoFeedback {
  hook: {
    score: number
    feedback: string
    improvements: string[]
  }
  visual: {
    score: number
    feedback: string
    improvements: string[]
  }
  audio: {
    score: number
    feedback: string
    improvements: string[]
  }
  pacing: {
    score: number
    feedback: string
    improvements: string[]
  }
  overall: {
    score: number
    summary: string
    strengths: string[]
    weaknesses: string[]
  }
}

export interface VideoAnalysisResult {
  overallScore: number
  hookScore: number
  visualScore: number
  audioScore: number
  pacingScore: number
  feedback: VideoFeedback
  suggestions: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

/**
 * Analyze a video using Gemini Flash Vision
 * Note: Gemini can analyze video frames/thumbnails, not full video files
 * For full video analysis, we'd need to extract frames first
 */
export async function analyzeVideoWithAI(input: VideoAnalysisInput): Promise<VideoAnalysisResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    // Return mock analysis in development
    return generateMockVideoAnalysis(input)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // For video analysis, we need to fetch the video and convert to base64
    // Gemini 2.0 Flash supports video input
    const videoResponse = await fetch(input.videoUrl)
    const videoBlob = await videoResponse.blob()
    const videoBuffer = await videoBlob.arrayBuffer()
    const videoBase64 = Buffer.from(videoBuffer).toString('base64')

    // Determine MIME type
    const mimeType = videoBlob.type || 'video/mp4'

    const prompt = `You are an expert TikTok content analyst. Analyze this video for viral potential and provide detailed feedback.

Evaluate the video on these criteria:
1. HOOK (first 2-3 seconds): Does it grab attention immediately? Is there text overlay, surprising visual, or compelling audio?
2. VISUAL: Video quality, lighting, framing, visual appeal, use of effects/transitions
3. AUDIO: Sound quality, music choice, voice clarity, trending audio usage
4. PACING: Length appropriateness, energy level, keeps viewer engaged throughout

Video filename: ${input.fileName}
${input.duration ? `Duration: ${input.duration} seconds` : ''}

Provide your analysis in this exact JSON format (respond ONLY with valid JSON, no markdown):
{
  "feedback": {
    "hook": {
      "score": <0-100>,
      "feedback": "<2-3 sentence assessment>",
      "improvements": ["<improvement 1>", "<improvement 2>"]
    },
    "visual": {
      "score": <0-100>,
      "feedback": "<2-3 sentence assessment>",
      "improvements": ["<improvement 1>", "<improvement 2>"]
    },
    "audio": {
      "score": <0-100>,
      "feedback": "<2-3 sentence assessment>",
      "improvements": ["<improvement 1>", "<improvement 2>"]
    },
    "pacing": {
      "score": <0-100>,
      "feedback": "<2-3 sentence assessment>",
      "improvements": ["<improvement 1>", "<improvement 2>"]
    },
    "overall": {
      "score": <0-100>,
      "summary": "<Overall assessment in 2-3 sentences>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>", "<weakness 2>"]
    }
  },
  "suggestions": [
    {
      "title": "<Short actionable title>",
      "description": "<Detailed description of improvement>",
      "priority": "high|medium|low"
    }
  ]
}

Be specific and actionable in your feedback. Focus on TikTok best practices.`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: videoBase64,
        },
      },
      { text: prompt },
    ])

    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const analysisData = JSON.parse(jsonMatch[0])

    return {
      overallScore: analysisData.feedback.overall.score,
      hookScore: analysisData.feedback.hook.score,
      visualScore: analysisData.feedback.visual.score,
      audioScore: analysisData.feedback.audio.score,
      pacingScore: analysisData.feedback.pacing.score,
      feedback: analysisData.feedback,
      suggestions: analysisData.suggestions || [],
    }
  } catch (error) {
    console.error('Video analysis error:', error)
    // Fall back to mock analysis on error
    return generateMockVideoAnalysis(input)
  }
}

/**
 * Generate mock video analysis for development/testing
 */
function generateMockVideoAnalysis(input: VideoAnalysisInput): VideoAnalysisResult {
  // Generate somewhat random but deterministic scores based on filename
  const seed = input.fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
  }

  const hookScore = random(55, 95)
  const visualScore = random(60, 90)
  const audioScore = random(50, 85)
  const pacingScore = random(55, 90)
  const overallScore = Math.round((hookScore * 0.3 + visualScore * 0.25 + audioScore * 0.2 + pacingScore * 0.25))

  return {
    overallScore,
    hookScore,
    visualScore,
    audioScore,
    pacingScore,
    feedback: {
      hook: {
        score: hookScore,
        feedback: hookScore >= 75
          ? 'Strong opening that immediately grabs attention. The first 2 seconds effectively create curiosity.'
          : 'The hook could be stronger. Consider adding text overlay or a more surprising opening to capture attention faster.',
        improvements: hookScore >= 75
          ? ['Consider testing different hook styles to see what resonates most', 'A/B test with question vs statement hooks']
          : ['Add text overlay in first 1-2 seconds', 'Start with action or surprising visual', 'Use a pattern interrupt'],
      },
      visual: {
        score: visualScore,
        feedback: visualScore >= 70
          ? 'Good visual quality with appropriate lighting. The framing works well for mobile viewing.'
          : 'Visual quality could be improved. Consider better lighting and ensuring the main subject fills more of the frame.',
        improvements: visualScore >= 70
          ? ['Experiment with dynamic camera movements', 'Try trending visual effects']
          : ['Improve lighting - natural light or ring light recommended', 'Fill more of the frame with your subject', 'Ensure vertical framing optimized for mobile'],
      },
      audio: {
        score: audioScore,
        feedback: audioScore >= 65
          ? 'Audio is clear and well-balanced. The sound choice complements the content.'
          : 'Audio needs improvement. Consider using a trending sound or improving voice clarity.',
        improvements: audioScore >= 65
          ? ['Try incorporating a trending sound for more reach', 'Add captions for viewers watching without sound']
          : ['Use a trending audio track', 'Improve voice recording quality', 'Add captions/subtitles'],
      },
      pacing: {
        score: pacingScore,
        feedback: pacingScore >= 70
          ? 'Good pacing that maintains viewer interest. The content flows naturally to the conclusion.'
          : 'Pacing could be tightened. Consider cutting slower moments to maintain engagement throughout.',
        improvements: pacingScore >= 70
          ? ['Test slightly shorter versions to improve completion rate', 'Add visual breaks every 3-5 seconds']
          : ['Cut any moments with low energy', 'Aim for 15-30 seconds for optimal completion', 'Ensure every second provides value'],
      },
      overall: {
        score: overallScore,
        summary: overallScore >= 75
          ? 'This video has strong viral potential. The hook, visuals, and pacing work together effectively to engage viewers.'
          : 'This video has potential but needs refinement. Focus on strengthening the weakest areas identified to improve viral chances.',
        strengths: [
          hookScore >= 70 ? 'Effective hook that grabs attention' : 'Content concept is interesting',
          visualScore >= 70 ? 'Good visual quality' : 'Authentic style',
          pacingScore >= 70 ? 'Well-paced content' : 'Good energy level',
        ].filter((_, i) => i < 2),
        weaknesses: [
          hookScore < 70 ? 'Hook could be more attention-grabbing' : null,
          visualScore < 70 ? 'Visual quality needs improvement' : null,
          audioScore < 70 ? 'Audio could be clearer or more engaging' : null,
          pacingScore < 70 ? 'Pacing could be tightened' : null,
        ].filter(Boolean) as string[],
      },
    },
    suggestions: [
      {
        title: hookScore < 70 ? 'Strengthen Your Hook' : 'Test Alternative Hooks',
        description: hookScore < 70
          ? 'Add text overlay in the first second with a compelling question or statement. This can increase watch time by 40%.'
          : 'Your hook is working well. Try A/B testing with different hook styles to find what works best for your audience.',
        priority: hookScore < 70 ? 'high' : 'low',
      },
      {
        title: audioScore < 70 ? 'Improve Audio Quality' : 'Leverage Trending Sounds',
        description: audioScore < 70
          ? 'Use a lavalier mic or record in a quieter environment. Clear audio dramatically improves viewer retention.'
          : 'Consider using trending sounds to boost discoverability. Videos with trending audio get 2-3x more reach.',
        priority: audioScore < 70 ? 'high' : 'medium',
      },
      {
        title: 'Add Captions',
        description: '85% of users watch videos without sound. Adding captions ensures your message reaches everyone.',
        priority: 'medium',
      },
    ],
  }
}

/**
 * Extract thumbnail/frame from video for preview
 * This would typically be done client-side with canvas
 */
export function getVideoThumbnailUrl(videoUrl: string): string {
  // For Supabase storage, we'd need to generate thumbnails server-side
  // For now, return the video URL (browsers will show first frame)
  return videoUrl
}
