"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Library, ArrowLeft, ExternalLink, Filter, Calendar, TrendingUp } from "lucide-react";

// Mock data - will be replaced with Supabase queries
const mockAnalyses = [
  {
    id: "1",
    url: "https://tiktok.com/@user/video/1234",
    score: 87,
    createdAt: "2025-01-19T10:30:00Z",
    thumbnail: null,
  },
  {
    id: "2",
    url: "https://tiktok.com/@user/video/5678",
    score: 72,
    createdAt: "2025-01-18T15:45:00Z",
    thumbnail: null,
  },
  {
    id: "3",
    url: "https://tiktok.com/@user/video/9012",
    score: 64,
    createdAt: "2025-01-17T09:20:00Z",
    thumbnail: null,
  },
  {
    id: "4",
    url: "https://tiktok.com/@user/video/3456",
    score: 91,
    createdAt: "2025-01-16T18:00:00Z",
    thumbnail: null,
  },
  {
    id: "5",
    url: "https://tiktok.com/@user/video/7890",
    score: 45,
    createdAt: "2025-01-15T12:30:00Z",
    thumbnail: null,
  },
];

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 60) return "text-[var(--virtuna)] border-[var(--virtuna-border)] bg-[var(--virtuna-glass)]";
  if (score >= 40) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  return "text-red-400 border-red-400/30 bg-red-400/10";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractVideoId(url: string): string {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1].slice(-8) : "Unknown";
}

export default function LibraryPage() {
  const [filter, setFilter] = useState<"all" | "viral" | "recent">("all");

  const filteredAnalyses = mockAnalyses.filter((analysis) => {
    if (filter === "viral") return analysis.score >= 80;
    return true;
  });

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    if (filter === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.score - a.score;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <header className="flex items-center justify-between pt-4 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Library</h1>
            <p className="text-[var(--text-tertiary)] text-sm">{mockAnalyses.length} analyses</p>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <section className="pb-4">
        <div className="flex gap-2">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            icon={<Library className="w-4 h-4" />}
          >
            All
          </FilterButton>
          <FilterButton
            active={filter === "viral"}
            onClick={() => setFilter("viral")}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Viral
          </FilterButton>
          <FilterButton
            active={filter === "recent"}
            onClick={() => setFilter("recent")}
            icon={<Calendar className="w-4 h-4" />}
          >
            Recent
          </FilterButton>
        </div>
      </section>

      {/* Analyses List */}
      <section className="py-4 space-y-3">
        {sortedAnalyses.length === 0 ? (
          <GlassCard level={2} className="text-center py-12">
            <Library className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            <h3 className="text-white font-medium mb-2">No analyses yet</h3>
            <p className="text-[var(--text-tertiary)] text-sm mb-6">
              Analyze your first video to get started
            </p>
            <Link href="/analyze">
              <Button variant="virtuna">Analyze Video</Button>
            </Link>
          </GlassCard>
        ) : (
          sortedAnalyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))
        )}
      </section>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-[var(--virtuna-glass)] text-[var(--virtuna)] border border-[var(--virtuna-border)]"
          : "glass-1 text-[var(--text-secondary)] hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function AnalysisCard({
  analysis,
}: {
  analysis: (typeof mockAnalyses)[0];
}) {
  const scoreColorClass = getScoreColor(analysis.score);

  return (
    <GlassCard level={2} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Thumbnail placeholder */}
          <div className="w-14 h-14 rounded-lg bg-[var(--glass-bg-3)] flex items-center justify-center">
            <span className="text-[var(--text-muted)] text-xs font-mono">
              #{extractVideoId(analysis.url)}
            </span>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-1">
              Video #{extractVideoId(analysis.url)}
            </p>
            <p className="text-[var(--text-tertiary)] text-xs">
              {formatDate(analysis.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border ${scoreColorClass}`}>
            <span className="font-data text-lg">{analysis.score}</span>
          </div>
          <a
            href={analysis.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon w-9 h-9"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </GlassCard>
  );
}
