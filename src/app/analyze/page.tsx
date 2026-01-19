"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Radar, Link2, Sparkles, TrendingUp, Music, Clock, Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AnalysisResult {
  score: number;
  breakdown: {
    hook: number;
    trend: number;
    audio: number;
    timing: number;
    hashtags: number;
  };
  suggestions: string[];
}

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a TikTok URL");
      return;
    }

    if (!url.includes("tiktok.com")) {
      setError("Please enter a valid TikTok URL");
      return;
    }

    setError("");
    setLoading(true);

    // Simulate API call for now - will connect to real ML service
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock result
    setResult({
      score: Math.floor(Math.random() * 40) + 55, // 55-95 range
      breakdown: {
        hook: Math.floor(Math.random() * 30) + 65,
        trend: Math.floor(Math.random() * 30) + 60,
        audio: Math.floor(Math.random() * 30) + 55,
        timing: Math.floor(Math.random() * 30) + 50,
        hashtags: Math.floor(Math.random() * 30) + 45,
      },
      suggestions: [
        "Consider adding a stronger hook in the first 2 seconds",
        "Trending audio detected - good choice!",
        "Optimal posting time would be 7-9 PM EST",
      ],
    });

    setLoading(false);
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  return (
    <div className="page-content">
      {/* Header */}
      <header className="flex items-center gap-4 pt-4 pb-6">
        <Link href="/" className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Analyze Video</h1>
          <p className="text-[var(--text-tertiary)] text-sm">Predict viral potential</p>
        </div>
      </header>

      {!result ? (
        <>
          {/* Input Section */}
          <section className="py-4">
            <GlassCard level={2} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--virtuna-glass)] flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-[var(--virtuna)]" />
                </div>
                <div>
                  <h3 className="text-white font-medium">TikTok URL</h3>
                  <p className="text-[var(--text-tertiary)] text-xs">Paste your video link</p>
                </div>
              </div>

              <Input
                type="url"
                placeholder="https://www.tiktok.com/@user/video/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                error={error}
                icon={<Link2 className="w-4 h-4" />}
              />

              <Button
                variant="virtuna"
                size="lg"
                className="w-full"
                onClick={handleAnalyze}
                loading={loading}
              >
                <Radar className="w-5 h-5" />
                {loading ? "Analyzing..." : "Analyze Video"}
              </Button>
            </GlassCard>
          </section>

          {/* Features */}
          <section className="py-6">
            <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
              What we analyze
            </h2>
            <div className="space-y-3">
              <FeatureItem
                icon={<Sparkles className="w-4 h-4" />}
                title="Hook Strength"
                description="First 2-3 seconds impact"
              />
              <FeatureItem
                icon={<TrendingUp className="w-4 h-4" />}
                title="Trend Alignment"
                description="Current trend compatibility"
              />
              <FeatureItem
                icon={<Music className="w-4 h-4" />}
                title="Audio Analysis"
                description="Sound trend and engagement"
              />
              <FeatureItem
                icon={<Clock className="w-4 h-4" />}
                title="Timing Score"
                description="Optimal posting window"
              />
              <FeatureItem
                icon={<Hash className="w-4 h-4" />}
                title="Hashtag Analysis"
                description="Tag relevance and reach"
              />
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Results */}
          <section className="py-4">
            <GlassCard level={3} className="flex flex-col items-center py-8">
              <p className="text-[var(--text-secondary)] text-sm mb-4">Viral Score</p>
              <ScoreBadge score={result.score} size="xl" />
            </GlassCard>
          </section>

          {/* Breakdown */}
          <section className="py-4">
            <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
              Score Breakdown
            </h2>
            <div className="space-y-3">
              <BreakdownItem label="Hook" value={result.breakdown.hook} icon={<Sparkles className="w-4 h-4" />} />
              <BreakdownItem label="Trend" value={result.breakdown.trend} icon={<TrendingUp className="w-4 h-4" />} />
              <BreakdownItem label="Audio" value={result.breakdown.audio} icon={<Music className="w-4 h-4" />} />
              <BreakdownItem label="Timing" value={result.breakdown.timing} icon={<Clock className="w-4 h-4" />} />
              <BreakdownItem label="Hashtags" value={result.breakdown.hashtags} icon={<Hash className="w-4 h-4" />} />
            </div>
          </section>

          {/* Suggestions */}
          <section className="py-4">
            <h2 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
              AI Suggestions
            </h2>
            <GlassCard level={1} hover={false}>
              <ul className="space-y-3">
                {result.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[var(--virtuna)] mt-0.5">•</span>
                    <span className="text-[var(--text-secondary)] text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </section>

          {/* Actions */}
          <section className="py-4 space-y-3">
            <Button variant="secondary" size="lg" className="w-full" onClick={handleReset}>
              Analyze Another Video
            </Button>
            <Link href="/library" className="block">
              <Button variant="ghost" size="lg" className="w-full">
                View History
              </Button>
            </Link>
          </section>
        </>
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
    <GlassCard level={1} hover={false} className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-lg bg-[var(--glass-bg-2)] flex items-center justify-center text-[var(--virtuna)]">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium text-sm">{title}</h3>
        <p className="text-[var(--text-tertiary)] text-xs">{description}</p>
      </div>
    </GlassCard>
  );
}

function BreakdownItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  const getColor = (v: number) => {
    if (v >= 80) return "bg-emerald-500";
    if (v >= 60) return "bg-[var(--virtuna)]";
    if (v >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <GlassCard level={1} hover={false} className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <span className="font-data text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-[var(--glass-bg-1)] rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </GlassCard>
  );
}
