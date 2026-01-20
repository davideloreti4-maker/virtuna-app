"use client";

import { BarChart3, LineChart, PieChart, Target } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-white/60 text-sm mt-1">
          Deep insights into your viral performance
        </p>
      </header>

      {/* Coming Soon Card */}
      <div className="glass-panel p-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #FF5757 100%)",
          }}
        >
          <BarChart3 className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Advanced Analytics Coming Soon
        </h2>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          We&apos;re building comprehensive analytics to help you understand
          what makes your content go viral and track your improvement over time.
        </p>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="glass-panel p-4">
            <div className="w-10 h-10 rounded-xl bg-virtuna/20 flex items-center justify-center mx-auto mb-3">
              <LineChart className="w-5 h-5 text-virtuna" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Score Trends
            </h3>
            <p className="text-xs text-white/50">Track improvement over time</p>
          </div>

          <div className="glass-panel p-4">
            <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-5 h-5 text-coral" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Score Breakdown
            </h3>
            <p className="text-xs text-white/50">
              See which factors need work
            </p>
          </div>

          <div className="glass-panel p-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Goal Tracking
            </h3>
            <p className="text-xs text-white/50">Set and track viral goals</p>
          </div>

          <div className="glass-panel p-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">Comparisons</h3>
            <p className="text-xs text-white/50">Compare against benchmarks</p>
          </div>
        </div>

        {/* Notify Button */}
        <button
          className="mt-8 px-6 py-3 rounded-xl font-medium text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #FF5757 100%)",
            color: "white",
          }}
        >
          Notify Me When Available
        </button>
      </div>
    </div>
  );
}
