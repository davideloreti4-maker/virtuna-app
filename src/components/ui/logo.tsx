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
      {/* Diamond Logo Mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer diamond shape */}
        <path
          d="M24 2L46 24L24 46L2 24L24 2Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner diamond cutout */}
        <path
          d="M24 12L36 24L24 36L12 24L24 12Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Top triangle accent */}
        <path
          d="M24 2L24 12L12 24L2 24L24 2Z"
          fill="white"
          opacity="0.15"
        />
        {/* Right triangle accent */}
        <path
          d="M46 24L36 24L24 12L24 2L46 24Z"
          fill="white"
          opacity="0.25"
        />
        {/* Bottom triangle accent */}
        <path
          d="M24 46L24 36L36 24L46 24L24 46Z"
          fill="white"
          opacity="0.15"
        />
        {/* Left triangle accent */}
        <path
          d="M2 24L12 24L24 36L24 46L2 24Z"
          fill="white"
          opacity="0.25"
        />
      </svg>

      {showText && (
        <span className={`font-semibold tracking-tight text-white ${text}`}>
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
      <path
        d="M24 2L46 24L24 46L2 24L24 2Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M24 12L36 24L24 36L12 24L24 12Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M24 2L24 12L12 24L2 24L24 2Z"
        fill="white"
        opacity="0.15"
      />
      <path
        d="M46 24L36 24L24 12L24 2L46 24Z"
        fill="white"
        opacity="0.25"
      />
      <path
        d="M24 46L24 36L36 24L46 24L24 46Z"
        fill="white"
        opacity="0.15"
      />
      <path
        d="M2 24L12 24L24 36L24 46L2 24Z"
        fill="white"
        opacity="0.25"
      />
    </svg>
  );
}
