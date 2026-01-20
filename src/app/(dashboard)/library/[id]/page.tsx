"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Music,
  Clock,
  Hash,
  Trash2,
  Loader2,
  ArrowRight,
  CheckCircle,
  Heart,
  MessageCircle,
  Share2,
  Eye,
} from "lucide-react";
import { useAnalysis, useDeleteAnalysis } from "@/lib/hooks/use-analyses";
import { formatRelativeDate, formatNumber } from "@/lib/utils/format";
import type { AISuggestion } from "@/types/analysis";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnalysisDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useAnalysis(id);
  const deleteMutation = useDeleteAnalysis();

  const analysis = data?.analysis;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      await deleteMutation.mutateAsync(id);
      router.push("/library");
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 85) return { label: "Viral Potential", color: "var(--color-success)" };
    if (score >= 70) return { label: "Good Potential", color: "var(--accent-primary)" };
    if (score >= 50) return { label: "Moderate", color: "var(--color-warning)" };
    return { label: "Needs Work", color: "var(--color-danger)" };
  };

  const getBarColor = (v: number) => {
    if (v >= 80) return "var(--color-success)";
    if (v >= 60) return "var(--accent-primary)";
    if (v >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <header className="page-header">
          <div className="flex items-center gap-4">
            <Link href="/library" className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="page-title">Analysis Details</h1>
            </div>
          </div>
        </header>
        <div className="glass-panel-strong text-center py-16">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-virtuna animate-spin" />
          <p className="text-[var(--text-tertiary)]">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="animate-fade-in">
        <header className="page-header">
          <div className="flex items-center gap-4">
            <Link href="/library" className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="page-title">Analysis Not Found</h1>
            </div>
          </div>
        </header>
        <div className="glass-panel-strong text-center py-16">
          <p className="text-[var(--color-danger)] mb-4">
            {error?.message || "Analysis not found"}
          </p>
          <Link href="/library" className="btn btn-secondary">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const score = analysis.overall_score || 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/library" className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Analysis Details</h1>
            <p className="text-[var(--text-tertiary)] text-sm mt-1">
              {formatRelativeDate(analysis.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={analysis.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink className="w-4 h-4" />
            View on TikTok
          </a>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn btn-secondary text-[var(--color-danger)]"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </header>

      <div className="max-w-4xl">
        {/* Score Hero */}
        <div className="glass-panel-strong score-hero mb-6">
          <span className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">
            Viral Score
          </span>
          <div
            className="score-value animate-glow"
            style={{ color: getScoreGrade(score).color }}
          >
            {score}
          </div>
          <span
            className="score-label"
            style={{ color: getScoreGrade(score).color }}
          >
            {getScoreGrade(score).label}
          </span>
        </div>

        {/* Video Info */}
        {analysis.metadata && (
          <div className="glass-panel p-5 mb-6">
            <div className="flex gap-5">
              {analysis.metadata.thumbnailUrl && (
                <img
                  src={analysis.metadata.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-32 h-44 object-cover rounded-xl"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {analysis.metadata.authorAvatar && (
                    <img
                      src={analysis.metadata.authorAvatar}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <span className="text-white font-semibold text-lg">
                    {analysis.metadata.author && analysis.metadata.author !== 'unknown'
                      ? `@${analysis.metadata.author}`
                      : `Video #${analysis.video_id?.slice(-8) || 'Unknown'}`}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-3">
                  {analysis.metadata.description}
                </p>

                {/* Engagement Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Heart className="w-4 h-4" />
                    <span>{formatNumber(analysis.metadata.likeCount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatNumber(analysis.metadata.commentCount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Share2 className="w-4 h-4" />
                    <span>{formatNumber(analysis.metadata.shareCount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(analysis.metadata.viewCount)}</span>
                  </div>
                </div>

                {/* Hashtags */}
                {analysis.metadata.hashtags && analysis.metadata.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {analysis.metadata.hashtags.slice(0, 8).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-[var(--glass-bg)] text-[var(--accent-cyan)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score Breakdown & Suggestions */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Score Breakdown */}
          <div className="glass-panel p-5">
            <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-5">
              Score Breakdown
            </h3>
            <div className="space-y-4">
              <BreakdownItem
                icon={<Sparkles className="w-4 h-4" />}
                label="Hook"
                value={analysis.hook_score || 0}
                getBarColor={getBarColor}
              />
              <BreakdownItem
                icon={<TrendingUp className="w-4 h-4" />}
                label="Trend"
                value={analysis.trend_score || 0}
                getBarColor={getBarColor}
              />
              <BreakdownItem
                icon={<Music className="w-4 h-4" />}
                label="Audio"
                value={analysis.audio_score || 0}
                getBarColor={getBarColor}
              />
              <BreakdownItem
                icon={<Clock className="w-4 h-4" />}
                label="Timing"
                value={analysis.timing_score || 0}
                getBarColor={getBarColor}
              />
              <BreakdownItem
                icon={<Hash className="w-4 h-4" />}
                label="Hashtags"
                value={analysis.hashtag_score || 0}
                getBarColor={getBarColor}
              />
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="glass-panel p-5">
            <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-5">
              AI Suggestions
            </h3>
            <div className="space-y-4">
              {analysis.suggestions?.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: `${getPriorityColor(suggestion.priority)}20`,
                    }}
                  >
                    <ArrowRight
                      className="w-4 h-4"
                      style={{ color: getPriorityColor(suggestion.priority) }}
                    />
                  </div>
                  <div>
                    <span className="text-white text-sm font-medium block">
                      {suggestion.title}
                    </span>
                    <span className="text-[var(--text-tertiary)] text-sm">
                      {suggestion.description}
                    </span>
                  </div>
                </div>
              ))}
              {(!analysis.suggestions || analysis.suggestions.length === 0) && (
                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                  <span>Looking good! No major improvements needed.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Info */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>Processing time: {analysis.processing_time}ms</span>
            <span>Video ID: {analysis.video_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({
  icon,
  label,
  value,
  getBarColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  getBarColor: (v: number) => string;
}) {
  return (
    <div className="breakdown-item">
      <div className="breakdown-header">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          {icon}
          <span className="breakdown-label">{label}</span>
        </div>
        <span className="breakdown-value">{value}</span>
      </div>
      <div className="breakdown-bar">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${getBarColor(value)}, ${getBarColor(value)}cc)`,
          }}
        />
      </div>
    </div>
  );
}
