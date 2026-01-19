"use client";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-[var(--virtuna)]";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function getScoreGlow(score: number): string {
  if (score >= 80) return "shadow-[0_0_20px_rgba(52,211,153,0.3)]";
  if (score >= 60) return "shadow-[0_0_20px_var(--virtuna-glow)]";
  if (score >= 40) return "shadow-[0_0_20px_rgba(251,191,36,0.3)]";
  return "shadow-[0_0_20px_rgba(248,113,113,0.3)]";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Ultra Viral";
  if (score >= 60) return "High Potential";
  if (score >= 40) return "Moderate";
  return "Low";
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl",
};

export function ScoreBadge({ score, size = "md", showLabel = true }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score);
  const glowClass = getScoreGlow(score);
  const label = getScoreLabel(score);
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`glass-2 rounded-2xl p-6 ${glowClass} transition-all duration-300`}
      >
        <span className={`score-display ${sizeClass} ${colorClass}`}>
          {score.toFixed(0)}
        </span>
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${colorClass}`}>
          {label}
        </span>
      )}
    </div>
  );
}
