"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Radar,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Activity,
  Eye,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ViralTrendChart } from "@/components/charts/viral-trend-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { MiniSparkline } from "@/components/charts/mini-sparkline";
import { GlassPanel } from "@/components/ui/glass-panel";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { useAnalyses } from "@/lib/hooks/use-analyses";
import { useUser } from "@/lib/hooks/use-user";
import { formatRelativeDate, formatNumber } from "@/lib/utils/format";
import type { AnalysisWithDetails } from "@/types/analysis";

// Mock sparkline data - would come from aggregated stats in production
const sparklineData1 = [45, 52, 48, 65, 72, 68, 78];
const sparklineData2 = [30, 42, 55, 48, 62, 70, 85];
const sparklineData3 = [80, 75, 82, 78, 85, 90, 88];

export default function DashboardPage() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: analysesData, isLoading: analysesLoading } = useAnalyses({ limit: 5 });
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  const analyses = analysesData?.analyses || [];
  const totalAnalyses = analysesData?.pagination.total || 0;
  const viralCount = analyses.filter((a) => (a.overall_score || 0) >= 80).length;
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyses.length)
    : 0;

  const user = userData?.user;
  const isLoading = userLoading || analysesLoading;
  const isNewUser = totalAnalyses < 3;

  // Check if we should show onboarding (only once when data loads)
  const shouldShowOnboarding = !isLoading && user && user.has_seen_onboarding === false && showOnboarding === null;
  if (shouldShowOnboarding) {
    setShowOnboarding(true);
  }

  // Show welcome state for brand new users
  if (!isLoading && totalAnalyses === 0) {
    return (
      <>
        {showOnboarding && (
          <OnboardingModal
            onComplete={() => {
              setShowOnboarding(false);
              router.push('/analyze');
            }}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
        <div className="animate-fade-in">
          <header className="page-header">
            <div>
              <h1 className="page-title">Welcome to Virtuna!</h1>
              <p className="text-[var(--text-tertiary)] text-sm mt-1">
                Let&apos;s predict your first viral hit
              </p>
            </div>
          </header>

          <div className="max-w-2xl mx-auto">
            {/* Hero CTA */}
            <GlassPanel variant="strong" className="p-8 text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FF5757] flex items-center justify-center mx-auto mb-6">
                <Radar className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to Go Viral?
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                Our AI analyzes your TikTok videos and predicts their viral potential.
                Get actionable insights to boost your content performance.
              </p>
              <Link href="/analyze" className="btn btn-primary btn-lg">
                <Sparkles className="w-5 h-5" />
                Analyze Your First Video
              </Link>
            </GlassPanel>

          {/* What You Get */}
          <GlassPanel className="p-6">
            <h3 className="text-white font-semibold mb-4">What You&apos;ll Discover</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium block">Viral Score</span>
                  <span className="text-[var(--text-muted)] text-xs">0-100 prediction</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5757]/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#FF5757]" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium block">Trend Analysis</span>
                  <span className="text-[var(--text-muted)] text-xs">Current relevance</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium block">Hook Strength</span>
                  <span className="text-[var(--text-muted)] text-xs">First 3 seconds</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium block">AI Suggestions</span>
                  <span className="text-[var(--text-muted)] text-xs">Improve your content</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
        </div>
      </>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-[var(--text-tertiary)] text-sm mt-1">
            Your viral performance at a glance
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 bg-white/[0.06] border border-white/[0.08] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#FF5757]" />
              <span className="text-white text-sm font-medium">
                {user.full_name || user.email?.split("@")[0]}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-5">
        {/* Hero Score Card */}
        <div className="col-span-full md:col-span-3 lg:col-span-4">
          <GlassPanel variant="strong" className="p-5 md:p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-[11px] uppercase tracking-wider">
                Average Viral Score
              </span>
              <span className="bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full text-[11px] font-medium">
                All Time
              </span>
            </div>

            <div className="flex items-end gap-4 mb-4">
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-virtuna animate-spin" />
              ) : (
                <>
                  <span className="font-mono font-bold leading-none text-hero text-[#7C3AED]" style={{ textShadow: "0 0 40px rgba(124, 58, 237, 0.4)" }}>
                    {avgScore}
                  </span>
                  {avgScore >= 60 && (
                    <div className="flex items-center gap-1 mb-2 text-green-500 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="font-semibold">Good</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <p className="text-white/60 text-sm mb-4">
              {avgScore >= 80 ? "Excellent Performance" : avgScore >= 60 ? "Good Performance" : "Room for improvement"}
            </p>

            <MiniSparkline data={sparklineData1} color="#7C3AED" height={50} />
          </GlassPanel>
        </div>

        {/* Weekly Trend Chart */}
        <div className="col-span-full md:col-span-6 lg:col-span-8">
          <GlassPanel className="p-5 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-medium">Weekly Trend</h3>
                <p className="text-white/45 text-xs mt-0.5">Viral score over time</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[11px] font-medium border-none cursor-pointer">7D</button>
                <button className="bg-white/[0.06] text-white/50 px-3 py-1 rounded-full text-[11px] font-medium border-none cursor-pointer">30D</button>
                <button className="bg-white/[0.06] text-white/50 px-3 py-1 rounded-full text-[11px] font-medium border-none cursor-pointer">90D</button>
              </div>
            </div>
            <ViralTrendChart />
          </GlassPanel>
        </div>

        {/* Stats Row */}
        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <GlassPanel className="p-4 md:p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs md:text-[13px] text-white/60">
                <Activity className="w-4 h-4 text-[#FF5757]" />
                Total Analyses
              </span>
            </div>
            <div className="metric-value mb-2">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalAnalyses}
            </div>
            <MiniSparkline data={sparklineData2} color="#FF5757" height={35} />
          </GlassPanel>
        </div>

        {/* Only show Viral Hits card for users with 3+ analyses */}
        {!isNewUser && (
          <div className="col-span-1 md:col-span-3 lg:col-span-3">
            <GlassPanel className="p-4 md:p-5 h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-xs md:text-[13px] text-white/60">
                  <Zap className="w-4 h-4 text-[#7C3AED]" />
                  Viral Hits (80+)
                </span>
              </div>
              <div className="metric-value metric-value--accent mb-2">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : viralCount}
              </div>
              <MiniSparkline data={sparklineData3} color="#7C3AED" height={35} />
            </GlassPanel>
          </div>
        )}

        {/* Show encouraging tip for new users instead */}
        {isNewUser && (
          <div className="col-span-1 md:col-span-3 lg:col-span-3">
            <GlassPanel className="p-4 md:p-5 h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-xs md:text-[13px] text-white/60">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  Pro Tip
                </span>
              </div>
              <p className="text-white text-sm font-medium mb-1">
                Keep analyzing! 🚀
              </p>
              <p className="text-white/40 text-xs">
                Analyze 3+ videos to unlock viral tracking stats
              </p>
            </GlassPanel>
          </div>
        )}

        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <GlassPanel className="p-4 md:p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs md:text-[13px] text-white/60">
                <Eye className="w-4 h-4 text-purple-400" />
                Analyses Left
              </span>
            </div>
            <div className="metric-value metric-value--cyan mb-1">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                user ? (user.analyses_limit - user.analyses_count) : 5
              )}
            </div>
            <p className="text-white/40 text-xs">
              of {user?.analyses_limit || 5} on {user?.plan || "free"} plan
            </p>
          </GlassPanel>
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <GlassPanel className="p-4 md:p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs md:text-[13px] text-white/60">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Success Rate
              </span>
            </div>
            <div className="metric-value mb-1">
              {totalAnalyses > 0 ? Math.round((viralCount / totalAnalyses) * 100) : 0}%
            </div>
            <p className="text-white/40 text-xs">Videos scoring 80+</p>
          </GlassPanel>
        </div>

        {/* Monthly Performance */}
        <div className="col-span-full md:col-span-6 lg:col-span-6">
          <GlassPanel className="p-4 md:p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Monthly Performance</h3>
                <p className="text-white/45 text-xs mt-0.5">Analyses vs Viral hits</p>
              </div>
              <Link href="/library" className="text-[#7C3AED] text-xs font-medium flex items-center gap-1 no-underline">
                View Details
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <PerformanceBarChart />
          </GlassPanel>
        </div>

        {/* Score Distribution */}
        <div className="col-span-full md:col-span-3 lg:col-span-3">
          <GlassPanel className="p-4 md:p-5 h-full">
            <div className="mb-4">
              <h3 className="text-white font-medium">Score Distribution</h3>
              <p className="text-white/45 text-xs mt-0.5">By performance tier</p>
            </div>
            <ScoreDistributionChart />
          </GlassPanel>
        </div>

        {/* Quick Actions */}
        <div className="col-span-full md:col-span-3 lg:col-span-3">
          <GlassPanel className="p-4 md:p-5 h-full">
            <h3 className="text-white font-medium mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/analyze"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 no-underline transition-all hover:bg-[#7C3AED]/15"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#7C3AED] flex items-center justify-center">
                  <Radar className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium text-sm block">New Analysis</span>
                  <span className="text-white/45 text-xs">Predict viral potential</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
              </Link>

              <Link
                href="/library"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] no-underline transition-all hover:bg-white/[0.06]"
              >
                <div className="w-10 h-10 rounded-[10px] bg-white/[0.08] flex items-center justify-center">
                  <Eye className="w-5 h-5 text-[#FF5757]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium text-sm block">View History</span>
                  <span className="text-white/45 text-xs">{totalAnalyses} analyses saved</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] no-underline transition-all hover:bg-white/[0.06]"
              >
                <div className="w-10 h-10 rounded-[10px] bg-white/[0.08] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium text-sm block">Upgrade Plan</span>
                  <span className="text-white/45 text-xs">Get more analyses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
              </Link>
            </div>
          </GlassPanel>
        </div>

        {/* Recent Analyses */}
        <div className="col-span-full md:col-span-6 lg:col-span-6">
          <GlassPanel className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Recent Analyses</h3>
                <p className="text-white/45 text-xs mt-0.5">Your latest video predictions</p>
              </div>
              <Link
                href="/library"
                className="text-[#7C3AED] text-xs font-medium flex items-center gap-1 no-underline"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-virtuna animate-spin" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/45 text-sm mb-4">
                  No analyses yet. Start by analyzing your first video!
                </p>
                <Link href="/analyze" className="btn btn-primary">
                  <Radar className="w-4 h-4" />
                  Analyze Video
                </Link>
              </div>
            ) : (
              <>
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-4 py-2 border-b border-white/[0.08] mb-2">
                  <span className="col-span-5 text-white/40 text-[11px] uppercase tracking-wider">Video</span>
                  <span className="col-span-2 text-white/40 text-[11px] uppercase tracking-wider">Date</span>
                  <span className="col-span-3 text-white/40 text-[11px] uppercase tracking-wider">Performance</span>
                  <span className="col-span-2 text-right text-white/40 text-[11px] uppercase tracking-wider">Score</span>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col gap-1">
                  {analyses.slice(0, 4).map((analysis) => (
                    <RecentAnalysisRow key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              </>
            )}
          </GlassPanel>
        </div>

        {/* AI Insights */}
        <div className="col-span-full md:col-span-6 lg:col-span-6">
          <GlassPanel variant="strong" className="p-4 md:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-purple-500 to-[#FF5757] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">AI Insights</h3>
                <p className="text-white/45 text-xs mt-0.5">Based on your recent performance</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {analyses.length === 0 ? (
                <p className="text-white/45 text-sm">
                  Analyze some videos to get personalized insights!
                </p>
              ) : (
                <>
                  <InsightCard
                    title="Keep Up the Good Work!"
                    description={`You've analyzed ${totalAnalyses} video${totalAnalyses !== 1 ? 's' : ''} with an average score of ${avgScore}.`}
                    trend={avgScore >= 70 ? "positive" : avgScore >= 50 ? "neutral" : "negative"}
                  />
                  <InsightCard
                    title="Optimal Posting Time"
                    description="Your best-performing videos were posted between 7-9 PM EST. Consider this window."
                    trend="neutral"
                  />
                  {avgScore < 70 && (
                    <InsightCard
                      title="Room for Improvement"
                      description="Focus on stronger hooks and trending audio to boost your scores."
                      trend="negative"
                    />
                  )}
                </>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function RecentAnalysisRow({ analysis }: { analysis: AnalysisWithDetails }) {
  const score = analysis.overall_score || 0;
  const videoIdMatch = analysis.video_url.match(/video\/(\d+)/);
  const videoId = videoIdMatch ? videoIdMatch[1].slice(-4) : "----";

  const getScoreColor = (s: number) => {
    if (s >= 80) return "var(--color-success)";
    if (s >= 60) return "var(--accent-primary)";
    if (s >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return "var(--color-success-dim)";
    if (s >= 60) return "var(--accent-primary-dim)";
    if (s >= 40) return "rgba(245, 158, 11, 0.15)";
    return "var(--color-danger-dim)";
  };

  return (
    <Link
      href={`/library/${analysis.id}`}
      className="flex md:grid md:grid-cols-12 gap-3 md:gap-4 py-3 items-center hover:bg-[var(--glass-bg)] rounded-lg px-2 -mx-2 transition-all group"
    >
      {/* Mobile: simplified layout */}
      <div className="flex-shrink-0">
        {analysis.metadata?.thumbnailUrl ? (
          <img
            src={analysis.metadata.thumbnailUrl}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] text-xs font-mono">
            #{videoId}
          </div>
        )}
      </div>

      {/* Desktop: full grid layout */}
      <div className="flex-1 min-w-0 md:col-span-4 md:flex md:items-center md:gap-3">
        <span className="text-white text-sm font-medium truncate block">
          {analysis.metadata?.author ? `@${analysis.metadata.author}` : `Video #${videoId}`}
        </span>
        <span className="text-[var(--text-tertiary)] text-xs md:hidden">{formatRelativeDate(analysis.created_at)}</span>
      </div>

      <div className="hidden md:block md:col-span-2">
        <span className="text-[var(--text-tertiary)] text-sm">{formatRelativeDate(analysis.created_at)}</span>
      </div>

      <div className="hidden md:flex md:col-span-3 gap-1.5">
        <MiniMetric label="H" value={analysis.hook_score || 0} />
        <MiniMetric label="T" value={analysis.trend_score || 0} />
        <MiniMetric label="A" value={analysis.audio_score || 0} />
      </div>

      <div className="flex-shrink-0 md:col-span-3 flex items-center justify-end gap-2">
        <span
          className="font-mono font-bold text-base md:text-lg px-2.5 md:px-3 py-1 rounded-lg"
          style={{
            color: getScoreColor(score),
            background: getScoreBg(score),
          }}
        >
          {score}
        </span>
        <div className="btn-icon w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return "var(--color-success)";
    if (v >= 60) return "var(--accent-primary)";
    if (v >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  return (
    <div className="px-2 py-1 rounded bg-[var(--glass-bg)] text-xs font-mono">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span style={{ color: getColor(value) }} className="ml-1 font-semibold">
        {value}
      </span>
    </div>
  );
}

function InsightCard({
  title,
  description,
  trend,
}: {
  title: string;
  description: string;
  trend: "positive" | "neutral" | "negative";
}) {
  const colors = {
    positive: { bg: "var(--color-success-dim)", border: "var(--color-success)", icon: "var(--color-success)" },
    neutral: { bg: "var(--accent-cyan-dim)", border: "var(--accent-cyan)", icon: "var(--accent-cyan)" },
    negative: { bg: "var(--color-danger-dim)", border: "rgba(239, 68, 68, 0.3)", icon: "var(--color-danger)" },
  };

  const { bg, border, icon } = colors[trend];

  return (
    <div
      className="p-3 rounded-lg"
      style={{ background: bg, borderLeft: `3px solid ${border}` }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
          style={{ background: icon }}
        />
        <div>
          <h4 className="text-white text-sm font-medium">{title}</h4>
          <p className="text-[var(--text-secondary)] text-xs mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
