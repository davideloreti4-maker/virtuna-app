"use client";

import { useState } from "react";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe";

interface PlanComparisonProps {
  currentPlan: PlanType;
  onUpgrade: (plan: PlanType, billing: "monthly" | "yearly") => Promise<void>;
  isLoading?: boolean;
}

const COMPARISON_FEATURES = [
  { name: "Analyses per month", free: "5", pro: "100", agency: "Unlimited" },
  { name: "Score breakdown", free: "Basic", pro: "Full", agency: "Full" },
  { name: "Processing speed", free: "Standard", pro: "Priority", agency: "Priority" },
  { name: "AI suggestions", free: false, pro: true, agency: true },
  { name: "Trend insights", free: false, pro: true, agency: true },
  { name: "Script generator", free: true, pro: true, agency: true },
  { name: "Saved hooks library", free: true, pro: true, agency: true },
  { name: "Team features", free: false, pro: false, agency: "Coming soon" },
  { name: "API access", free: false, pro: false, agency: "Coming soon" },
  { name: "Priority support", free: false, pro: false, agency: true },
];

export function PlanComparison({
  currentPlan,
  onUpgrade,
  isLoading = false,
}: PlanComparisonProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleUpgrade = async (plan: PlanType) => {
    if (plan === "free" || plan === currentPlan) return;
    setLoadingPlan(plan);
    try {
      await onUpgrade(plan, billing);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPrice = (plan: PlanType) => {
    const config = PLANS[plan];
    if (plan === "free") return 0;
    if (billing === "yearly" && "priceYearly" in config) {
      return Math.round(config.priceYearly / 12);
    }
    return config.price;
  };

  const renderValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-[var(--color-success)]" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-[var(--text-muted)]" />;
    }
    return <span className="text-white">{value}</span>;
  };

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case "free":
        return <Zap className="w-5 h-5" />;
      case "pro":
        return <Sparkles className="w-5 h-5" />;
      case "agency":
        return <Crown className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billing === "monthly"
              ? "bg-[var(--accent-primary)] text-white"
              : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            billing === "yearly"
              ? "bg-[var(--accent-primary)] text-white"
              : "bg-white/10 text-[var(--text-secondary)] hover:bg-white/20"
          }`}
        >
          Yearly
          <span className="px-1.5 py-0.5 rounded bg-[var(--color-success)]/20 text-[var(--color-success)] text-xs">
            Save 17%
          </span>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10">
          <div className="text-sm text-[var(--text-muted)]">Features</div>
          {(["free", "pro", "agency"] as PlanType[]).map((plan) => (
            <div key={plan} className="text-center">
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 ${
                  plan === "pro"
                    ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                    : plan === "agency"
                    ? "bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]"
                    : "bg-white/10 text-[var(--text-muted)]"
                }`}
              >
                {getPlanIcon(plan)}
              </div>
              <p className="text-white font-semibold">{PLANS[plan].name}</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${getPrice(plan)}
                <span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
              </p>
              {currentPlan === plan && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="divide-y divide-white/5">
          {COMPARISON_FEATURES.map((feature, idx) => (
            <div
              key={feature.name}
              className={`grid grid-cols-4 gap-4 p-4 ${
                idx % 2 === 0 ? "bg-white/[0.02]" : ""
              }`}
            >
              <div className="text-sm text-[var(--text-secondary)]">{feature.name}</div>
              <div className="text-center text-sm">{renderValue(feature.free)}</div>
              <div className="text-center text-sm">{renderValue(feature.pro)}</div>
              <div className="text-center text-sm">{renderValue(feature.agency)}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-4 gap-4 p-4 border-t border-white/10 bg-black/20">
          <div />
          {(["free", "pro", "agency"] as PlanType[]).map((plan) => (
            <div key={plan} className="text-center">
              {plan === "free" ? (
                <button
                  disabled
                  className="btn w-full text-sm opacity-50 cursor-not-allowed"
                >
                  Free Forever
                </button>
              ) : plan === currentPlan ? (
                <button
                  disabled
                  className="btn w-full text-sm opacity-50 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isLoading || loadingPlan === plan}
                  className={`btn w-full text-sm ${
                    plan === "pro" ? "btn-primary" : ""
                  }`}
                >
                  {loadingPlan === plan ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Upgrade
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Yearly savings note */}
      {billing === "yearly" && (
        <p className="text-center text-sm text-[var(--text-muted)]">
          Billed annually. Pro: ${PLANS.pro.priceYearly}/year • Agency: ${PLANS.agency.priceYearly}/year
        </p>
      )}
    </div>
  );
}

// Compact comparison for upgrade modal
export function CompactPlanComparison({
  selectedPlan,
  currentPlan,
}: {
  selectedPlan: "pro" | "agency";
  currentPlan: PlanType;
}) {
  const improvements = selectedPlan === "pro"
    ? [
        { label: "Analyses", from: "5/mo", to: "100/mo" },
        { label: "Processing", from: "Standard", to: "Priority" },
        { label: "AI Suggestions", from: "No", to: "Yes" },
        { label: "Trend Insights", from: "No", to: "Yes" },
      ]
    : [
        { label: "Analyses", from: currentPlan === "free" ? "5/mo" : "100/mo", to: "Unlimited" },
        { label: "Team Features", from: "No", to: "Coming soon" },
        { label: "API Access", from: "No", to: "Coming soon" },
        { label: "Priority Support", from: "No", to: "Yes" },
      ];

  return (
    <div className="space-y-2">
      {improvements.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5"
        >
          <span className="text-[var(--text-secondary)]">{item.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] line-through">{item.from}</span>
            <ArrowRight className="w-3 h-3 text-[var(--accent-primary)]" />
            <span className="text-[var(--color-success)] font-medium">{item.to}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
