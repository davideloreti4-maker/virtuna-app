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
  Radar,
  FileText,
  Twitter,
  Copy,
  Check,
  Brain,
  Zap,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useAnalysis, useDeleteAnalysis, useAnalyses } from "@/lib/hooks/use-analyses";
import { formatRelativeDate, formatNumber } from "@/lib/utils/format";
import type { AISuggestion, MLScoringMetadata } from "@/types/analysis";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnalysisDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useAnalysis(id);
  const { data: analysesData } = useAnalyses({ limit: 10, sort: 'date', order: 'desc' });
  const deleteMutation = useDeleteAnalysis();
  const [copiedShare, setCopiedShare] = useState(false);

  const analysis = data?.analysis;
  const canShare = (analysis?.overall_score || 0) >= 70;

  // Find previous analysis (the one created before this one)
  const allAnalyses = analysesData?.analyses || [];
  const currentIndex = allAnalyses.findIndex(a => a.id === id);
  const previousAnalysis = currentIndex >= 0 && currentIndex < allAnalyses.length - 1
    ? allAnalyses[currentIndex + 1]
    : null;

  const scoreComparison = previousAnalysis && analysis
    ? {
        diff: (analysis.overall_score || 0) - (previousAnalysis.overall_score || 0),
        previousScore: previousAnalysis.overall_score || 0,
      }
    : null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      await deleteMutation.mutateAsync(id);
      router.push("/library");
    }
  };

  const handleShare = async (type: 'copy' | 'twitter') => {
    const score = analysis?.overall_score || 0;
    const shareText = `I just scored ${score}/100 on my TikTok viral potential! 🚀 Analyze your videos at Virtuna`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (type === 'copy') {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } else if (type === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
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

          {/* Score Comparison */}
          {scoreComparison && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-[var(--text-muted)]">vs previous:</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    scoreComparison.diff > 0
                      ? 'text-[var(--color-success)]'
                      : scoreComparison.diff < 0
                      ? 'text-[var(--color-danger)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {scoreComparison.diff > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      +{scoreComparison.diff}
                    </>
                  ) : scoreComparison.diff < 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      {scoreComparison.diff}
                    </>
                  ) : (
                    'No change'
                  )}
                </span>
                <span className="text-[var(--text-tertiary)]">
                  (was {scoreComparison.previousScore})
                </span>
              </div>
            </div>
          )}
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
        <div className="glass-panel p-4 mb-6">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>Processing time: {analysis.processing_time}ms</span>
            <span>Video ID: {analysis.video_id}</span>
          </div>
        </div>

        {/* ML Insights Panel */}
        {analysis.metadata?.ml_scoring && (
          <MLInsightsPanel mlScoring={analysis.metadata.ml_scoring as MLScoringMetadata} />
        )}

        {/* Actions */}
        <div className="glass-panel-strong p-6">
          <h3 className="text-white font-semibold mb-4">What&apos;s Next?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Analyze Another */}
            <Link
              href="/analyze"
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center">
                <Radar className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <span className="text-white font-medium block">Analyze Another</span>
                <span className="text-[var(--text-muted)] text-xs">Test more videos</span>
              </div>
            </Link>

            {/* Generate Script CTA */}
            <Link
              href="/scripts"
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--accent-secondary)]" />
              </div>
              <div>
                <span className="text-white font-medium block">Generate Script</span>
                <span className="text-[var(--text-muted)] text-xs">AI-powered content</span>
              </div>
            </Link>

            {/* Share (only for scores 70+) */}
            {canShare && (
              <div className="relative">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/30 hover:border-[var(--accent-primary)]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                    {copiedShare ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Share2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-white font-medium block">
                      {copiedShare ? 'Copied!' : 'Share Score'}
                    </span>
                    <span className="text-[var(--text-muted)] text-xs">Brag about your {score}!</span>
                  </div>
                </button>
                {/* Twitter share button */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="Share on Twitter/X"
                >
                  <Twitter className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
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

function MLInsightsPanel({ mlScoring }: { mlScoring: MLScoringMetadata }) {
  const hasMLScore = mlScoring.sources_available.ml && mlScoring.ml_score !== null;
  const confidencePercent = mlScoring.ml_confidence ? Math.round(mlScoring.ml_confidence * 100) : 0;

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
        <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">
          ML Scoring Insights
        </h3>
        {mlScoring.model_version && (
          <span className="ml-auto text-xs text-[var(--text-muted)] bg-[var(--glass-bg)] px-2 py-1 rounded">
            Model: {mlScoring.model_version}
          </span>
        )}
      </div>

      {/* Score Sources */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className={`p-3 rounded-xl ${hasMLScore ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30' : 'bg-[var(--glass-bg)] opacity-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-xs text-[var(--text-muted)]">ML Model</span>
          </div>
          <span className={`text-2xl font-bold ${hasMLScore ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
            {hasMLScore ? mlScoring.ml_score : '—'}
          </span>
          {hasMLScore && (
            <span className="text-xs text-[var(--text-muted)] block">
              {mlScoring.weights_used.ml * 100}% weight
            </span>
          )}
        </div>

        <div className={`p-3 rounded-xl ${mlScoring.sources_available.gemini ? 'bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/30' : 'bg-[var(--glass-bg)] opacity-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
            <span className="text-xs text-[var(--text-muted)]">Gemini AI</span>
          </div>
          <span className={`text-2xl font-bold ${mlScoring.sources_available.gemini ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-muted)]'}`}>
            {mlScoring.gemini_score ?? '—'}
          </span>
          {mlScoring.sources_available.gemini && (
            <span className="text-xs text-[var(--text-muted)] block">
              {mlScoring.weights_used.gemini * 100}% weight
            </span>
          )}
        </div>

        <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-xs text-[var(--text-muted)]">Formula</span>
          </div>
          <span className="text-2xl font-bold text-[var(--text-secondary)]">
            {mlScoring.formula_score}
          </span>
          <span className="text-xs text-[var(--text-muted)] block">
            {mlScoring.weights_used.formula * 100}% weight
          </span>
        </div>
      </div>

      {/* Confidence & Top Features */}
      {hasMLScore && (
        <div className="grid grid-cols-2 gap-4">
          {/* Confidence */}
          <div className="p-3 rounded-xl bg-[var(--glass-bg)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">ML Confidence</span>
              <span className="text-sm font-semibold text-white">{confidencePercent}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidencePercent}%`,
                  background: confidencePercent >= 80
                    ? 'var(--color-success)'
                    : confidencePercent >= 60
                    ? 'var(--accent-primary)'
                    : 'var(--color-warning)',
                }}
              />
            </div>
          </div>

          {/* Top Features */}
          {mlScoring.top_features && mlScoring.top_features.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--glass-bg)]">
              <span className="text-xs text-[var(--text-muted)] block mb-2">Top Factors</span>
              <div className="flex flex-wrap gap-1">
                {mlScoring.top_features.slice(0, 3).map((f, i) => {
                  // Handle both formats: { feature, importance } and { featureName: importance }
                  const featureName = 'feature' in f
                    ? f.feature
                    : Object.keys(f)[0] || 'unknown'
                  return (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                    >
                      {featureName.replace(/_/g, ' ')}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scoring Method Badge */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Scoring method: <span className="text-[var(--text-secondary)] capitalize">{mlScoring.scoring_method}</span></span>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>
            {[
              mlScoring.sources_available.ml && 'ML',
              mlScoring.sources_available.gemini && 'Gemini',
              'Formula'
            ].filter(Boolean).join(' + ')}
          </span>
        </div>
      </div>
    </div>
  );
}
