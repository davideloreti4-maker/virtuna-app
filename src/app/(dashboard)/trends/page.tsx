"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Music,
  Play,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Minus,
  Users,
  Video,
  Clock,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import type {
  TrendingSound,
  TrendingSoundsResponse,
} from "@/lib/api/trending-sounds";
import { formatPlayCount, getTrendBadge } from "@/lib/api/trending-sounds";

async function fetchTrendingSounds(params: {
  category?: string;
  trend?: string;
  search?: string;
}): Promise<TrendingSoundsResponse> {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== "All") {
    searchParams.set("category", params.category);
  }
  if (params.trend) {
    searchParams.set("trend", params.trend);
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }

  const res = await fetch(`/api/trending-sounds?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch trending sounds");
  return res.json();
}

function TrendIcon({ trend }: { trend: TrendingSound["trend"] }) {
  switch (trend) {
    case "rising":
      return <ChevronUp className="w-4 h-4" />;
    case "declining":
      return <ChevronDown className="w-4 h-4" />;
    default:
      return <Minus className="w-4 h-4" />;
  }
}

function SoundCard({
  sound,
  rank,
}: {
  sound: TrendingSound;
  rank: number;
}) {
  const [copied, setCopied] = useState(false);
  const badge = getTrendBadge(sound.trend);

  const handleCopy = () => {
    navigator.clipboard.writeText(sound.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white/70">
          {rank}
        </div>

        {/* Cover / Play Button */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
          {sound.coverUrl ? (
            <img
              src={sound.coverUrl}
              alt={sound.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Music className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-medium truncate">{sound.name}</h3>
              <p className="text-[var(--text-tertiary)] text-sm truncate">
                @{sound.author}
              </p>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
              style={{
                backgroundColor: `${badge.color}20`,
                color: badge.color,
              }}
            >
              <TrendIcon trend={sound.trend} />
              {badge.label}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {formatPlayCount(sound.playCount)}
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              {formatPlayCount(sound.videoCount)} videos
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {sound.duration}s
            </span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: "var(--accent-primary-dim)",
                color: "var(--accent-primary)",
              }}
            >
              {sound.category}
            </span>
            {sound.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs bg-white/10 text-[var(--text-tertiary)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Trend Score & Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {sound.trendScore}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Score</div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy Name
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTrend, setSelectedTrend] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Simple debounce
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["trending-sounds", selectedCategory, selectedTrend, debouncedSearch],
    queryFn: () =>
      fetchTrendingSounds({
        category: selectedCategory,
        trend: selectedTrend || undefined,
        search: debouncedSearch || undefined,
      }),
  });

  const categories = data?.categories || [
    "All",
    "Music",
    "Dance",
    "Comedy",
    "Hip Hop",
    "Pop",
    "Lo-Fi",
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
            }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Trending Sounds
        </h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-2">
          Discover viral audio to boost your content&apos;s reach
        </p>
      </header>

      {/* Search and Filters */}
      <div className="glass-panel p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search sounds, artists, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Trend Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            <select
              className="input bg-[var(--glass-bg)]"
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
            >
              <option value="">All Trends</option>
              <option value="rising">Rising</option>
              <option value="stable">Stable</option>
              <option value="declining">Declining</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {data?.sounds.filter((s) => s.trend === "rising").length || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Rising Sounds</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">{data?.total || 0}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Total Results</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {data?.sounds[0]?.trendScore || 0}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Top Score</div>
        </div>
      </div>

      {/* Sound List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="glass-panel p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin mb-4" />
            <p className="text-[var(--text-secondary)]">Loading trending sounds...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-12 text-center">
            <p className="text-[var(--color-danger)]">Failed to load trending sounds</p>
            <p className="text-[var(--text-muted)] text-sm mt-2">Please try again later</p>
          </div>
        ) : data?.sounds.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Music className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">No sounds found</p>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          data?.sounds.map((sound, index) => (
            <SoundCard key={sound.id} sound={sound} rank={index + 1} />
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="glass-panel p-6">
        <h3 className="text-white font-semibold mb-2">How to Use Trending Sounds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
              <ChevronUp className="w-4 h-4 text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-white font-medium">Rising Sounds</p>
              <p className="text-[var(--text-muted)]">
                Best for early adoption - use before they peak
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
              <Minus className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-white font-medium">Stable Sounds</p>
              <p className="text-[var(--text-muted)]">
                Proven performers with consistent engagement
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-warning)]/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-[var(--color-warning)]" />
            </div>
            <div>
              <p className="text-white font-medium">High Video Count</p>
              <p className="text-[var(--text-muted)]">
                Indicates proven viral potential
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
