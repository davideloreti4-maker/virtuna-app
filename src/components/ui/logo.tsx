"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-sm" },
    md: { icon: 32, text: "text-lg" },
    lg: { icon: 48, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Virtuna Logo Mark - Clean diamond with nested inner diamond */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#FF5757" />
          </linearGradient>
        </defs>

        {/* Outer diamond shape */}
        <path
          d="M24 2L46 24L24 46L2 24L24 2Z"
          stroke="url(#brandGradient)"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner diamond cutout */}
        <path
          d="M24 12L36 24L24 36L12 24L24 12Z"
          stroke="url(#brandGradient)"
          strokeWidth="2"
          fill="none"
        />
        {/* Top left facet */}
        <path
          d="M24 2L24 12L12 24L2 24L24 2Z"
          fill="url(#brandGradient)"
          opacity="0.12"
        />
        {/* Top right facet */}
        <path
          d="M46 24L36 24L24 12L24 2L46 24Z"
          fill="url(#brandGradient)"
          opacity="0.20"
        />
        {/* Bottom right facet */}
        <path
          d="M24 46L24 36L36 24L46 24L24 46Z"
          fill="url(#brandGradient)"
          opacity="0.12"
        />
        {/* Bottom left facet */}
        <path
          d="M2 24L12 24L24 36L24 46L2 24Z"
          fill="url(#brandGradient)"
          opacity="0.20"
        />
      </svg>

      {showText && (
        <span
          className={`font-semibold tracking-tight ${text}`}
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #FF5757 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Virtuna
        </span>
      )}
    </div>
  );
}

// Icon-only version for mobile nav or favicon
export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brandGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#FF5757" />
        </linearGradient>
      </defs>

      {/* Outer diamond */}
      <path
        d="M24 2L46 24L24 46L2 24L24 2Z"
        stroke="url(#brandGradientIcon)"
        strokeWidth="2"
        fill="none"
      />
      {/* Inner diamond */}
      <path
        d="M24 12L36 24L24 36L12 24L24 12Z"
        stroke="url(#brandGradientIcon)"
        strokeWidth="2"
        fill="none"
      />
      {/* Facets */}
      <path d="M24 2L24 12L12 24L2 24L24 2Z" fill="url(#brandGradientIcon)" opacity="0.12" />
      <path d="M46 24L36 24L24 12L24 2L46 24Z" fill="url(#brandGradientIcon)" opacity="0.20" />
      <path d="M24 46L24 36L36 24L46 24L24 46Z" fill="url(#brandGradientIcon)" opacity="0.12" />
      <path d="M2 24L12 24L24 36L24 46L2 24Z" fill="url(#brandGradientIcon)" opacity="0.20" />
    </svg>
  );
}

// Animated version for loading states
export function LogoAnimated({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-pulse ${className}`}
    >
      <defs>
        <linearGradient id="brandGradientAnimated" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#FF5757" />
        </linearGradient>
      </defs>

      {/* Outer diamond */}
      <path
        d="M24 2L46 24L24 46L2 24L24 2Z"
        stroke="url(#brandGradientAnimated)"
        strokeWidth="2"
        fill="none"
      />
      {/* Inner diamond */}
      <path
        d="M24 12L36 24L24 36L12 24L24 12Z"
        stroke="url(#brandGradientAnimated)"
        strokeWidth="2"
        fill="rgba(124, 58, 237, 0.15)"
      />
      {/* Facets with subtle animation */}
      <path d="M24 2L24 12L12 24L2 24L24 2Z" fill="url(#brandGradientAnimated)" opacity="0.12" />
      <path d="M46 24L36 24L24 12L24 2L46 24Z" fill="url(#brandGradientAnimated)" opacity="0.20" />
      <path d="M24 46L24 36L36 24L46 24L24 46Z" fill="url(#brandGradientAnimated)" opacity="0.12" />
      <path d="M2 24L12 24L24 36L24 46L2 24Z" fill="url(#brandGradientAnimated)" opacity="0.20" />
    </svg>
  );
}
