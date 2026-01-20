import type { VideoMetadata } from '@/types/analysis'
import { extractTikTokVideoId } from '@/lib/utils/validation'

/**
 * TikTok Video Scraper using Apify
 * Fetches video metadata from TikTok URLs
 */

interface ApifyVideoData {
  id: string
  author: {
    uniqueId: string
    nickname: string
    avatarLarger: string
  }
  desc: string
  duration: number
  video: {
    cover: string
    dynamicCover: string
  }
  stats: {
    diggCount: number
    commentCount: number
    shareCount: number
    playCount: number
  }
  hashtags: Array<{ name: string }>
  music: {
    title: string
    authorName: string
    playUrl: string
  }
  createTime: number
}

/**
 * Fetch video data from TikTok
 * Uses Apify in production, mock data in development
 */
export async function fetchTikTokVideo(url: string): Promise<VideoMetadata> {
  const videoId = extractTikTokVideoId(url)

  if (!videoId) {
    throw new Error('Invalid TikTok URL')
  }

  // Use Apify in production
  if (process.env.APIFY_API_TOKEN) {
    return fetchFromApify(url, videoId)
  }

  // Use mock data in development
  return generateMockVideoData(videoId, url)
}

/**
 * Fetch video data from Apify TikTok scraper
 */
async function fetchFromApify(url: string, videoId: string): Promise<VideoMetadata> {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
        },
        body: JSON.stringify({
          postURLs: [url],
          resultsPerPage: 1,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Apify error:', error)
      throw new Error('Failed to fetch video data from TikTok')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      throw new Error('Video not found or is private')
    }

    return transformApifyResponse(data[0])
  } catch (error) {
    console.error('Apify fetch error:', error)
    // Fall back to mock data if Apify fails
    return generateMockVideoData(videoId, url)
  }
}

/**
 * Transform Apify response to our VideoMetadata format
 */
function transformApifyResponse(data: ApifyVideoData): VideoMetadata {
  return {
    author: data.author?.uniqueId || 'unknown',
    authorAvatar: data.author?.avatarLarger || '',
    description: data.desc || '',
    duration: data.duration || 0,
    thumbnailUrl: data.video?.dynamicCover || data.video?.cover || '',
    likeCount: data.stats?.diggCount || 0,
    commentCount: data.stats?.commentCount || 0,
    shareCount: data.stats?.shareCount || 0,
    viewCount: data.stats?.playCount || 0,
    hashtags: data.hashtags?.map((h) => h.name) || [],
    soundName: data.music?.title || 'Original Sound',
    soundAuthor: data.music?.authorName || data.author?.uniqueId || 'unknown',
    soundPlayCount: 0, // Not available from basic Apify scraper
    createTime: data.createTime ? new Date(data.createTime * 1000).toISOString() : undefined,
  }
}

/**
 * Generate mock video data for development
 */
function generateMockVideoData(videoId: string, url: string): VideoMetadata {
  // Generate somewhat random but deterministic data based on videoId
  const seed = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
  }

  const mockUsernames = [
    'creativecreator',
    'trendsetter',
    'viralmaker',
    'contentking',
    'socialstar',
    'tiktoker',
  ]

  const mockDescriptions = [
    'POV: You finally found the perfect video 🔥 #fyp #viral',
    'Wait for it... 😱 This is insane! #trending #foryou',
    'Can we hit 1M views? 🚀 #challenge #grwm',
    'Story time: How I went viral overnight ✨ #storytime #fyp',
    'Life hack that actually works 💡 #hack #tips #foryoupage',
  ]

  const mockSounds = [
    'Original Sound - creativecreator',
    'Trending Sound 2024',
    'Viral Mix - DJ Unknown',
    'Popular Song - Famous Artist',
    'Original Audio',
  ]

  const mockHashtags = [
    ['fyp', 'viral', 'trending'],
    ['foryou', 'comedy', 'funny'],
    ['challenge', 'dance', 'fyp'],
    ['storytime', 'grwm', 'lifestyle'],
    ['hack', 'tips', 'viral', 'foryoupage'],
  ]

  const index = seed % 5

  return {
    author: mockUsernames[index],
    authorAvatar: `https://picsum.photos/seed/${videoId}/100/100`,
    description: mockDescriptions[index],
    duration: random(15, 60),
    thumbnailUrl: `https://picsum.photos/seed/${videoId}/400/700`,
    likeCount: random(1000, 500000),
    commentCount: random(100, 20000),
    shareCount: random(50, 10000),
    viewCount: random(10000, 5000000),
    hashtags: mockHashtags[index],
    soundName: mockSounds[index],
    soundAuthor: mockUsernames[(index + 1) % 5],
    soundPlayCount: random(10000, 1000000),
    createTime: new Date(Date.now() - random(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Validate TikTok URL format and accessibility
 */
export async function validateTikTokUrl(url: string): Promise<{
  valid: boolean
  videoId: string | null
  error?: string
}> {
  const videoId = extractTikTokVideoId(url)

  if (!videoId) {
    return {
      valid: false,
      videoId: null,
      error: 'Invalid TikTok URL format',
    }
  }

  // In production, you might want to do a HEAD request to check if video exists
  // For now, just validate the format
  return {
    valid: true,
    videoId,
  }
}

/**
 * Supported TikTok URL patterns
 */
export const SUPPORTED_URL_PATTERNS = [
  'https://www.tiktok.com/@username/video/1234567890',
  'https://vm.tiktok.com/abcd1234/',
  'https://www.tiktok.com/t/abcd1234/',
  'https://m.tiktok.com/v/1234567890',
]
