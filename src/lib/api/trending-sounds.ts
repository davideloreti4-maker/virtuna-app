/**
 * Trending Sounds API - Discover viral audio for TikTok
 * Uses a combination of curated data and AI-generated insights
 */

export interface TrendingSound {
  id: string;
  name: string;
  author: string;
  coverUrl: string | null;
  previewUrl: string | null;
  playCount: number;
  videoCount: number;
  trend: "rising" | "stable" | "declining";
  trendScore: number;
  category: string;
  tags: string[];
  duration: number;
  isOriginal: boolean;
  createdAt: string;
}

export interface TrendingSoundsResponse {
  sounds: TrendingSound[];
  total: number;
  categories: string[];
}

// Mock trending sounds data for development
const MOCK_TRENDING_SOUNDS: TrendingSound[] = [
  {
    id: "sound-1",
    name: "Original Sound - Viral Beat",
    author: "musicproducer",
    coverUrl: null,
    previewUrl: null,
    playCount: 45000000,
    videoCount: 890000,
    trend: "rising",
    trendScore: 95,
    category: "Music",
    tags: ["dance", "viral", "trending"],
    duration: 30,
    isOriginal: true,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "sound-2",
    name: "Trending Remix 2025",
    author: "djmixmaster",
    coverUrl: null,
    previewUrl: null,
    playCount: 32000000,
    videoCount: 720000,
    trend: "rising",
    trendScore: 92,
    category: "Remix",
    tags: ["remix", "edm", "party"],
    duration: 25,
    isOriginal: false,
    createdAt: "2025-01-14T15:30:00Z",
  },
  {
    id: "sound-3",
    name: "Chill Vibes Lo-Fi",
    author: "lofibeats",
    coverUrl: null,
    previewUrl: null,
    playCount: 28000000,
    videoCount: 650000,
    trend: "stable",
    trendScore: 85,
    category: "Lo-Fi",
    tags: ["chill", "study", "relax"],
    duration: 45,
    isOriginal: true,
    createdAt: "2025-01-10T09:00:00Z",
  },
  {
    id: "sound-4",
    name: "Voiceover Dramatic Effect",
    author: "soundfx_official",
    coverUrl: null,
    previewUrl: null,
    playCount: 22000000,
    videoCount: 480000,
    trend: "rising",
    trendScore: 88,
    category: "Sound Effects",
    tags: ["voiceover", "dramatic", "storytelling"],
    duration: 15,
    isOriginal: true,
    createdAt: "2025-01-12T18:00:00Z",
  },
  {
    id: "sound-5",
    name: "Classic Pop Throwback",
    author: "retrovibes",
    coverUrl: null,
    previewUrl: null,
    playCount: 19000000,
    videoCount: 420000,
    trend: "stable",
    trendScore: 78,
    category: "Pop",
    tags: ["throwback", "nostalgia", "classic"],
    duration: 30,
    isOriginal: false,
    createdAt: "2025-01-08T12:00:00Z",
  },
  {
    id: "sound-6",
    name: "Comedy Sound Bite",
    author: "funnyaudio",
    coverUrl: null,
    previewUrl: null,
    playCount: 35000000,
    videoCount: 950000,
    trend: "rising",
    trendScore: 94,
    category: "Comedy",
    tags: ["funny", "meme", "comedy"],
    duration: 8,
    isOriginal: true,
    createdAt: "2025-01-16T08:30:00Z",
  },
  {
    id: "sound-7",
    name: "Motivational Speech",
    author: "motivation_daily",
    coverUrl: null,
    previewUrl: null,
    playCount: 15000000,
    videoCount: 320000,
    trend: "stable",
    trendScore: 75,
    category: "Motivational",
    tags: ["motivation", "speech", "inspiration"],
    duration: 20,
    isOriginal: true,
    createdAt: "2025-01-05T14:00:00Z",
  },
  {
    id: "sound-8",
    name: "Hip Hop Beat Drop",
    author: "beatdropz",
    coverUrl: null,
    previewUrl: null,
    playCount: 41000000,
    videoCount: 830000,
    trend: "rising",
    trendScore: 91,
    category: "Hip Hop",
    tags: ["hiphop", "rap", "beat"],
    duration: 35,
    isOriginal: true,
    createdAt: "2025-01-13T20:00:00Z",
  },
  {
    id: "sound-9",
    name: "ASMR Relaxation",
    author: "asmr_sounds",
    coverUrl: null,
    previewUrl: null,
    playCount: 12000000,
    videoCount: 280000,
    trend: "stable",
    trendScore: 72,
    category: "ASMR",
    tags: ["asmr", "relax", "sleep"],
    duration: 60,
    isOriginal: true,
    createdAt: "2025-01-06T22:00:00Z",
  },
  {
    id: "sound-10",
    name: "Dance Challenge Track",
    author: "dancehits",
    coverUrl: null,
    previewUrl: null,
    playCount: 52000000,
    videoCount: 1200000,
    trend: "rising",
    trendScore: 98,
    category: "Dance",
    tags: ["dance", "challenge", "viral"],
    duration: 25,
    isOriginal: false,
    createdAt: "2025-01-17T11:00:00Z",
  },
  {
    id: "sound-11",
    name: "Nature Ambient",
    author: "naturescapes",
    coverUrl: null,
    previewUrl: null,
    playCount: 8000000,
    videoCount: 180000,
    trend: "stable",
    trendScore: 68,
    category: "Ambient",
    tags: ["nature", "ambient", "peaceful"],
    duration: 90,
    isOriginal: true,
    createdAt: "2025-01-03T06:00:00Z",
  },
  {
    id: "sound-12",
    name: "Podcast Intro Jingle",
    author: "podcastpro",
    coverUrl: null,
    previewUrl: null,
    playCount: 6000000,
    videoCount: 150000,
    trend: "declining",
    trendScore: 55,
    category: "Podcast",
    tags: ["podcast", "intro", "jingle"],
    duration: 10,
    isOriginal: true,
    createdAt: "2024-12-20T10:00:00Z",
  },
];

