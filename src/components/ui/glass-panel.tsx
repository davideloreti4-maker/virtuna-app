"use client";

import { ReactNode, CSSProperties } from "react";

interface GlassPanelProps {
  children: ReactNode;
  variant?: "default" | "strong" | "subtle";
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
}

const variants = {
  default: {
    background: "rgba(18, 18, 24, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  strong: {
    background: "rgba(18, 18, 24, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
  },
  subtle: {
    background: "rgba(18, 18, 24, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
} as const;

export function GlassPanel({
  children,
  variant = "default",
  className = "",
  style = {},
  hover = false,
}: GlassPanelProps) {
  const variantStyles = variants[variant];

  return (
    <div
      className={className}
      style={{
        ...variantStyles,
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
        transition: hover ? "all 200ms ease" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Inner glass panel for nested elements
export function GlassInner({
  children,
  className = "",
  style = {},
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "12px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
