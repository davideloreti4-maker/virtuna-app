"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import { PLANS, type PlanType } from "@/lib/stripe";

interface PricingCardProps {
  plan: PlanType;
  currentPlan?: PlanType;
  onSelect?: (plan: PlanType, billing: "monthly" | "yearly") => void;
  loading?: boolean;
}

export function PricingCard({
  plan,
  currentPlan = "free",
  onSelect,
  loading = false,
}: PricingCardProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const config = PLANS[plan];
  const isCurrentPlan = plan === currentPlan;
  const isPopular = "popular" in config && config.popular;

  const price = billing === "yearly" && "priceYearly" in config
    ? config.priceYearly
    : config.price;

  const monthlyEquivalent = billing === "yearly" && "priceYearly" in config
    ? Math.round(config.priceYearly / 12)
    : config.price;

  const handleSelect = () => {
    if (onSelect && !isCurrentPlan && plan !== "free") {
      onSelect(plan, billing);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        padding: "24px",
        background: isPopular
          ? "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(255, 87, 87, 0.08))"
          : "rgba(18, 18, 24, 0.6)",
        border: isPopular
          ? "1px solid rgba(124, 58, 237, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 12px",
            background: "linear-gradient(135deg, #7C3AED, #FF5757)",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Most Popular
        </div>
      )}

      {/* Plan Name */}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 600 }}>
          {config.name}
        </h3>
      </div>

      {/* Price */}
      <div style={{ marginBottom: "20px" }}>
        {plan !== "free" && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={() => setBilling("monthly")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background:
                  billing === "monthly"
                    ? "rgba(124, 58, 237, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                color:
                  billing === "monthly"
                    ? "#7C3AED"
                    : "rgba(255, 255, 255, 0.5)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background:
                  billing === "yearly"
                    ? "rgba(124, 58, 237, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                color:
                  billing === "yearly"
                    ? "#7C3AED"
                    : "rgba(255, 255, 255, 0.5)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Yearly
              <span
                style={{
                  marginLeft: "4px",
                  color: "#22c55e",
                  fontSize: "10px",
                }}
              >
                Save 17%
              </span>
            </button>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "#fff",
              fontFamily: "var(--font-mono)",
            }}
          >
            ${monthlyEquivalent}
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>
            /month
          </span>
        </div>
        {billing === "yearly" && plan !== "free" && (
          <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px", marginTop: "4px" }}>
            Billed ${price}/year
          </p>
        )}
      </div>

      {/* Features */}
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "12px",
          }}
        >
          What&apos;s included
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {config.features.map((feature, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 0",
                borderBottom:
                  i < config.features.length - 1
                    ? "1px solid rgba(255, 255, 255, 0.06)"
                    : "none",
              }}
            >
              <Check
                style={{
                  width: "16px",
                  height: "16px",
                  color: isPopular ? "#7C3AED" : "#22c55e",
                }}
              />
              <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px" }}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSelect}
        disabled={isCurrentPlan || plan === "free" || loading}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: "12px",
          border: "none",
          background: isCurrentPlan
            ? "rgba(255, 255, 255, 0.1)"
            : isPopular
            ? "linear-gradient(135deg, #7C3AED, #8B5CF6)"
            : plan === "free"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(124, 58, 237, 0.15)",
          color: isCurrentPlan
            ? "rgba(255, 255, 255, 0.4)"
            : plan === "free"
            ? "rgba(255, 255, 255, 0.5)"
            : "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isCurrentPlan || plan === "free" ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 200ms ease",
        }}
      >
        {loading ? (
          <>
            <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
            Processing...
          </>
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : plan === "free" ? (
          "Free Forever"
        ) : (
          <>
            {isPopular ? (
              <Sparkles style={{ width: "16px", height: "16px" }} />
            ) : (
              <Zap style={{ width: "16px", height: "16px" }} />
            )}
            {currentPlan === "free" ? "Upgrade" : "Switch"} to {config.name}
          </>
        )}
      </button>
    </div>
  );
}

export function PricingGrid({
  currentPlan = "free",
  onSelect,
  loading,
}: {
  currentPlan?: PlanType;
  onSelect?: (plan: PlanType, billing: "monthly" | "yearly") => void;
  loading?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
      }}
    >
      <PricingCard plan="free" currentPlan={currentPlan} />
      <PricingCard
        plan="pro"
        currentPlan={currentPlan}
        onSelect={onSelect}
        loading={loading}
      />
      <PricingCard
        plan="agency"
        currentPlan={currentPlan}
        onSelect={onSelect}
        loading={loading}
      />
    </div>
  );
}
