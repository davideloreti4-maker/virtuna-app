# Virtuna Route Map

## Overview
**App Type:** Next.js 14 App Router
**Target User:** Aspiring TikTok creators
**Core Value Prop:** AI-powered viral video prediction and content optimization

---

## Route Inventory

### Auth Routes (Unauthenticated)

| Route | Page Purpose | Primary CTA | Secondary CTAs | Requires Auth? | Role | Notes/Risks |
|-------|-------------|-------------|----------------|----------------|------|-------------|
| `/login` | User authentication | Sign In | Forgot Password, Sign Up | No | Guest | Standard email/password flow. No social auth visible - friction point for Gen-Z users. |
| `/signup` | Account creation | Create Account | Sign In | No | Guest | Requires email confirmation - adds friction. Password requirements shown but no real-time validation feedback. |
| `/forgot-password` | Password recovery | Send Reset Link | Back to Login | No | Guest | Standard flow |
| `/reset-password` | Password reset completion | Reset Password | - | No | Guest | Token-based reset |

### Dashboard Routes (Authenticated)

| Route | Page Purpose | Primary CTA | Secondary CTAs | Requires Auth? | Role | Notes/Risks |
|-------|-------------|-------------|----------------|----------------|------|-------------|
| `/` (Dashboard) | Overview of viral performance | New Analysis | View History, Upgrade Plan | Yes | User | **CRITICAL PATH** - First page users see. Shows avg score, weekly trend, stats. Empty state prompts analysis. Risk: Too much info density for new users. |
| `/analyze` | Core viral analysis via TikTok URL | Analyze Video | Upload Video | Yes | User | **AHA MOMENT PAGE** - Paste URL, get viral score. Clear value prop. Risk: TikTok URL validation may confuse users with shortened links. |
| `/analyze/upload` | Upload video file for analysis | Analyze Video (after upload) | Change File | Yes | User | Alternative input method. Supports MP4/MOV/WebM. Uses Gemini Vision. Good for pre-posting analysis. |
| `/quick-analyze` | Niche analysis without video | Analyze Niche | Popular niche chips | Yes | User | Generates content strategy for any niche. Lower friction than video analysis but less personalized value. |
| `/library` | View all past analyses | Analyze Video (empty state) | Filter, Search, View Details | Yes | User | History of analyses. Shows score breakdown (H/T/A columns). Delete functionality. Good for tracking improvement. |
| `/library/[id]` | Detailed analysis view | View on TikTok | Delete | Yes | User | Full breakdown with video metadata, engagement stats, AI suggestions. Deep value delivery page. |
| `/library/hooks` | Saved hooks collection | - | - | Yes | User | Sub-feature of library. Low discoverability. |
| `/trends` | Trending TikTok sounds | Copy Name | Filter by category/trend | Yes | User | Discovery tool. Shows sound popularity, trend direction. Valuable but not on critical path. |
| `/scripts` | AI script generator | Generate Script | Copy sections, Regenerate | Yes | User | Create video scripts by niche/topic/style. High-value feature but buried in navigation. |
| `/calendar` | Content planning calendar | Add Content | Navigate months, change status | Yes | User | Planning tool. Draft/Scheduled/Published states. Not connected to core analysis flow. |
| `/analytics` | Deep performance analytics | Notify Me | - | Yes | User | **COMING SOON** placeholder. Shows feature preview. Risk: Dead end, no real value. |
| `/leaderboard` | Community rankings | - | Switch ranking type | Yes | User | Gamification: XP, streaks, viral hits. Social proof but may demotivate new users showing 0s. |
| `/settings` | Account management | Upgrade to Pro (free users) | Edit Profile, Sign Out | Yes | User | Plan management, profile editing. Upgrade CTA prominent for free users. |

---

## Navigation Structure

### Sidebar (Desktop)
**Main Navigation:**
1. Dashboard (/)
2. Analyze (/analyze)
3. Quick Analyze (/quick-analyze)
4. Library (/library)

**Tools Section:**
1. Trends (/trends)
2. Scripts (/scripts)
3. Calendar (/calendar)
4. Analytics (/analytics)
5. Leaderboard (/leaderboard)

**Footer:**
- Settings (/settings)

### Mobile Navigation
- Bottom nav with core actions
- Hamburger for full menu

---

## Critical Path Analysis

### Ideal Aha Moment Path (Guest → Value)
1. `/signup` → Create account
2. Wait for email confirmation ⚠️ (FRICTION)
3. `/login` → Sign in
4. `/` (Dashboard) → See empty state
5. **`/analyze`** → Paste TikTok URL → Get viral score ✅ (AHA MOMENT)
6. `/library/[id]` → Deep dive into suggestions

### Current Path Issues
- **Email confirmation gap**: User must leave app, check email, come back
- **No onboarding flow**: Dumps user on empty dashboard
- **Unclear next action**: Dashboard doesn't aggressively push to first analysis
- **5-analysis limit**: Free tier wall hits fast (1 analysis left = 80% depleted)

---

## Route-Level Risk Assessment

| Route | Risk Level | Issue |
|-------|------------|-------|
| `/analytics` | HIGH | Dead-end "Coming Soon" page - broken promise |
| `/` (empty state) | HIGH | New user sees zeros everywhere - discouraging |
| `/signup` | MEDIUM | Email confirmation adds friction |
| `/leaderboard` | MEDIUM | Shows 0 XP/0 streaks for new users - demotivating |
| `/calendar` | LOW | Disconnected from core value |
| `/library/hooks` | LOW | Hidden feature, poor discoverability |

---

## Hidden/Undiscovered Routes
- `/library/hooks` - Only accessible via Library page link
- `/analyze/upload` - Only accessible via Analyze page link
- No landing page (/) for unauthenticated users - direct to login

---

## Recommendations for Route Structure
1. Add `/onboarding` flow for new users
2. Add guest-accessible `/` landing page with value prop
3. Remove or complete `/analytics` page
4. Promote `/scripts` to main nav (high value)
5. Add `/pricing` public page
6. Consider combining `/analyze` and `/quick-analyze`
