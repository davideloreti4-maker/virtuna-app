"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radar,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Loader2,
  Info,
  Target,
} from "lucide-react";
import { ViralTrendChart } from "@/components/charts/viral-trend-chart";
import { PerformanceBarChart } from "@/components/charts/performance-bar-chart";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { MiniSparkline } from "@/components/charts/mini-sparkline";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LevelProgress } from "@/components/ui/level-progress";
import { useAnalyses } from "@/lib/hooks/use-analyses";
import { useUser } from "@/lib/hooks/use-user";
import { formatRelativeDate } from "@/lib/utils/format";
import type { AnalysisWithDetails } from "@/types/analysis";

// Mock sparkline data - would come from aggregated stats in production
const sparklineData1 = [45, 52, 48, 65, 72, 68, 78];
const sparklineData2 = [30, 42, 55, 48, 62, 70, 85];
const sparklineData3 = [80, 75, 82, 78, 85, 90, 88];

export default function DashboardPage() {
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: analysesData, isLoading: analysesLoading } = useAnalyses({ limit: 5 });

  const analyses = analysesData?.analyses || [];
  const totalAnalyses = analysesData?.pagination.total || 0;
  const viralCount = analyses.filter((a) => (a.overall_score || 0) >= 80).length;
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyses.length)
    : 0;

  // Calculate average component scores for breakdown
  const avgHookScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.hook_score || 0), 0) / analyses.length)
    : 0;
  const avgTrendScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.trend_score || 0), 0) / analyses.length)
    : 0;
  const avgAudioScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + (a.audio_score || 0), 0) / analyses.length)
    : 0;

  // Find weakest area
  const scoreComponents = [
    { name: "Hook", score: avgHookScore, tip: "Improve your first 3 seconds" },
    { name: "Trend", score: avgTrendScore, tip: "Use more trending formats" },
    { name: "Audio", score: avgAudioScore, tip: "Try trending sounds" },
  ];
  const weakestArea = scoreComponents.reduce((min, curr) => curr.score < min.score ? curr : min, scoreComponents[0]);

  const user = userData?.user;
  const isLoading = userLoading || analysesLoading;

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Dashboard</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
            Your viral performance at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Level Progress - Compact */}
          {user && (
            <LevelProgress
              xp={user.xp || 0}
              streakDays={user.streak_days || 0}
              lastAnalysisDate={user.last_analysis_date || null}
              compact
            />
          )}
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px 6px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #FF5757)" }} />
              <span style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}>
                {user.full_name || user.email?.split("@")[0]}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
        {/* Hero Score Card - Enhanced with explainability */}
        <div style={{ gridColumn: "span 4" }}>
          <GlassPanel
            variant="strong"
            style={{ padding: "24px", height: "100%", cursor: analyses.length > 0 ? "pointer" : "default" }}
            onClick={() => analyses.length > 0 && setShowScoreBreakdown(!showScoreBreakdown)}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Average Viral Score
              </span>
              <div className="flex items-center gap-2">
                {analyses.length > 0 && (
                  <button
                    style={{ background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                    title="Click for breakdown"
                  >
                    <Info className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                )}
                <span style={{ background: "rgba(168, 85, 247, 0.2)", color: "#a855f7", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500 }}>
                  All Time
                </span>
              </div>
            </div>

            <div className="flex items-end gap-4 mb-2">
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-virtuna animate-spin" />
              ) : (
                <>
                  <span className="font-mono font-bold leading-none" style={{ fontSize: "60px", color: avgScore >= 80 ? "#22c55e" : avgScore >= 60 ? "#7C3AED" : avgScore >= 40 ? "#F59E0B" : "#EF4444", textShadow: `0 0 40px ${avgScore >= 80 ? "rgba(34, 197, 94, 0.4)" : avgScore >= 60 ? "rgba(124, 58, 237, 0.4)" : avgScore >= 40 ? "rgba(245, 158, 11, 0.4)" : "rgba(239, 68, 68, 0.4)"}` }}>
                    {avgScore}
                  </span>
                  <div className="flex items-center gap-1 mb-2" style={{ color: avgScore >= 60 ? "#22c55e" : "#F59E0B", fontSize: "14px" }}>
                    {avgScore >= 60 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="font-semibold">{avgScore >= 80 ? "Viral!" : avgScore >= 60 ? "Good" : avgScore >= 40 ? "Fair" : "Needs Work"}</span>
                  </div>
                </>
              )}
            </div>

            {/* Benchmark context */}
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "12px" }}>
              {avgScore >= 80 ? "Top 10% of creators!" : avgScore >= 60 ? "Above average. Top creators score 80+" : "Benchmark: Top creators average 78+"}
            </p>

            {/* Score Breakdown - Collapsible */}
            {showScoreBreakdown && analyses.length > 0 && (
              <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "10px" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Score Breakdown
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {scoreComponents.map((comp) => (
                    <div key={comp.name} className="flex items-center justify-between">
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{comp.name}</span>
                      <div className="flex items-center gap-2">
                        <div style={{ width: "60px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${comp.score}%`, height: "100%", background: comp.score >= 80 ? "#22c55e" : comp.score >= 60 ? "#7C3AED" : comp.score >= 40 ? "#F59E0B" : "#EF4444", borderRadius: "3px" }} />
                        </div>
                        <span className="font-mono font-semibold" style={{ color: comp.score >= 80 ? "#22c55e" : comp.score >= 60 ? "#7C3AED" : comp.score >= 40 ? "#F59E0B" : "#EF4444", fontSize: "13px", minWidth: "28px" }}>
                          {comp.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Weakest area highlight */}
                {weakestArea.score < 70 && (
                  <div style={{ marginTop: "10px", padding: "8px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "6px", borderLeft: "3px solid #F59E0B" }}>
                    <p style={{ color: "#F59E0B", fontSize: "11px", fontWeight: 600 }}>Fix this first: {weakestArea.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{weakestArea.tip}</p>
                  </div>
                )}
              </div>
            )}

            {/* Click hint */}
            {analyses.length > 0 && !showScoreBreakdown && (
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "12px" }}>
                Click for breakdown
              </p>
            )}

            <MiniSparkline data={sparklineData1} color="#7C3AED" height={40} />
          </GlassPanel>
        </div>

        {/* Weekly Trend Chart */}
        <div style={{ gridColumn: "span 8" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: "#fff", fontWeight: 500 }}>Weekly Trend</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "2px" }}>Viral score over time</p>
              </div>
              <div className="flex gap-2">
                <button style={{ background: "rgba(168, 85, 247, 0.2)", color: "#a855f7", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, border: "none", cursor: "pointer" }}>7D</button>
                <button style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, border: "none", cursor: "pointer" }}>30D</button>
                <button style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, border: "none", cursor: "pointer" }}>90D</button>
              </div>
            </div>
            <ViralTrendChart />
          </GlassPanel>
        </div>

        {/* Stats Row */}
        <div style={{ gridColumn: "span 3" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                <Activity className="w-4 h-4" style={{ color: "#7C3AED" }} />
                Total Analyses
              </span>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "#fff", marginBottom: "8px" }}>
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalAnalyses}
            </div>
            <MiniSparkline data={sparklineData2} color="#7C3AED" height={35} />
          </GlassPanel>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                <Zap className="w-4 h-4" style={{ color: "#FF5757" }} />
                Viral Hits (80+)
              </span>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "#FF5757", marginBottom: "8px" }}>
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : viralCount}
            </div>
            <MiniSparkline data={sparklineData3} color="#FF5757" height={35} />
          </GlassPanel>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                <Eye className="w-4 h-4" style={{ color: "#a855f7" }} />
                Analyses Left
              </span>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "#7C3AED", marginBottom: "4px" }}>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                user ? (user.analyses_limit - user.analyses_count) : 5
              )}
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
              of {user?.analyses_limit || 5} on {user?.plan || "free"} plan
            </p>
          </GlassPanel>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "#22c55e" }} />
                Success Rate
              </span>
            </div>
            {/* Hide crushing 0% for new users - show encouraging message instead */}
            {totalAnalyses < 5 ? (
              <>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                  Building baseline...
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                  Analyze {5 - totalAnalyses} more video{5 - totalAnalyses !== 1 ? "s" : ""} to see your rate
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: "30px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: viralCount > 0 ? "#22c55e" : "#fff", marginBottom: "4px" }}>
                  {Math.round((viralCount / totalAnalyses) * 100)}%
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                  {viralCount > 0 ? `${viralCount} viral hit${viralCount !== 1 ? "s" : ""}!` : "Pro creators avg 15%"}
                </p>
              </>
            )}
          </GlassPanel>
        </div>

        {/* Monthly Performance */}
        <div style={{ gridColumn: "span 6" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: "#fff", fontWeight: 500 }}>Monthly Performance</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "2px" }}>Analyses vs Viral hits</p>
              </div>
              <Link href="/library" style={{ color: "#7C3AED", fontSize: "12px", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                View Details
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <PerformanceBarChart />
          </GlassPanel>
        </div>

        {/* Score Distribution */}
        <div style={{ gridColumn: "span 3" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <div className="mb-4">
              <h3 style={{ color: "#fff", fontWeight: 500 }}>Score Distribution</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "2px" }}>By performance tier</p>
            </div>
            <ScoreDistributionChart />
          </GlassPanel>
        </div>

        {/* Quick Actions */}
        <div style={{ gridColumn: "span 3" }}>
          <GlassPanel style={{ padding: "20px", height: "100%" }}>
            <h3 style={{ color: "#fff", fontWeight: 500, marginBottom: "16px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                href="/analyze"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(124, 58, 237, 0.12)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #7C3AED, #FF5757)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Radar className="w-5 h-5" style={{ color: "#fff" }} />
                </div>
                <div>
                  <span style={{ color: "#fff", fontWeight: 500, fontSize: "14px", display: "block" }}>New Analysis</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>Predict viral potential</span>
                </div>
                <ArrowUpRight className="w-4 h-4" style={{ color: "#7C3AED", marginLeft: "auto" }} />
              </Link>

              <Link
                href="/library"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Eye className="w-5 h-5" style={{ color: "#7C3AED" }} />
                </div>
                <div>
                  <span style={{ color: "#fff", fontWeight: 500, fontSize: "14px", display: "block" }}>View History</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{totalAnalyses} analyses saved</span>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)", marginLeft: "auto" }} />
              </Link>

              <Link
                href="/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles className="w-5 h-5" style={{ color: "#a855f7" }} />
                </div>
                <div>
                  <span style={{ color: "#fff", fontWeight: 500, fontSize: "14px", display: "block" }}>Upgrade Plan</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>Get more analyses</span>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)", marginLeft: "auto" }} />
              </Link>
            </div>
          </GlassPanel>
        </div>

        {/* Recent Analyses */}
        <div style={{ gridColumn: "span 6" }}>
          <GlassPanel style={{ padding: "20px" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: "#fff", fontWeight: 500 }}>Recent Analyses</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "2px" }}>Your latest video predictions</p>
              </div>
              <Link
                href="/library"
                style={{ color: "#c8ff00", fontSize: "12px", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
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
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", marginBottom: "16px" }}>
                  No analyses yet. Start by analyzing your first video!
                </p>
                <Link href="/analyze" className="btn btn-primary">
                  <Radar className="w-4 h-4" />
                  Analyze Video
                </Link>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4" style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "8px" }}>
                  <span className="col-span-5" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Video</span>
                  <span className="col-span-2" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</span>
                  <span className="col-span-3" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Performance</span>
                  <span className="col-span-2 text-right" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</span>
                </div>

                {/* Table Rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {analyses.slice(0, 4).map((analysis) => (
                    <RecentAnalysisRow key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              </>
            )}
          </GlassPanel>
        </div>

        {/* AI Insights */}
        <div style={{ gridColumn: "span 6" }}>
          <GlassPanel variant="strong" style={{ padding: "20px" }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #7C3AED, #FF5757)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles className="w-5 h-5" style={{ color: "#fff" }} />
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 500 }}>AI Insights</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "2px" }}>Based on your recent performance</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analyses.length === 0 ? (
                <div style={{ padding: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", textAlign: "center" }}>
                  <Target className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "12px" }}>
                    Analyze your first video to get personalized insights
                  </p>
                  <Link href="/analyze" className="btn btn-primary" style={{ display: "inline-flex" }}>
                    <Radar className="w-4 h-4" />
                    Start Analysis
                  </Link>
                </div>
              ) : (
                <>
                  {/* Primary insight - based on actual data */}
                  <InsightCard
                    title={avgScore >= 80 ? "You're on Fire!" : avgScore >= 60 ? "Solid Performance" : "Keep Learning"}
                    description={`Based on ${totalAnalyses} analysis${totalAnalyses !== 1 ? "es" : ""}: Your average score is ${avgScore}. ${avgScore >= 80 ? "You're in the top 10% of creators!" : avgScore >= 60 ? "You're above average - keep it up!" : "Each analysis helps you improve."}`}
                    trend={avgScore >= 70 ? "positive" : avgScore >= 50 ? "neutral" : "negative"}
                  />

                  {/* Specific actionable insight based on weakest area */}
                  {analyses.length > 0 && weakestArea.score < 75 && (
                    <InsightCard
                      title={`Improve Your ${weakestArea.name} Score`}
                      description={`Your ${weakestArea.name.toLowerCase()} scores average ${weakestArea.score}. ${weakestArea.tip} to boost your viral potential.`}
                      trend="neutral"
                    />
                  )}

                  {/* Best performer highlight */}
                  {viralCount > 0 && (
                    <InsightCard
                      title={`${viralCount} Viral Hit${viralCount !== 1 ? "s" : ""}!`}
                      description={`You have ${viralCount} video${viralCount !== 1 ? "s" : ""} scoring 80+. Review what worked and replicate it.`}
                      trend="positive"
                    />
                  )}

                  {/* Timing insight - only show if they have some data */}
                  {totalAnalyses >= 3 && (
                    <InsightCard
                      title="Best Posting Times"
                      description="Peak engagement: 7-9 PM EST weekdays. Schedule your best content for these windows."
                      trend="neutral"
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
      className="grid grid-cols-12 gap-4 py-3 items-center hover:bg-[var(--glass-bg)] rounded-lg px-2 -mx-2 transition-all group"
    >
      <div className="col-span-5 flex items-center gap-3">
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
        <span className="text-white text-sm font-medium truncate">
          {analysis.metadata?.author ? `@${analysis.metadata.author}` : `Video #${videoId}`}
        </span>
      </div>
      <div className="col-span-2">
        <span className="text-[var(--text-tertiary)] text-sm">{formatRelativeDate(analysis.created_at)}</span>
      </div>
      <div className="col-span-3 flex gap-1.5">
        <MiniMetric label="H" value={analysis.hook_score || 0} />
        <MiniMetric label="T" value={analysis.trend_score || 0} />
        <MiniMetric label="A" value={analysis.audio_score || 0} />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <span
          className="font-mono font-bold text-lg px-3 py-1 rounded-lg"
          style={{
            color: getScoreColor(score),
            background: getScoreBg(score),
          }}
        >
          {score}
        </span>
        <div className="btn-icon w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
