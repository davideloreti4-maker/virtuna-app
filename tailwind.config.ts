import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Core backgrounds - Deep navy/black
        background: {
          DEFAULT: "#02010A",
          deep: "#000000",
          primary: "#0A0A0F",
          elevated: "#16162A",
          card: "#12121C",
          hover: "#1A1A26",
          active: "#24243A",
        },
        // Primary Brand - Electric Violet (AI/Intelligence)
        virtuna: {
          DEFAULT: "#7C3AED",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          glow: "rgba(124, 58, 237, 0.20)",
          muted: "rgba(124, 58, 237, 0.08)",
          glass: "rgba(124, 58, 237, 0.12)",
          border: "rgba(124, 58, 237, 0.30)",
        },
        // Secondary Accent - Hot Coral (Viral/Energy)
        coral: {
          DEFAULT: "#FF5757",
          50: "#FFF5F5",
          100: "#FFE5E5",
          200: "#FFCCCC",
          300: "#FFA3A3",
          400: "#FF7070",
          500: "#FF5757",
          600: "#E04545",
          700: "#C23636",
          800: "#A32929",
          900: "#7A1F1F",
          glow: "rgba(255, 87, 87, 0.20)",
          muted: "rgba(255, 87, 87, 0.08)",
          glass: "rgba(255, 87, 87, 0.12)",
          border: "rgba(255, 87, 87, 0.30)",
        },
        // Legacy alias for gradual migration
        accent: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6",
          pressed: "#6D28D9",
          glow: "rgba(124, 58, 237, 0.20)",
          muted: "rgba(124, 58, 237, 0.10)",
        },
        // Status colors
        success: {
          DEFAULT: "#22C55E",
          glow: "rgba(34, 197, 94, 0.20)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.20)",
        },
        destructive: {
          DEFAULT: "#EF4444",
          glow: "rgba(239, 68, 68, 0.20)",
        },
        // Text colors
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1B5",
          tertiary: "#6B6B80",
          muted: "#4A4A5C",
        },
        // Glass system borders
        glass: {
          border: {
            subtle: "rgba(255, 255, 255, 0.06)",
            DEFAULT: "rgba(255, 255, 255, 0.10)",
            strong: "rgba(255, 255, 255, 0.16)",
            glow: "rgba(255, 255, 255, 0.20)",
          },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "4px",
        glass: "12px",
        "glass-md": "20px",
        "glass-lg": "32px",
        "glass-xl": "48px",
      },
      boxShadow: {
        // Liquid glass shadows
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.25)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.35)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.45)",
        "glass-xl": "0 24px 64px rgba(0, 0, 0, 0.55)",
        // Brand glow effects - Violet
        "virtuna-glow": "0 0 20px rgba(124, 58, 237, 0.25), 0 0 40px rgba(124, 58, 237, 0.10)",
        "virtuna-glow-lg": "0 0 30px rgba(124, 58, 237, 0.35), 0 0 60px rgba(124, 58, 237, 0.15)",
        "accent-glow": "0 0 20px rgba(124, 58, 237, 0.25)",
        // Coral glow effects
        "coral-glow": "0 0 20px rgba(255, 87, 87, 0.25), 0 0 40px rgba(255, 87, 87, 0.10)",
        "coral-glow-lg": "0 0 30px rgba(255, 87, 87, 0.35), 0 0 60px rgba(255, 87, 87, 0.15)",
        // Inset for liquid effect
        "glass-inset": "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
        "glass-inset-lg": "inset 0 2px 4px rgba(255, 255, 255, 0.12)",
      },
      backgroundImage: {
        // Liquid glass gradients
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "glass-shine": "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, transparent 40%)",
        "glass-edge": "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)",
        // Brand gradients - Violet to Coral
        "virtuna-gradient": "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #FF5757 100%)",
        "brand-gradient-reverse": "linear-gradient(135deg, #FF5757 0%, #7C3AED 100%)",
        "accent-gradient": "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
        "coral-gradient": "linear-gradient(135deg, #FF5757 0%, #FF7070 100%)",
        // Background textures
        "navy-glow": "radial-gradient(ellipse at top, rgba(124, 58, 237, 0.08) 0%, transparent 60%)",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-pattern": "24px 24px",
      },
      keyframes: {
        // Liquid glass animations
        "liquid-shift": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "50%": { transform: "translateY(-2px) scale(1.005)", opacity: "0.95" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.20)" },
          "50%": { boxShadow: "0 0 30px rgba(124, 58, 237, 0.35)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "liquid-shift": "liquid-shift 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        glass: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        glass: "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