const CATEGORIES = [
  "All",
  "Music",
  "Dance",
  "Comedy",
  "Hip Hop",
  "Pop",
  "Lo-Fi",
  "Remix",
  "Sound Effects",
  "Motivational",
  "ASMR",
  "Ambient",
  "Podcast",
];

export interface FetchTrendingSoundsParams {
  category?: string;
  trend?: "rising" | "stable" | "declining";
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchTrendingSounds(
  params: FetchTrendingSoundsParams = {}
): Promise<TrendingSoundsResponse> {
  const { category, trend, search, limit = 20, offset = 0 } = params;

  // In production, this would fetch from an actual trending sounds API
  // For now, we use mock data

  let filteredSounds = [...MOCK_TRENDING_SOUNDS];

  // Filter by category
  if (category && category !== "All") {
    filteredSounds = filteredSounds.filter((s) => s.category === category);
  }

  // Filter by trend
  if (trend) {
    filteredSounds = filteredSounds.filter((s) => s.trend === trend);
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSounds = filteredSounds.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.author.toLowerCase().includes(searchLower) ||
        s.tags.some((t) => t.toLowerCase().includes(searchLower))
    );
  }

  // Sort by trend score (highest first)
  filteredSounds.sort((a, b) => b.trendScore - a.trendScore);

  // Pagination
  const total = filteredSounds.length;
  const paginatedSounds = filteredSounds.slice(offset, offset + limit);

  return {
    sounds: paginatedSounds,
    total,
    categories: CATEGORIES,
  };
}

export function formatPlayCount(count: number): string {
  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B`;
  }
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function getTrendBadge(trend: TrendingSound["trend"]): {
  label: string;
  color: string;
  icon: "up" | "stable" | "down";
} {
  switch (trend) {
    case "rising":
      return { label: "Rising", color: "var(--color-success)", icon: "up" };
    case "stable":
      return { label: "Stable", color: "var(--accent-primary)", icon: "stable" };
    case "declining":
      return { label: "Declining", color: "var(--color-warning)", icon: "down" };
  }
}
