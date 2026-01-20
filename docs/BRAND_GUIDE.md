# Virtuna Brand Guide

## Brand Identity

**Name:** Virtuna
**Tagline:** "Know before you post" (or "Predict your viral moment")
**Positioning:** AI-powered viral intelligence platform for content creators

---

## Brand Concept: "Viral Intelligence"

The Virtuna brand represents the intersection of:
- **Intelligence** (AI, data analysis, prediction)
- **Viral Energy** (dynamic, trending, explosive growth)

---

## Color System

### Primary Palette

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Electric Violet** | `#7C3AED` | rgb(124, 58, 237) | Primary brand, AI/intelligence |
| **Violet Light** | `#8B5CF6` | rgb(139, 92, 246) | Hover states |
| **Violet Dark** | `#6D28D9` | rgb(109, 40, 217) | Pressed states |

### Secondary Palette

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Hot Coral** | `#FF5757` | rgb(255, 87, 87) | Viral/energy accent |
| **Coral Light** | `#FF7070` | rgb(255, 112, 112) | Hover states |
| **Coral Dark** | `#E04545` | rgb(224, 69, 69) | Pressed states |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Success/Viral** | `#10B981` | High scores (80+), positive trends |
| **Warning** | `#F59E0B` | Moderate scores (40-59), caution |
| **Danger** | `#EF4444` | Low scores (<40), errors |

### Background System

| Color | Hex | Usage |
|-------|-----|-------|
| **Deep Space** | `#0A0A0C` | Page background |
| **Card** | `#12121C` | Glass panels, cards |
| **Elevated** | `#16162A` | Hover states, elevated surfaces |

### Brand Gradients

```css
/* Primary brand gradient - use for CTAs, hero elements */
--gradient-brand: linear-gradient(135deg, #7C3AED 0%, #FF5757 100%);

/* Reverse for variation */
--gradient-brand-reverse: linear-gradient(135deg, #FF5757 0%, #7C3AED 100%);

/* Violet only - for subtle brand elements */
--gradient-virtuna: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);

/* Background glow effect */
--gradient-glow: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15), transparent 70%);
```

---

## Typography

### Font Families

| Font | Usage | Weight Range |
|------|-------|--------------|
| **Inter** | Body text, UI elements | 400-600 |
| **JetBrains Mono** | Numbers, scores, data | 400-800 |

### Type Scale

| Size | Usage |
|------|-------|
| 60-96px | Hero scores |
| 28-32px | Page headings |
| 18-24px | Section headings |
| 14-16px | Body text |
| 11-13px | Labels, metadata |

---

## Logo

### Logo Mark Concept

The Virtuna logo combines three symbolic elements:

1. **Hexagon** - Represents data/analytics structure
2. **Outer Circle** - Represents reach/viral spread
3. **Pulse Line** - Represents viral moment/trending

### Logo Colors

- Primary: Electric Violet to Hot Coral gradient
- Monochrome: Single color violet for simple applications
- Never use pure white (loses brand identity)

### Logo Sizes

| Size | Usage |
|------|-------|
| Large (48px) | Marketing, hero sections |
| Medium (32px) | Navigation, standard use |
| Small (24px) | Dense UI, mobile |
| Icon (16px) | Favicon, browser tabs |

---

## UI Component Colors

### Buttons

| Type | Style |
|------|-------|
| **Primary CTA** | Gradient background (violet to coral), white text |
| **Secondary** | Glass background, white text |
| **Ghost** | Transparent, text color on hover |

### Score Badges

| Range | Color | Label |
|-------|-------|-------|
| 80-100 | Success (#10B981) | "Viral" |
| 60-79 | Violet (#7C3AED) | "Good" |
| 40-59 | Warning (#F59E0B) | "Moderate" |
| 0-39 | Danger (#EF4444) | "Low" |

### Glass Panels

```css
.glass-panel {
  background: rgba(18, 18, 24, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}
```

---

## Voice & Tone

### Brand Voice

- **Confident** - We know what goes viral
- **Data-driven** - Decisions backed by analysis
- **Approachable** - Professional but not stuffy
- **Helpful** - Focus on creator success

### Example Copy

**Do:** "Your hook needs more impact. Try opening with a question."
**Don't:** "Hook score suboptimal. Optimization required."

**Do:** "This could go viral! Great audio choice."
**Don't:** "Audio score: 87/100. Above threshold."

---

## Accessibility

- All text meets WCAG 2.1 AA contrast requirements
- Interactive elements have visible focus states
- Color is never the only indicator of state
- Animations respect `prefers-reduced-motion`

---

## Files Updated

The following files contain the new brand system:

- `src/app/globals.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind color tokens
- `src/components/ui/logo.tsx` - Logo component
- `src/components/layout/sidebar.tsx` - Navigation colors
- `src/app/(dashboard)/page.tsx` - Dashboard colors
- `src/components/charts/*.tsx` - Chart colors

---

## Migration Notes

### Old → New Color Mapping

| Old (Lime/Cyan) | New (Violet/Coral) |
|-----------------|-------------------|
| `#C8FF00` | `#7C3AED` |
| `#00E5CC` | `#7C3AED` or `#FF5757` |
| `#A855F7` | `#7C3AED` |

### CSS Variable Aliases

For backward compatibility, the following aliases exist:
- `--accent-cyan` → `--accent-primary` (#7C3AED)
- `--accent-purple` → `--accent-primary` (#7C3AED)

These should be migrated to the new variable names over time.
