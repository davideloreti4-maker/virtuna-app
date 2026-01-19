"use client";

import { forwardRef, HTMLAttributes } from "react";

type GlassLevel = 1 | 2 | 3 | 4;

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  level?: GlassLevel;
  accent?: boolean;
  shine?: boolean;
  hover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = "", level = 2, accent = false, shine = false, hover = true, children, ...props }, ref) => {
    const baseClasses = accent ? "glass-card-accent" : `glass-${level}`;
    const shineClass = shine ? "glass-shine" : "";
    const hoverClass = hover && !accent ? "glass-card" : "";

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-5 ${baseClasses} ${shineClass} ${hoverClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
