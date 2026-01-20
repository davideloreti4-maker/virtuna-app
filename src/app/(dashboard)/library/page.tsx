"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Library,
  ExternalLink,
  Calendar,
  TrendingUp,
  Search,
  Activity,
  Zap,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAnalyses, useDeleteAnalysis } from "@/lib/hooks/use-analyses";
import { formatRelativeDate } from "@/lib/utils/format";
import type { AnalysisWithDetails } from "@/types/analysis";

function extractVideoId(url: string): string {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1].slice(-4) : "----";
}

export default function LibraryPage() {
  const [filter, setFilter] = useState<"all" | "viral" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useAnalyses({
    sort: filter === "recent" ? "date" : "score",
    order: "desc",
    minScore: filter === "viral" ? 80 : undefined,
    search: searchQuery || undefined,
  });

  const analyses = data?.analyses || [];
  const viralCount = analyses.filter((a) => (a.overall_score || 0) >= 80).length;
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyses.length)
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="btn-icon flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="page-title">Library</h1>
              <p className="text-[var(--text-tertiary)] text-xs sm:text-sm mt-1">
                {data?.pagination.total || 0} analyses saved
              </p>
            </div>
          </div>
        </div>
        <div className="search-bar">
          <Search />
          <input
            type="text"
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="glass-panel metric-card">
          <div className="metric-card-title mb-2">
            <Activity className="w-4 h-4" />
            Total
          </div>
          <div className="metric-value">{data?.pagination.total || 0}</div>
        </div>
        <div className="glass-panel metric-card">
          <div className="metric-card-title mb-2">
            <Zap className="w-4 h-4" />
            Viral
          </div>
          <div className="metric-value metric-value--accent">{viralCount}</div>
        </div>
        <div className="glass-panel metric-card">
          <div className="metric-card-title mb-2">
            <TrendingUp className="w-4 h-4" />
            Avg Score
          </div>
          <div className="metric-value metric-value--cyan">{avgScore}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
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
          Viral (80+)
        </FilterButton>
        <FilterButton
          active={filter === "recent"}
          onClick={() => setFilter("recent")}
          icon={<Calendar className="w-4 h-4" />}
        >
          Recent
        </FilterButton>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel-strong text-center py-16">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-virtuna animate-spin" />
          <p className="text-[var(--text-tertiary)]">Loading analyses...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-panel-strong text-center py-16">
          <p className="text-[var(--color-danger)] mb-4">Failed to load analyses</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Analyses List */}
      {!isLoading && !error && analyses.length === 0 ? (
        <div className="glass-panel-strong text-center py-16">
          <Library className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-white font-semibold text-lg mb-2">
            {searchQuery ? "No results found" : "No analyses yet"}
          </h3>
          <p className="text-[var(--text-tertiary)] text-sm mb-6 max-w-xs mx-auto">
            {searchQuery
              ? "Try a different search term"
              : "Analyze your first video to get started"}
          </p>
          {!searchQuery && (
            <Link href="/analyze" className="btn btn-primary">
              <Zap className="w-4 h-4" />
              Analyze Video
            </Link>
          )}
        </div>
      ) : (
        !isLoading && !error && (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )
      )}
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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "badge-accent"
          : "glass-panel hover:bg-[var(--glass-bg-hover)]"
      }`}
      style={
        active
          ? {
              background: "var(--accent-primary-dim)",
              color: "var(--accent-primary)",
              border: "1px solid var(--accent-primary)",
            }
          : {}
      }
    >
      {icon}
      {children}
    </button>
  );
}

function AnalysisCard({ analysis }: { analysis: AnalysisWithDetails }) {
  const deleteMutation = useDeleteAnalysis();
  const score = analysis.overall_score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--color-success)";
    if (score >= 60) return "var(--accent-primary)";
    if (score >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "var(--color-success-dim)";
    if (score >= 60) return "var(--accent-primary-dim)";
    if (score >= 40) return "rgba(245, 158, 11, 0.15)";
    return "var(--color-danger-dim)";
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteMutation.mutate(analysis.id);
    }
  };

  return (
    <Link
      href={`/library/${analysis.id}`}
      className="glass-panel p-3 sm:p-4 hover:bg-[var(--glass-bg-hover)] transition-all block"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Thumbnail */}
        {analysis.metadata?.thumbnailUrl ? (
          <img
            src={analysis.metadata.thumbnailUrl}
            alt=""
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--glass-bg)" }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              #{extractVideoId(analysis.video_url)}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm sm:text-base truncate">
            {analysis.metadata?.author
              ? `@${analysis.metadata.author}`
              : `Video #${extractVideoId(analysis.video_url)}`}
          </p>
          <p className="text-[var(--text-tertiary)] text-xs">
            {formatRelativeDate(analysis.created_at)}
          </p>
        </div>

        {/* Score Badge - Always visible */}
        <div
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-lg font-bold flex-shrink-0"
          style={{
            background: getScoreBg(score),
            color: getScoreColor(score),
          }}
        >
          {score}
        </div>

        {/* Actions - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          <a
            href={analysis.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="btn-icon text-[var(--text-muted)] hover:text-[var(--color-danger)]"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return "var(--color-success)";
    if (v >= 60) return "var(--accent-primary)";
    if (v >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  return (
    <div
      className="px-2 py-1 rounded text-xs font-mono"
      style={{ background: "var(--glass-bg)" }}
    >
      <span className="text-[var(--text-muted)]">{label}</span>
      <span style={{ color: getColor(value) }} className="ml-1 font-semibold">
        {value}
      </span>
    </div>
  );
}
