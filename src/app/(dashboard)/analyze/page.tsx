"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  Radar,
  Sparkles,
  TrendingUp,
  Music,
  Clock,
  Hash,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Upload,
  PartyPopper,
} from "lucide-react";
import { useAnalyze, useAnalyses } from "@/lib/hooks/use-analyses";
import { fireConfetti } from "@/lib/hooks/use-confetti";
import { trackFirstAnalysisCompleted } from "@/lib/analytics";
import type { AnalysisWithDetails, AISuggestion } from "@/types/analysis";

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisWithDetails | null>(null);
  const [validationError, setValidationError] = useState("");
  const [showFirstAnalysisCelebration, setShowFirstAnalysisCelebration] = useState(false);
  const hasTriggeredConfetti = useRef(false);

  const analyzeMutation = useAnalyze();
  const { data: analysesData } = useAnalyses({ limit: 1 });
  const totalAnalyses = analysesData?.pagination.total || 0;

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setValidationError("Please enter a TikTok URL");
      return;
    }

    if (!url.includes("tiktok.com")) {
      setValidationError("Please enter a valid TikTok URL");
      return;
    }

    setValidationError("");

    try {
      const data = await analyzeMutation.mutateAsync(url);
      setResult(data.analysis);

      // Fire confetti for first analysis!
      if (totalAnalyses === 0 && !hasTriggeredConfetti.current) {
        hasTriggeredConfetti.current = true;
        setShowFirstAnalysisCelebration(true);
        trackFirstAnalysisCompleted(data.analysis.overall_score || 0);
        setTimeout(() => fireConfetti(), 300);
        // Auto-hide celebration after 5 seconds
        setTimeout(() => setShowFirstAnalysisCelebration(false), 5000);
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setValidationError("");
    analyzeMutation.reset();
  };

  const getScoreGrade = (score: number) => {
    if (score >= 85) return { label: "Viral Potential", color: "var(--color-success)" };
    if (score >= 70) return { label: "Good Potential", color: "var(--accent-primary)" };
    if (score >= 50) return { label: "Moderate", color: "var(--color-warning)" };
    return { label: "Needs Work", color: "var(--color-danger)" };
  };

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
    }
  };

  const error = validationError || (analyzeMutation.error?.message);
  const loading = analyzeMutation.isPending;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/" className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Analyze Video</h1>
            <p className="text-[var(--text-tertiary)] text-sm mt-1">
              AI-powered viral prediction
            </p>
          </div>
        </div>
      </header>

      {!result ? (
        <div className="max-w-2xl">
          {/* Input Section */}
          <div className="glass-panel-strong p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-primary-dim)" }}
              >
                <Link2 className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">TikTok URL</h2>
                <p className="text-[var(--text-tertiary)] text-sm">
                  Paste your video link to analyze
                </p>
              </div>
            </div>

            <div className="input-with-icon mb-4">
              <Link2 />
              <input
                type="url"
                className={`input ${error ? "border-[var(--color-danger)]" : ""}`}
                placeholder="https://www.tiktok.com/@user/video/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setValidationError("");
                  analyzeMutation.reset();
                }}
                disabled={loading}
              />
            </div>

            {/* URL Format Hints */}
            <div className="text-[var(--text-muted)] text-xs mb-4">
              <span className="text-[var(--text-tertiary)]">Accepted formats:</span>{" "}
              tiktok.com/@user/video/... or vm.tiktok.com/...
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[var(--color-danger)] text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="btn btn-primary flex-1"
                onClick={handleAnalyze}
                disabled={loading}
              >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Radar className="w-5 h-5" />
                  Analyze Video
                </>
              )}
              </button>
              {!url && !loading && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setUrl("https://www.tiktok.com/@charlidamelio/video/7316457587244622122")}
                  title="Try with a sample video"
                >
                  <Sparkles className="w-4 h-4" />
                  Try Sample
                </button>
              )}
            </div>
          </div>

          {/* What We Analyze */}
          <div className="glass-panel p-6">
            <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-4">
              What We Analyze
            </h3>
            <div className="space-y-3">
              <FeatureItem
                icon={<Sparkles className="w-4 h-4" />}
                title="Hook Strength"
                description="First 2-3 seconds impact and retention"
              />
              <FeatureItem
                icon={<TrendingUp className="w-4 h-4" />}
                title="Trend Alignment"
                description="Current trend compatibility and relevance"
              />
              <FeatureItem
                icon={<Music className="w-4 h-4" />}
                title="Audio Analysis"
                description="Sound trend performance and engagement"
              />
              <FeatureItem
                icon={<Clock className="w-4 h-4" />}
                title="Timing Score"
                description="Optimal posting window analysis"
              />
              <FeatureItem
                icon={<Hash className="w-4 h-4" />}
                title="Hashtag Analysis"
                description="Tag relevance and reach potential"
              />
            </div>
          </div>

          {/* Upload Video Option */}
          <Link
            href="/analyze/upload"
            className="glass-panel p-6 mt-6 flex items-center gap-4 hover:bg-white/5 transition-colors group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-secondary-dim)" }}
            >
              <Upload className="w-6 h-6 text-[var(--accent-secondary)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Upload Your Video</h3>
              <p className="text-[var(--text-tertiary)] text-sm">
                Upload a video file directly for AI-powered analysis
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" />
          </Link>
        </div>
      ) : (
        <div className="max-w-3xl">
          {/* First Analysis Celebration */}
          {showFirstAnalysisCelebration && (
            <div className="glass-panel-strong p-4 mb-6 border border-[var(--accent-primary)]/30 bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#FF5757] flex items-center justify-center">
                  <PartyPopper className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Congratulations on your first analysis!</h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    You&apos;re on your way to creating viral content. Keep analyzing to improve!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score Hero */}
          <div className="glass-panel-strong score-hero mb-6">
            <span className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">
              Viral Score
            </span>
            <div
              className="score-value animate-glow"
              style={{ color: getScoreGrade(result.overall_score || 0).color }}
            >
              {result.overall_score || 0}
            </div>
            <span
              className="score-label"
              style={{ color: getScoreGrade(result.overall_score || 0).color }}
            >
              {getScoreGrade(result.overall_score || 0).label}
            </span>
          </div>

          {/* Video Info */}
          {result.metadata && (
            <div className="glass-panel p-4 mb-6">
              <div className="flex items-center gap-4">
                {result.metadata.thumbnailUrl && (
                  <img
                    src={result.metadata.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    @{result.metadata.author}
                  </p>
                  <p className="text-[var(--text-tertiary)] text-sm line-clamp-2 mt-1">
                    {result.metadata.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                    <span>{result.metadata.likeCount?.toLocaleString()} likes</span>
                    <span>{result.metadata.viewCount?.toLocaleString()} views</span>
                    <span>{result.metadata.duration}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Score Breakdown */}
            <div className="glass-panel p-5">
              <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-5">
                Score Breakdown
              </h3>
              <div className="space-y-4">
                <BreakdownItem
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Hook"
                  value={result.hook_score || 0}
                />
                <BreakdownItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Trend"
                  value={result.trend_score || 0}
                />
                <BreakdownItem
                  icon={<Music className="w-4 h-4" />}
                  label="Audio"
                  value={result.audio_score || 0}
                />
                <BreakdownItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Timing"
                  value={result.timing_score || 0}
                />
                <BreakdownItem
                  icon={<Hash className="w-4 h-4" />}
                  label="Hashtags"
                  value={result.hashtag_score || 0}
                />
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="glass-panel p-5">
              <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-5">
                AI Suggestions
              </h3>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: `${getPriorityColor(suggestion.priority)}20`,
                      }}
                    >
                      <ArrowRight
                        className="w-3.5 h-3.5"
                        style={{ color: getPriorityColor(suggestion.priority) }}
                      />
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium block">
                        {suggestion.title}
                      </span>
                      <span className="text-[var(--text-tertiary)] text-xs">
                        {suggestion.description}
                      </span>
                    </div>
                  </div>
                ))}
                {(!result.suggestions || result.suggestions.length === 0) && (
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                    <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                    Looking good! No major improvements needed.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="btn btn-secondary flex-1 py-3" onClick={handleReset}>
              Analyze Another
            </button>
            <Link href={`/library/${result.id}`} className="btn btn-primary flex-1 py-3">
              <Zap className="w-4 h-4" />
              View Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(124, 58, 237, 0.12)", color: "var(--accent-primary)" }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium">{title}</span>
        <span className="text-[var(--text-muted)] text-xs mt-0.5">{description}</span>
      </div>
    </div>
  );
}

function BreakdownItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const getBarColor = (v: number) => {
    if (v >= 80) return "var(--color-success)";
    if (v >= 60) return "var(--accent-primary)";
    if (v >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

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
