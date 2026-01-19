import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Radar, TrendingUp, Zap, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="pt-8 pb-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl glass-2 flex items-center justify-center mb-4 glow-virtuna">
            <Radar className="w-6 h-6 text-[var(--virtuna)]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Virtuna</h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-xs">
            AI-powered viral prediction for TikTok creators
          </p>
        </div>

        {/* Quick Action */}
        <Link href="/analyze" className="block">
          <GlassCard accent className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--virtuna-glass)] flex items-center justify-center">
                <Zap className="w-6 h-6 text-[var(--virtuna)]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Analyze Video</h3>
                <p className="text-[var(--text-tertiary)] text-sm">Predict viral potential</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--virtuna)]" />
          </GlassCard>
        </Link>
      </section>

      {/* Demo Score */}
      <section className="py-6">
        <h2 className="text-lg font-semibold text-white mb-4">Latest Analysis</h2>
        <GlassCard level={2} className="flex flex-col items-center py-8">
          <ScoreBadge score={78} size="lg" />
          <div className="mt-6 grid grid-cols-3 gap-4 w-full">
            <StatItem label="Hook" value="92" />
            <StatItem label="Trend" value="85" />
            <StatItem label="Audio" value="71" />
          </div>
        </GlassCard>
      </section>

      {/* Quick Stats */}
      <section className="py-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <GlassCard level={1} hover={false} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-data text-xl text-white">12</p>
                <p className="text-[var(--text-tertiary)] text-xs">Analyses</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard level={1} hover={false} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-data text-xl text-white">4</p>
                <p className="text-[var(--text-tertiary)] text-xs">Viral Hits</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6">
        <GlassCard level={3} className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-2">Ready to go viral?</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Get AI-powered insights for your next video
          </p>
          <Link href="/analyze">
            <Button variant="virtuna" size="lg">
              Start Analyzing
            </Button>
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-data text-2xl text-white">{value}</p>
      <p className="text-[var(--text-tertiary)] text-xs mt-1">{label}</p>
    </div>
  );
}
