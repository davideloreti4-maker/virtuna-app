"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  Lightbulb,
  Music,
  Target,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { NicheAnalysisResult } from "@/lib/api/niche-analysis";

const POPULAR_NICHES = [
  "Fitness & Workout",
  "Cooking & Recipes",
  "Beauty & Makeup",
  "Tech & Gadgets",
  "Personal Finance",
  "Fashion & Style",
  "Gaming",
  "Education & Study Tips",
  "Travel & Adventure",
  "Pet Content",
  "Comedy & Entertainment",
  "DIY & Crafts",
];

export default function QuickAnalyzePage() {
  const [niche, setNiche] = useState("");
  const [subNiche, setSubNiche] = useState("");
  const [result, setResult] = useState<NicheAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdea, setCopiedIdea] = useState<number | null>(null);

  const handleAnalyze = async (selectedNiche?: string) => {
    const nicheToAnalyze = selectedNiche || niche.trim();

    if (!nicheToAnalyze) {
      setError("Please enter a niche to analyze");
      return;
    }

    setLoading(true);
    setError("");
    if (selectedNiche) {
      setNiche(selectedNiche);
    }

    try {
      const res = await fetch("/api/quick-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: nicheToAnalyze,
          subNiche: subNiche.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNiche("");
    setSubNiche("");
    setResult(null);
    setError("");
  };

  const copyIdea = async (idea: { title: string; description: string; format: string }, index: number) => {
    const text = `${idea.title}\n\nDescription: ${idea.description}\nFormat: ${idea.format}`;
    await navigator.clipboard.writeText(text);
    setCopiedIdea(index);
    setTimeout(() => setCopiedIdea(null), 2000);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="btn-icon flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)" }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="page-title truncate">Quick Analyze</h1>
              <p className="text-[var(--text-tertiary)] text-xs sm:text-sm mt-1 truncate">
                Discover trends and strategies for any niche
              </p>
            </div>
          </div>
        </div>
      </header>

      {!result ? (
        <div className="max-w-3xl">
          {/* Input Section */}
          <GlassPanel variant="strong" style={{ padding: "24px", marginBottom: "24px" }}>
            <div className="flex items-center gap-4 mb-6">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(124, 58, 237, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search className="w-6 h-6" style={{ color: "#7C3AED" }} />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "18px" }}>Enter Your Niche</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                  Get AI-powered insights for any content niche
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px" }}>
                  Main Niche *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Fitness, Cooking, Tech Reviews..."
                  value={niche}
                  onChange={(e) => {
                    setNiche(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: error ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "15px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px" }}>
                  Sub-niche (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Home workouts, Quick recipes, Budget tech..."
                  value={subNiche}
                  onChange={(e) => setSubNiche(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "15px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "#EF4444" }}>
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={() => handleAnalyze()}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: loading ? "rgba(124, 58, 237, 0.5)" : "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing niche...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Niche
                </>
              )}
            </button>
          </GlassPanel>

          {/* Popular Niches */}
          <GlassPanel style={{ padding: "20px", marginBottom: "24px" }}>
            <h3 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              Popular Niches
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_NICHES.map((popularNiche) => (
                <button
                  key={popularNiche}
                  onClick={() => handleAnalyze(popularNiche)}
                  disabled={loading}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 150ms ease",
                  }}
                  className="hover:bg-white/10 hover:border-white/20"
                >
                  {popularNiche}
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* What You'll Get Preview */}
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              What You&apos;ll Get
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)]">
                <Lightbulb className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium block">Key Insights</span>
                  <span className="text-white/40 text-xs">Niche-specific tips</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                <TrendingUp className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium block">Trending Formats</span>
                  <span className="text-white/40 text-xs">What&apos;s working now</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.2)]">
                <Sparkles className="w-5 h-5 text-[#EC4899] flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium block">Content Ideas</span>
                  <span className="text-white/40 text-xs">Ready-to-use concepts</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]">
                <Clock className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium block">Best Times</span>
                  <span className="text-white/40 text-xs">When to post</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)]">
                <Music className="w-5 h-5 text-[#A855F7] flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium block">Sound Types</span>
                  <span className="text-white/40 text-xs">Audio recommendations</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(14,165,233,0.1)] border border-[rgba(14,165,233,0.2)]">
                <Users className="w-5 h-5 text-[#0EA5E9] flex-shrink-0" />
                <div>
                  <span className="text-white text-sm font-medium block">Audience</span>
                  <span className="text-white/40 text-xs">Who to target</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      ) : (
        <div className="max-w-5xl">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-lg sm:text-xl truncate">
                Analysis: {result.niche}
                {result.subNiche && (
                  <span className="text-white/50 font-normal"> / {result.subNiche}</span>
                )}
              </h2>
              <p className="text-white/50 text-sm">
                Tailored strategies based on current TikTok trends
              </p>
            </div>
            <button
              onClick={handleReset}
              className="btn btn-secondary flex-shrink-0 w-full sm:w-auto"
            >
              Analyze Another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* Key Insights */}
            <div className="md:col-span-12">
              <GlassPanel variant="strong" style={{ padding: "20px" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(124, 58, 237, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Lightbulb className="w-5 h-5" style={{ color: "#7C3AED" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Key Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.keyInsights.map((insight, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(124, 58, 237, 0.1)",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                      }}
                    >
                      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", lineHeight: 1.5 }}>{insight}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Trending Formats */}
            <div className="md:col-span-6">
              <GlassPanel style={{ padding: "20px", height: "100%" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(34, 197, 94, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: "#22C55E" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Trending Formats</h3>
                </div>
                <div className="space-y-2">
                  {result.trendingFormats.map((format, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#22C55E" }} />
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{format}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Winning Formulas */}
            <div className="md:col-span-6">
              <GlassPanel style={{ padding: "20px", height: "100%" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(245, 158, 11, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Target className="w-5 h-5" style={{ color: "#F59E0B" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Winning Formulas</h3>
                </div>
                <div className="space-y-2">
                  {result.winningFormulas.map((formula, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#F59E0B" }} />
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{formula}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Content Ideas */}
            <div className="md:col-span-12">
              <GlassPanel style={{ padding: "20px" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(236, 72, 153, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: "#EC4899" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Content Ideas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.contentIdeas.map((idea, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 style={{ color: "#fff", fontWeight: 500, fontSize: "14px", lineHeight: 1.4 }}>
                          {idea.title}
                        </h4>
                        <button
                          onClick={() => copyIdea(idea, i)}
                          style={{
                            padding: "4px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.05)",
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          title="Copy idea"
                        >
                          {copiedIdea === i ? (
                            <Check className="w-4 h-4" style={{ color: "#22C55E" }} />
                          ) : (
                            <Copy className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
                          )}
                        </button>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "8px" }}>
                        {idea.description}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(124, 58, 237, 0.2)",
                          color: "#a855f7",
                          fontSize: "11px",
                        }}
                      >
                        {idea.format}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Best Posting Times */}
            <div className="md:col-span-6 lg:col-span-4">
              <GlassPanel style={{ padding: "20px", height: "100%" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(59, 130, 246, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Clock className="w-5 h-5" style={{ color: "#3B82F6" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Best Posting Times</h3>
                </div>
                <div className="space-y-3">
                  {result.bestPostingTimes.map((slot, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" style={{ color: "#3B82F6" }} />
                        <span style={{ color: "#fff", fontWeight: 500, fontSize: "14px" }}>
                          {slot.day} at {slot.time}
                        </span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{slot.reason}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Trending Sound Types */}
            <div className="md:col-span-6 lg:col-span-4">
              <GlassPanel style={{ padding: "20px", height: "100%" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(168, 85, 247, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Music className="w-5 h-5" style={{ color: "#A855F7" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Sound Types to Use</h3>
                </div>
                <div className="space-y-3">
                  {result.trendingSoundTypes.map((sound, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        background: "rgba(168, 85, 247, 0.1)",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                      }}
                    >
                      <p style={{ color: "#fff", fontWeight: 500, fontSize: "13px", marginBottom: "4px" }}>
                        {sound.name}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{sound.useCase}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Audience Profile */}
            <div className="lg:col-span-4">
              <GlassPanel style={{ padding: "20px", height: "100%" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(14, 165, 233, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users className="w-5 h-5" style={{ color: "#0EA5E9" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>Audience Profile</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase", marginBottom: "4px" }}>
                      Demographics
                    </p>
                    <p style={{ color: "#fff", fontSize: "14px" }}>{result.audienceProfile.demographics}</p>
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px" }}>
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.audienceProfile.interests.map((interest, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "rgba(14, 165, 233, 0.15)",
                            color: "#0EA5E9",
                            fontSize: "12px",
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px" }}>
                      Pain Points to Address
                    </p>
                    <div className="space-y-2">
                      {result.audienceProfile.painPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span style={{ color: "#EF4444", fontSize: "12px" }}>•</span>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
