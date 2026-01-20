import { GoogleGenerativeAI } from '@google/generative-ai'

export interface NicheAnalysisInput {
  niche: string
  subNiche?: string
}

export interface PostingTime {
  day: string
  time: string
  reason: string
}

export interface ContentIdea {
  title: string
  description: string
  format: string
}

export interface TrendingSound {
  name: string
  description: string
  useCase: string
}

export interface NicheAnalysisResult {
  niche: string
  subNiche?: string
  trendingFormats: string[]
  winningFormulas: string[]
  bestPostingTimes: PostingTime[]
  contentIdeas: ContentIdea[]
  trendingSoundTypes: TrendingSound[]
  keyInsights: string[]
  audienceProfile: {
    demographics: string
    interests: string[]
    painPoints: string[]
  }
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const cache = new Map<string, { data: NicheAnalysisResult; timestamp: number }>()

function getCacheKey(input: NicheAnalysisInput): string {
  return `${input.niche.toLowerCase()}-${input.subNiche?.toLowerCase() || ''}`
}

export async function analyzeNiche(input: NicheAnalysisInput): Promise<NicheAnalysisResult> {
  const cacheKey = getCacheKey(input)
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    // Return mock data in development if no API key
    return generateMockNicheAnalysis(input)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const prompt = `You are a TikTok content strategy expert. Today is ${currentDate}.

Analyze the following TikTok niche and provide strategic content recommendations:

Niche: ${input.niche}
${input.subNiche ? `Sub-niche: ${input.subNiche}` : ''}

Provide a comprehensive analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "trendingFormats": ["5 specific video format types currently popular in this niche"],
  "winningFormulas": ["5 proven content formulas that work well for this niche"],
  "bestPostingTimes": [
    {"day": "Monday", "time": "7:00 PM EST", "reason": "why this time works"},
    {"day": "Wednesday", "time": "6:00 PM EST", "reason": "why this time works"},
    {"day": "Friday", "time": "8:00 PM EST", "reason": "why this time works"}
  ],
  "contentIdeas": [
    {"title": "catchy hook/title", "description": "brief description", "format": "POV/Tutorial/etc"},
    {"title": "catchy hook/title", "description": "brief description", "format": "POV/Tutorial/etc"},
    {"title": "catchy hook/title", "description": "brief description", "format": "POV/Tutorial/etc"},
    {"title": "catchy hook/title", "description": "brief description", "format": "POV/Tutorial/etc"},
    {"title": "catchy hook/title", "description": "brief description", "format": "POV/Tutorial/etc"}
  ],
  "trendingSoundTypes": [
    {"name": "sound category/type", "description": "what kind of sound", "useCase": "when to use this"},
    {"name": "sound category/type", "description": "what kind of sound", "useCase": "when to use this"},
    {"name": "sound category/type", "description": "what kind of sound", "useCase": "when to use this"}
  ],
  "keyInsights": ["5 strategic insights about succeeding in this niche"],
  "audienceProfile": {
    "demographics": "primary age range and characteristics",
    "interests": ["3-5 related interests"],
    "painPoints": ["3-5 problems this audience faces that content can address"]
  }
}

Make recommendations specific to TikTok (not general social media), current and relevant to today's trends, and actionable for creators.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const analysisData = JSON.parse(jsonMatch[0])

    const analysis: NicheAnalysisResult = {
      niche: input.niche,
      subNiche: input.subNiche,
      trendingFormats: analysisData.trendingFormats || [],
      winningFormulas: analysisData.winningFormulas || [],
      bestPostingTimes: analysisData.bestPostingTimes || [],
      contentIdeas: analysisData.contentIdeas || [],
      trendingSoundTypes: analysisData.trendingSoundTypes || [],
      keyInsights: analysisData.keyInsights || [],
      audienceProfile: analysisData.audienceProfile || {
        demographics: '',
        interests: [],
        painPoints: [],
      },
    }

    // Cache the result
    cache.set(cacheKey, { data: analysis, timestamp: Date.now() })

    return analysis
  } catch (error) {
    console.error('Niche analysis error:', error)
    // Fall back to mock data on error
    return generateMockNicheAnalysis(input)
  }
}

function generateMockNicheAnalysis(input: NicheAnalysisInput): NicheAnalysisResult {
  const niche = input.niche.toLowerCase()

  // Generate somewhat relevant mock data based on niche keywords
  const isFitness = niche.includes('fitness') || niche.includes('workout') || niche.includes('gym')
  const isCooking = niche.includes('cook') || niche.includes('food') || niche.includes('recipe')
  const isBeauty = niche.includes('beauty') || niche.includes('makeup') || niche.includes('skincare')
  const isTech = niche.includes('tech') || niche.includes('gadget') || niche.includes('coding')
  const isLifestyle = !isFitness && !isCooking && !isBeauty && !isTech

  return {
    niche: input.niche,
    subNiche: input.subNiche,
    trendingFormats: isFitness ? [
      'Quick workout tutorials (30-60 seconds)',
      'Before/after transformation reveals',
      'POV: gym motivation content',
      'Form check/correction videos',
      'Day in the life of a fitness journey',
    ] : isCooking ? [
      'Recipe tutorials under 60 seconds',
      'Food ASMR with satisfying sounds',
      'Taste test/reaction videos',
      'Kitchen hack compilations',
      'Ingredient swap challenges',
    ] : isBeauty ? [
      'Get Ready With Me (GRWM)',
      'Product review/first impressions',
      'Transformation/glow up content',
      'Dupes vs. high-end comparisons',
      'Tutorial with trending audio',
    ] : isTech ? [
      'Unboxing and first impressions',
      'Tips and tricks series',
      'Tech comparison duels',
      'Setup/workspace tours',
      'Coding tutorials with visual demos',
    ] : [
      'Day in the life vlogs',
      'Storytime with engaging hooks',
      'Relatable POV content',
      'List-based informational videos',
      'Trend participation with unique spin',
    ],
    winningFormulas: [
      'Hook within first 1.5 seconds + value bomb + CTA',
      'Problem → Agitation → Solution format',
      'Text overlay + voiceover + trending sound',
      'Unexpected twist at the end for rewatches',
      'Series format to build anticipation',
    ],
    bestPostingTimes: [
      { day: 'Tuesday', time: '7:00 PM EST', reason: 'High engagement window for after-work scrolling' },
      { day: 'Thursday', time: '6:00 PM EST', reason: 'Weekend anticipation drives more shares' },
      { day: 'Saturday', time: '11:00 AM EST', reason: 'Weekend browsing peak' },
    ],
    contentIdeas: [
      {
        title: `POV: You just discovered the secret to ${input.niche}`,
        description: 'Reveal a lesser-known tip that provides immediate value',
        format: 'POV with text overlay',
      },
      {
        title: `3 ${input.niche} mistakes you\'re probably making`,
        description: 'Quick hits on common errors with simple fixes',
        format: 'List format with demonstrations',
      },
      {
        title: `What nobody tells you about ${input.niche}`,
        description: 'Controversial or surprising truth that sparks discussion',
        format: 'Talking head with B-roll',
      },
      {
        title: `${input.niche} in 2024 vs 2014`,
        description: 'Then vs now comparison showing evolution',
        format: 'Split screen comparison',
      },
      {
        title: `Reply to comment: How do I start with ${input.niche}?`,
        description: 'Beginner-friendly advice that helps newcomers',
        format: 'Comment reply video',
      },
    ],
    trendingSoundTypes: [
      { name: 'Motivational speeches', description: 'Inspiring audio clips', useCase: 'Transformation content' },
      { name: 'Trending pop songs', description: 'Current chart hits', useCase: 'High-energy content' },
      { name: 'Original audio voiceovers', description: 'Your own voice explaining', useCase: 'Educational content' },
    ],
    keyInsights: [
      'Consistency beats perfection - post 1-2x daily minimum',
      'First 2 seconds determine if viewers stay or scroll',
      'Engage with comments in first 30 minutes to boost algorithm',
      'Cross-promote your best content on other platforms',
      'Study your analytics weekly to understand what resonates',
    ],
    audienceProfile: {
      demographics: isLifestyle ? '18-34 year olds, primarily Gen Z and young Millennials' : `${input.niche} enthusiasts aged 16-35`,
      interests: ['Self-improvement', 'Entertainment', 'Learning new skills', 'Community belonging'],
      painPoints: [
        'Information overload - need simplified guidance',
        'Lack of time - want quick, actionable content',
        'Desire for authenticity over polished perfection',
      ],
    },
  }
}
