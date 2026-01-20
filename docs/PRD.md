# Virtuna - Product Requirements Document (PRD)
## AI-Powered TikTok Viral Predictor

**Version**: 1.0.0 MVP
**Last Updated**: January 2026
**Status**: Planning Phase

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [MVP Scope Definition](#3-mvp-scope-definition)
4. [Technical Architecture](#4-technical-architecture)
5. [Feature Specifications](#5-feature-specifications)
6. [Database Schema](#6-database-schema)
7. [API Specifications](#7-api-specifications)
8. [User Flows](#8-user-flows)
9. [Testing Strategy](#9-testing-strategy)
10. [Launch Checklist](#10-launch-checklist)
11. [Development Phases](#11-development-phases)
12. [Risk Assessment](#12-risk-assessment)

---

## 1. Executive Summary

### 1.1 Product Vision
Virtuna is an AI-powered SaaS platform that helps TikTok creators predict their video's viral potential before posting. By analyzing key metrics like hook strength, trend alignment, audio selection, and posting timing, creators can optimize their content for maximum engagement.

### 1.2 Target Users
- **Primary**: TikTok content creators (10K-1M followers)
- **Secondary**: Social media managers and agencies
- **Tertiary**: Brands running TikTok campaigns

### 1.3 Core Value Proposition
"Know if your TikTok will go viral BEFORE you post it."

### 1.4 Business Model
- **Free Tier**: 5 analyses/month
- **Pro Tier**: $19/month - 100 analyses, priority processing
- **Agency Tier**: $79/month - Unlimited analyses, team features

---

## 2. Current State Analysis

### 2.1 What's Built (Frontend Complete)
| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard Page | ✅ Complete | Mock data, charts, metrics |
| Analyze Page | ✅ Complete | Mock ML simulation |
| Library Page | ✅ Complete | Mock saved analyses |
| Settings Page | ✅ Complete | UI only, non-functional |
| Sidebar Navigation | ✅ Complete | Desktop responsive |
| Mobile Navigation | ✅ Complete | Bottom nav bar |
| Glass UI Components | ✅ Complete | GlassPanel, Cards, Buttons |
| Chart Components | ✅ Complete | 4 chart types (Recharts) |
| Logo & Branding | ✅ Complete | Diamond logo, color system |

### 2.2 What's Missing (Backend Required)
| Component | Status | Priority |
|-----------|--------|----------|
| User Authentication | ❌ Not Started | P0 - Critical |
| Database Integration | ❌ Not Started | P0 - Critical |
| ML Analysis API | ❌ Not Started | P0 - Critical |
| TikTok Video Scraper | ❌ Not Started | P0 - Critical |
| Subscription/Billing | ❌ Not Started | P1 - High |
| Analytics Dashboard | ❌ Not Started | P2 - Medium |
| Trends Page | ❌ Not Started | P2 - Medium |

### 2.3 Technical Debt
1. All pages use `"use client"` - no server components
2. No error boundaries or fallback UI
3. No loading skeletons beyond button spinners
4. Empty `/lib` folder - no utilities
5. No API routes exist
6. Inline styles mixed with Tailwind classes
7. No form validation library
8. No state management (Zustand not installed)

---

## 3. MVP Scope Definition

### 3.1 MVP Features (Must Have)
1. **Authentication**
   - Email/password signup and login
   - Password reset flow
   - Session management
   - Protected routes

2. **Video Analysis**
   - TikTok URL input validation
   - Video metadata extraction
   - AI-powered viral score prediction
   - Detailed metric breakdown
   - Actionable improvement suggestions

3. **Analysis Library**
   - Save analysis history
   - View past analyses
   - Filter and search
   - Delete analyses

4. **User Dashboard**
   - Overview of viral performance
   - Recent analyses widget
   - Usage quota display
   - Quick actions

5. **Settings**
   - Profile management
   - Password change
   - Account deletion
   - Email preferences

### 3.2 Post-MVP Features (Out of Scope)
- ❌ Social login (Google, TikTok OAuth)
- ❌ Team/agency features
- ❌ Stripe billing integration
- ❌ Trending sounds explorer
- ❌ Content calendar
- ❌ Competitor tracking
- ❌ Video remix studio
- ❌ Chrome extension
- ❌ Mobile app

### 3.3 Success Metrics
| Metric | Target |
|--------|--------|
| Time to first analysis | < 30 seconds |
| Analysis completion rate | > 95% |
| User signup conversion | > 40% |
| Day 7 retention | > 25% |
| Analysis accuracy (user feedback) | > 70% positive |

---

## 4. Technical Architecture

### 4.1 Stack Specification

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  Framework:     Next.js 16.1.3 (App Router)                 │
│  Language:      TypeScript 5.6+ (strict mode)               │
│  Styling:       Tailwind CSS 4.1.x                          │
│  Components:    Radix UI Primitives + Custom Glass System   │
│  State:         Zustand v5 (global) + TanStack Query v5     │
│  Forms:         React Hook Form + Zod validation            │
│  Charts:        Recharts (already installed)                │
│  Icons:         Lucide React (already installed)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│  API:           Next.js Server Actions + Route Handlers     │
│  Auth:          Supabase Auth (email/password)              │
│  Database:      Supabase PostgreSQL                         │
│  Storage:       Supabase Storage (thumbnails)               │
│  Rate Limiting: Upstash Redis                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  ML Service:    Railway (Python FastAPI)                    │
│  Video Data:    Apify TikTok Scraper                        │
│  Email:         Resend (transactional)                      │
│  Analytics:     PostHog (product analytics)                 │
│  Monitoring:    Sentry (error tracking)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT                              │
├─────────────────────────────────────────────────────────────┤
│  Hosting:       Vercel (Next.js optimized)                  │
│  Domain:        virtuna.app                                 │
│  CDN:           Vercel Edge Network                         │
│  SSL:           Automatic via Vercel                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Directory Structure (Target)

```
src/
├── app/
│   ├── (auth)/                    # Auth group (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # Dashboard group (with sidebar)
│   │   ├── page.tsx               # Dashboard home
│   │   ├── analyze/page.tsx
│   │   ├── library/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx      # Analysis detail
│   │   ├── settings/page.tsx
│   │   ├── trends/page.tsx        # NEW
│   │   ├── analytics/page.tsx     # NEW
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts  # Supabase callback
│   │   ├── analyze/route.ts       # POST analysis
│   │   ├── analyses/
│   │   │   ├── route.ts           # GET list, POST create
│   │   │   └── [id]/route.ts      # GET, DELETE single
│   │   └── user/
│   │       └── route.ts           # GET, PATCH profile
│   ├── layout.tsx                 # Root layout
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/                        # Atomic components
│   │   ├── button.tsx             ✅ exists
│   │   ├── input.tsx              ✅ exists
│   │   ├── glass-panel.tsx        ✅ exists
│   │   ├── glass-card.tsx         ✅ exists
│   │   ├── score-badge.tsx        ✅ exists
│   │   ├── logo.tsx               ✅ exists
│   │   ├── skeleton.tsx           NEW
│   │   ├── toast.tsx              NEW
│   │   ├── modal.tsx              NEW
│   │   ├── dropdown.tsx           NEW
│   │   ├── avatar.tsx             NEW
│   │   └── spinner.tsx            NEW
│   ├── charts/                    ✅ all exist
│   ├── layout/                    ✅ all exist
│   ├── forms/                     NEW
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── analyze-form.tsx
│   │   └── settings-form.tsx
│   └── features/                  NEW
│       ├── analysis-card.tsx
│       ├── analysis-result.tsx
│       ├── metric-breakdown.tsx
│       └── ai-suggestions.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   ├── api/
│   │   ├── ml-service.ts          # ML API wrapper
│   │   └── tiktok.ts              # TikTok scraper
│   ├── utils/
│   │   ├── cn.ts                  # Class name utility
│   │   ├── format.ts              # Date/number formatting
│   │   └── validation.ts          # Zod schemas
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-analyses.ts
│   │   └── use-user.ts
│   └── store/
│       └── ui-store.ts            # Zustand store
├── types/
│   ├── database.ts                # Supabase generated types
│   ├── analysis.ts
│   └── user.ts
└── middleware.ts                  # Route protection
```

### 4.3 Package Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.5.2",
    "@tanstack/react-query": "^5.64.0",
    "zustand": "^5.0.3",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "supabase": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "playwright": "^1.49.0"
  }
}
```

---

## 5. Feature Specifications

### 5.1 Authentication System

#### 5.1.1 Signup Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │────▶│   Signup    │────▶│   Verify    │────▶│  Dashboard  │
│    Page     │     │    Form     │     │   Email     │     │   (Home)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    Validations:
                    - Email format
                    - Password 8+ chars
                    - Password confirmation
                    - Terms acceptance
```

**Fields:**
- Full Name (required, 2-50 chars)
- Email (required, valid format, unique)
- Password (required, 8+ chars, 1 number, 1 uppercase)
- Confirm Password (must match)
- Accept Terms (required checkbox)

**Error States:**
- Email already registered → "This email is already in use"
- Weak password → "Password must contain at least 8 characters, one number, and one uppercase letter"
- Network error → "Unable to connect. Please try again."

#### 5.1.2 Login Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Login    │────▶│  Validate   │────▶│  Dashboard  │
│    Form     │     │ Credentials │     │   (Home)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
  Forgot Password?
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Reset Request│────▶│ Check Email │────▶│  New Pass   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Fields:**
- Email (required)
- Password (required)
- Remember me (optional checkbox)

**Security:**
- Rate limiting: 5 attempts per 15 minutes
- Account lockout after 10 failed attempts
- Session expires after 7 days (or 30 days with "Remember me")

### 5.2 Video Analysis Engine

#### 5.2.1 Analysis Request Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  URL Input  │────▶│  Validate   │────▶│  Scrape     │────▶│  ML Model   │
│             │     │  TikTok URL │     │  Video Data │     │  Analysis   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Display   │◀────│    Save     │◀────│  Generate   │◀────│   Score     │
│   Results   │     │  to Library │     │ Suggestions │     │ Calculation │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

#### 5.2.2 Scoring Metrics

| Metric | Weight | Description | Data Source |
|--------|--------|-------------|-------------|
| Hook Strength | 25% | First 3 seconds engagement potential | Video frames analysis |
| Trend Alignment | 25% | Match with current viral trends | Hashtags, sounds, effects |
| Audio Score | 20% | Music/sound viral potential | Audio fingerprint, trending sounds DB |
| Timing Score | 15% | Optimal posting time prediction | Historical engagement patterns |
| Hashtag Score | 15% | Hashtag strategy effectiveness | Hashtag popularity, relevance |

#### 5.2.3 Score Ranges

| Range | Label | Color | Meaning |
|-------|-------|-------|---------|
| 90-100 | Ultra Viral | Emerald | Exceptional potential, post immediately |
| 80-89 | Viral | Emerald | High probability of going viral |
| 60-79 | High Potential | Cyan | Good chance with minor optimizations |
| 40-59 | Moderate | Amber | Needs improvements, review suggestions |
| 20-39 | Low | Red | Significant changes recommended |
| 0-19 | Very Low | Red | Major rework needed |

#### 5.2.4 Analysis Response Schema

```typescript
interface AnalysisResult {
  id: string;
  userId: string;
  videoUrl: string;
  videoId: string;

  // Scores (0-100)
  overallScore: number;
  hookScore: number;
  trendScore: number;
  audioScore: number;
  timingScore: number;
  hashtagScore: number;

  // Video Metadata
  metadata: {
    author: string;
    authorAvatar: string;
    description: string;
    duration: number;
    thumbnailUrl: string;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    viewCount: number;
    hashtags: string[];
    soundName: string;
    soundAuthor: string;
  };

  // AI Suggestions
  suggestions: {
    category: 'hook' | 'trend' | 'audio' | 'timing' | 'hashtag';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
  }[];

  // Timestamps
  createdAt: string;
  processingTime: number; // milliseconds
}
```

### 5.3 Analysis Library

#### 5.3.1 List View Features
- **Sorting**: By date (newest/oldest), by score (highest/lowest)
- **Filtering**: By score range, by date range
- **Search**: By video description, author, hashtags
- **Pagination**: 20 items per page, infinite scroll
- **Bulk Actions**: Delete multiple analyses

#### 5.3.2 Detail View Features
- Full score breakdown with visual charts
- Video thumbnail and metadata
- AI suggestions with action items
- Re-analyze button
- Share results (copy link)
- Export as PDF

### 5.4 User Settings

#### 5.4.1 Profile Section
- Update full name
- Update email (requires verification)
- Upload avatar (max 2MB, jpg/png)

#### 5.4.2 Security Section
- Change password
- View active sessions
- Sign out all devices

#### 5.4.3 Preferences Section
- Email notifications (on/off)
- Analysis default settings
- Theme preference (always dark for MVP)

#### 5.4.4 Account Section
- View usage (analyses this month)
- View plan details
- Delete account (with confirmation)

---

## 6. Database Schema

### 6.1 Supabase Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  analyses_count INTEGER NOT NULL DEFAULT 0,
  analyses_limit INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analyses table
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Video info
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,

  -- Scores
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  hook_score INTEGER NOT NULL CHECK (hook_score >= 0 AND hook_score <= 100),
  trend_score INTEGER NOT NULL CHECK (trend_score >= 0 AND trend_score <= 100),
  audio_score INTEGER NOT NULL CHECK (audio_score >= 0 AND audio_score <= 100),
  timing_score INTEGER NOT NULL CHECK (timing_score >= 0 AND timing_score <= 100),
  hashtag_score INTEGER NOT NULL CHECK (hashtag_score >= 0 AND hashtag_score <= 100),

  -- Metadata (JSONB for flexibility)
  metadata JSONB NOT NULL DEFAULT '{}',

  -- AI suggestions
  suggestions JSONB NOT NULL DEFAULT '[]',

  -- Processing info
  processing_time INTEGER, -- milliseconds

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_analyses_overall_score ON public.analyses(overall_score DESC);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment analysis count
CREATE OR REPLACE FUNCTION public.increment_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET analyses_count = analyses_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new analysis
CREATE TRIGGER on_analysis_created
  AFTER INSERT ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.increment_analyses_count();
```

### 6.2 TypeScript Types (Generated)

```typescript
// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          plan: 'free' | 'pro' | 'agency'
          analyses_count: number
          analyses_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'agency'
          analyses_count?: number
          analyses_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'agency'
          analyses_count?: number
          analyses_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          video_url: string
          video_id: string
          overall_score: number
          hook_score: number
          trend_score: number
          audio_score: number
          timing_score: number
          hashtag_score: number
          metadata: Json
          suggestions: Json
          processing_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_url: string
          video_id: string
          overall_score: number
          hook_score: number
          trend_score: number
          audio_score: number
          timing_score: number
          hashtag_score: number
          metadata?: Json
          suggestions?: Json
          processing_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_url?: string
          video_id?: string
          overall_score?: number
          hook_score?: number
          trend_score?: number
          audio_score?: number
          timing_score?: number
          hashtag_score?: number
          metadata?: Json
          suggestions?: Json
          processing_time?: number | null
          created_at?: string
        }
      }
    }
  }
}
```

---

## 7. API Specifications

### 7.1 Authentication Endpoints

#### POST /api/auth/signup
```typescript
// Request
{
  email: string;
  password: string;
  fullName: string;
}

// Response 201
{
  user: { id: string; email: string; };
  message: "Check your email to confirm your account";
}

// Response 400
{
  error: "Email already registered" | "Invalid email format" | "Password too weak";
}
```

#### POST /api/auth/login
```typescript
// Request
{
  email: string;
  password: string;
}

// Response 200
{
  user: { id: string; email: string; };
  session: { access_token: string; expires_at: number; };
}

// Response 401
{
  error: "Invalid credentials";
}
```

#### POST /api/auth/logout
```typescript
// Response 200
{
  message: "Logged out successfully";
}
```

#### POST /api/auth/forgot-password
```typescript
// Request
{
  email: string;
}

// Response 200
{
  message: "If an account exists, a reset link has been sent";
}
```

### 7.2 Analysis Endpoints

#### POST /api/analyze
```typescript
// Request
{
  videoUrl: string; // TikTok URL
}

// Response 200
{
  analysis: AnalysisResult;
}

// Response 400
{
  error: "Invalid TikTok URL" | "Video not found" | "Video is private";
}

// Response 403
{
  error: "Analysis limit reached";
  upgradeUrl: "/settings?upgrade=true";
}

// Response 500
{
  error: "Analysis failed. Please try again.";
}
```

#### GET /api/analyses
```typescript
// Query params
{
  page?: number;      // default 1
  limit?: number;     // default 20, max 100
  sort?: 'date' | 'score';  // default 'date'
  order?: 'asc' | 'desc';   // default 'desc'
  minScore?: number;  // 0-100
  maxScore?: number;  // 0-100
  search?: string;    // search in description
}

// Response 200
{
  analyses: AnalysisResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### GET /api/analyses/[id]
```typescript
// Response 200
{
  analysis: AnalysisResult;
}

// Response 404
{
  error: "Analysis not found";
}
```

#### DELETE /api/analyses/[id]
```typescript
// Response 200
{
  message: "Analysis deleted";
}

// Response 404
{
  error: "Analysis not found";
}
```

### 7.3 User Endpoints

#### GET /api/user
```typescript
// Response 200
{
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    plan: 'free' | 'pro' | 'agency';
    analysesCount: number;
    analysesLimit: number;
    createdAt: string;
  };
}
```

#### PATCH /api/user
```typescript
// Request
{
  fullName?: string;
  avatarUrl?: string;
}

// Response 200
{
  user: { ... };
}
```

#### DELETE /api/user
```typescript
// Request
{
  confirmation: "DELETE MY ACCOUNT";
}

// Response 200
{
  message: "Account deleted";
}
```

---

## 8. User Flows

### 8.1 New User Onboarding
```
1. Land on marketing page (future) or /login
2. Click "Sign Up"
3. Fill signup form → Submit
4. See "Check your email" message
5. Click verification link in email
6. Redirected to /dashboard
7. See empty state with "Run Your First Analysis" CTA
8. Click CTA → Navigate to /analyze
9. Paste TikTok URL → Click Analyze
10. See loading state (2-5 seconds)
11. See results with score breakdown
12. Results auto-saved to Library
```

### 8.2 Returning User Analysis
```
1. Navigate to app (auto-login if session valid)
2. See dashboard with recent analyses
3. Click "New Analysis" or navigate to /analyze
4. Paste TikTok URL
5. See results
6. Optionally view suggestions
7. Navigate to Library to see history
```

### 8.3 Password Reset
```
1. Click "Forgot Password" on login page
2. Enter email → Submit
3. See "Check your email" message
4. Click reset link in email
5. Enter new password (twice)
6. See success message
7. Redirected to login
8. Login with new password
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)
- [ ] Utility functions (format, validation)
- [ ] Zod schemas
- [ ] Custom hooks
- [ ] UI components (basic render tests)

### 9.2 Integration Tests (Testing Library)
- [ ] Auth forms (signup, login, reset)
- [ ] Analysis form submission
- [ ] Library filtering and sorting
- [ ] Settings form updates

### 9.3 E2E Tests (Playwright)
- [ ] Complete signup flow
- [ ] Complete login flow
- [ ] Complete analysis flow
- [ ] Password reset flow
- [ ] Account deletion flow

### 9.4 Test Coverage Targets
| Category | Target |
|----------|--------|
| Unit | 80% |
| Integration | 60% |
| E2E | Critical paths 100% |

---

## 10. Launch Checklist

### 10.1 Pre-Launch (Development Complete)
- [ ] All MVP features implemented
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

### 10.2 Infrastructure
- [ ] Supabase project configured
- [ ] Database migrations run
- [ ] RLS policies tested
- [ ] Vercel project connected
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL verified

### 10.3 Monitoring
- [ ] Sentry configured
- [ ] Error boundaries in place
- [ ] PostHog analytics installed
- [ ] Uptime monitoring (optional)

### 10.4 Legal/Compliance
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance (EU users)

### 10.5 Go-Live
- [ ] Production build successful
- [ ] Smoke test on production
- [ ] Backup strategy documented
- [ ] Rollback plan ready

---

## 11. Development Phases

### Phase 1: Foundation (Days 1-2)
**Goal**: Set up backend infrastructure and auth

| Task | Estimate | Priority |
|------|----------|----------|
| Install new dependencies | 1h | P0 |
| Set up Supabase project | 1h | P0 |
| Create database schema | 2h | P0 |
| Configure Supabase client | 2h | P0 |
| Implement auth middleware | 2h | P0 |
| Build signup page | 3h | P0 |
| Build login page | 2h | P0 |
| Build forgot/reset password | 2h | P0 |
| Test auth flows | 2h | P0 |

**Deliverable**: Working authentication system

### Phase 2: Core Features (Days 3-5)
**Goal**: Connect real analysis engine

| Task | Estimate | Priority |
|------|----------|----------|
| Create API route for analysis | 3h | P0 |
| Integrate ML service | 4h | P0 |
| Integrate TikTok scraper | 3h | P0 |
| Update analyze page (real data) | 3h | P0 |
| Save analyses to database | 2h | P0 |
| Update library page (real data) | 3h | P0 |
| Analysis detail page | 3h | P0 |
| Update dashboard (real data) | 4h | P0 |

**Deliverable**: Working analysis system with persistence

### Phase 3: Polish & Settings (Days 6-7)
**Goal**: Complete user experience

| Task | Estimate | Priority |
|------|----------|----------|
| Settings - Profile update | 2h | P1 |
| Settings - Password change | 2h | P1 |
| Settings - Account deletion | 2h | P1 |
| Usage quota enforcement | 2h | P1 |
| Loading skeletons | 2h | P1 |
| Error boundaries | 2h | P1 |
| Toast notifications | 2h | P1 |
| Empty states | 1h | P1 |

**Deliverable**: Polished user experience

### Phase 4: Testing & Launch (Days 8-9)
**Goal**: Quality assurance and deployment

| Task | Estimate | Priority |
|------|----------|----------|
| Write unit tests | 4h | P1 |
| Write E2E tests | 4h | P1 |
| Fix bugs from testing | 4h | P0 |
| Performance optimization | 2h | P1 |
| Deploy to Vercel | 2h | P0 |
| Production testing | 2h | P0 |
| Documentation | 2h | P2 |

**Deliverable**: Production-ready MVP

---

## 12. Risk Assessment

### 12.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| ML service latency | High | Medium | Implement timeout, queue system |
| TikTok blocks scraping | High | Medium | Use Apify with proxy rotation |
| Supabase rate limits | Medium | Low | Implement caching, optimize queries |
| Vercel cold starts | Low | Low | Use Edge Functions where possible |

### 12.2 Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low accuracy scores | High | Medium | Add user feedback loop, iterate model |
| TikTok API changes | High | Medium | Abstract scraping layer, monitor changes |
| Competitors | Medium | High | Focus on UX, speed, accuracy |

### 12.3 Contingency Plans

1. **If ML service fails**: Fall back to rule-based scoring
2. **If TikTok blocks**: Implement manual video upload
3. **If launch delayed**: Cut Analytics and Trends pages from MVP

---

## Appendix A: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ML Service
ML_SERVICE_URL=https://ml-api.railway.app
ML_SERVICE_API_KEY=xxx

# TikTok Scraper (Apify)
APIFY_API_TOKEN=xxx
APIFY_TIKTOK_ACTOR_ID=xxx

# App
NEXT_PUBLIC_APP_URL=https://virtuna.app

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=xxx
SENTRY_DSN=xxx
```

---

## Appendix B: Component Library Reference

### Existing Components (Keep)
- `GlassPanel` - Primary container
- `GlassCard` - Secondary container
- `Button` - All button variants
- `Input` - Form input with label/error
- `ScoreBadge` - Score display
- `Logo` - Brand logo

### New Components (Build)
- `Skeleton` - Loading placeholders
- `Toast` - Notification system
- `Modal` - Dialog windows
- `Dropdown` - Menu dropdowns
- `Avatar` - User avatars
- `Spinner` - Loading spinners
- `EmptyState` - No data states
- `ErrorBoundary` - Error fallback

---

## Appendix C: Design Tokens

```css
/* Already configured in tailwind.config.ts */
--virtuna: #00E5CC;      /* Primary brand cyan */
--accent: #8B5CF6;       /* Secondary purple */
--accent-primary: #C8FF00; /* Lime green highlight */
--background: #02010A;   /* Deep black */
--background-card: #12121C; /* Card background */
--glass-border: rgba(255,255,255,0.08);
--glass-bg: rgba(255,255,255,0.05);
```

---

**End of PRD**

*This document should be treated as the source of truth for MVP development. Any scope changes must be documented and approved.*
