"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Zap,
  Check,
  TrendingUp,
  Clock,
  Brain,
  BarChart3,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  usedAnalyses: number;
  limitAnalyses: number;
  onUpgrade: (plan: PlanType, billing: "monthly" | "yearly") => Promise<void>;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  usedAnalyses,
  limitAnalyses,
  onUpgrade,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade(selectedPlan, billing);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConfig = PLANS[selectedPlan];
  const price = billing === "yearly" && "priceYearly" in selectedConfig
    ? Math.round(selectedConfig.priceYearly / 12)
    : selectedConfig.price;

  const yearlyTotal = "priceYearly" in selectedConfig ? selectedConfig.priceYearly : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(124, 58, 237, 0.1) 0%, rgba(18, 18, 24, 0.98) 30%)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
        }}
      >
        {/* Header with gradient */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn-icon hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
              }}
            >
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You&apos;ve Hit Your Limit!
            </h2>
            <p className="text-[var(--text-tertiary)]">
              You&apos;ve used <span className="text-white font-semibold">{usedAnalyses}/{limitAnalyses}</span> analyses this month.
              Upgrade to keep analyzing and growing your content.
            </p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="px-6 pb-4">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setSelectedPlan("pro")}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                selectedPlan === "pro"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Pro</span>
                {selectedPlan === "pro" && (
                  <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                )}
              </div>
              <p className="text-2xl font-bold text-white">
                $19<span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">100 analyses/month</p>
            </button>

            <button
              onClick={() => setSelectedPlan("agency")}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                selectedPlan === "agency"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Agency</span>
                {selectedPlan === "agency" && (
                  <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                )}
              </div>
              <p className="text-2xl font-bold text-white">
                $79<span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Unlimited analyses</p>
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billing === "monthly"
                  ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                  : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                  : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 rounded bg-[var(--color-success)]/20 text-[var(--color-success)] text-xs">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* What You Get */}
        <div className="px-6 pb-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            What you&apos;ll unlock
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-[var(--text-secondary)]">
                {selectedPlan === "agency" ? "Unlimited" : "100"} analyses
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-[var(--text-secondary)]">AI suggestions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-[var(--text-secondary)]">Priority processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-[var(--text-secondary)]">Trend insights</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 bg-black/30">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="btn btn-primary w-full text-base py-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Upgrade to {selectedConfig.name} - ${price}/mo
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          {billing === "yearly" && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              Billed ${yearlyTotal}/year
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact inline upgrade prompt for settings/dashboard
interface UpgradePromptProps {
  usedAnalyses: number;
  limitAnalyses: number;
  onUpgrade: () => void;
  variant?: "inline" | "banner";
}

export function UpgradePrompt({
  usedAnalyses,
  limitAnalyses,
  onUpgrade,
  variant = "inline",
}: UpgradePromptProps) {
  const percentage = Math.round((usedAnalyses / limitAnalyses) * 100);
  const remaining = limitAnalyses - usedAnalyses;
  const isLow = remaining <= 2;
  const isAtLimit = remaining === 0;

  if (variant === "banner") {
    return (
      <div
        className={`p-4 rounded-xl ${
          isAtLimit
            ? "bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30"
            : isLow
            ? "bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30"
            : "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isAtLimit
                  ? "bg-[var(--color-danger)]/20"
                  : isLow
                  ? "bg-[var(--color-warning)]/20"
                  : "bg-[var(--accent-primary)]/20"
              }`}
            >
              <Zap
                className={`w-5 h-5 ${
                  isAtLimit
                    ? "text-[var(--color-danger)]"
                    : isLow
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--accent-primary)]"
                }`}
              />
            </div>
            <div>
              <p className="text-white font-medium">
                {isAtLimit
                  ? "No analyses remaining"
                  : isLow
                  ? `Only ${remaining} ${remaining === 1 ? "analysis" : "analyses"} left`
                  : `${remaining} analyses remaining`}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {isAtLimit
                  ? "Upgrade to continue analyzing videos"
                  : "Upgrade for unlimited access"}
              </p>
            </div>
          </div>
          <button onClick={onUpgrade} className="btn btn-primary whitespace-nowrap">
            <Sparkles className="w-4 h-4" />
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)]">Usage this month</span>
        <span
          className={`text-sm font-medium ${
            isAtLimit
              ? "text-[var(--color-danger)]"
              : isLow
              ? "text-[var(--color-warning)]"
              : "text-white"
          }`}
        >
          {usedAnalyses}/{limitAnalyses}
        </span>
      </div>
      <div className="breakdown-bar mb-3">
        <div
          className={`breakdown-bar-fill ${
            isAtLimit
              ? "bg-[var(--color-danger)]"
              : isLow
              ? "bg-[var(--color-warning)]"
              : "breakdown-bar-fill--accent"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {(isLow || isAtLimit) && (
        <button
          onClick={onUpgrade}
          className="btn btn-primary w-full text-sm"
        >
          <Sparkles className="w-4 h-4" />
          {isAtLimit ? "Upgrade to Continue" : "Upgrade for More"}
        </button>
      )}
    </div>
  );
}
