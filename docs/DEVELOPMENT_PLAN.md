# Virtuna MVP - Development Plan
## Complete Implementation Guide

**Duration**: 9 Development Days
**Start Date**: TBD
**Target Launch**: TBD

---

## Quick Reference

### Development Order
```
Phase 1 (Days 1-2): Foundation & Auth
Phase 2 (Days 3-5): Core Features
Phase 3 (Days 6-7): Polish & Settings
Phase 4 (Days 8-9): Testing & Launch
```

### Priority Legend
- 🔴 P0 - Blocker (must complete)
- 🟠 P1 - Important (should complete)
- 🟡 P2 - Nice to have (can defer)

---

## Pre-Development Setup

### 0.1 Install Dependencies
```bash
# Core dependencies
pnpm add @supabase/supabase-js@^2.49.0 @supabase/ssr@^0.5.2

# Data fetching & state
pnpm add @tanstack/react-query@^5.64.0 zustand@^5.0.3

# Forms & validation
pnpm add react-hook-form@^7.54.0 @hookform/resolvers@^3.9.0 zod@^3.24.0

# Radix UI primitives
pnpm add @radix-ui/react-dialog@^1.1.4 @radix-ui/react-dropdown-menu@^2.1.4
pnpm add @radix-ui/react-toast@^1.2.4 @radix-ui/react-avatar@^1.1.2
pnpm add @radix-ui/react-tabs@^1.1.2 @radix-ui/react-slot@^1.1.0

# Utilities
pnpm add clsx@^2.1.1 tailwind-merge@^2.6.0 date-fns@^4.1.0

# Dev dependencies
pnpm add -D supabase@^2.0.0
pnpm add -D vitest@^2.1.0 @vitejs/plugin-react@^4.3.0
pnpm add -D @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.6.0
pnpm add -D playwright@^1.49.0
```

### 0.2 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Create new project: "virtuna-production"
3. Wait for database provisioning
4. Copy project URL and anon key

### 0.3 Environment Setup
```bash
# Create .env.local (DO NOT COMMIT)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# ML Service (configure later)
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_API_KEY=dev-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 1: Foundation & Auth (Days 1-2)

### Day 1: Infrastructure Setup

#### 1.1 🔴 Create Utility Functions
**File**: `src/lib/utils/cn.ts`
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**File**: `src/lib/utils/format.ts`
```typescript
import { formatDistanceToNow, format } from 'date-fns'

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern)
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}
```

#### 1.2 🔴 Create Validation Schemas
**File**: `src/lib/utils/validation.ts`
```typescript
import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const analyzeSchema = z.object({
  videoUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      url => url.includes('tiktok.com') || url.includes('vm.tiktok.com'),
      'Please enter a valid TikTok URL'
    ),
})

export const profileSchema = z.object({
  fullName: z.string().min(2).max(50),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type AnalyzeInput = z.infer<typeof analyzeSchema>
export type ProfileInput = z.infer<typeof profileSchema>
```

#### 1.3 🔴 Set Up Supabase Clients
**File**: `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File**: `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**File**: `src/lib/supabase/admin.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

#### 1.4 🔴 Create Database Types
**File**: `src/types/database.ts`
*(Copy from PRD Section 6.2)*

**File**: `src/types/analysis.ts`
```typescript
import type { Database } from './database'

export type Analysis = Database['public']['Tables']['analyses']['Row']
export type AnalysisInsert = Database['public']['Tables']['analyses']['Insert']

export interface VideoMetadata {
  author: string
  authorAvatar: string
  description: string
  duration: number
  thumbnailUrl: string
  likeCount: number
  commentCount: number
  shareCount: number
  viewCount: number
  hashtags: string[]
  soundName: string
  soundAuthor: string
}

export interface AISuggestion {
  category: 'hook' | 'trend' | 'audio' | 'timing' | 'hashtag'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
}

export interface AnalysisWithDetails extends Analysis {
  metadata: VideoMetadata
  suggestions: AISuggestion[]
}
```

**File**: `src/types/user.ts`
```typescript
import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface UserWithProfile {
  id: string
  email: string
  profile: Profile
}
```

#### 1.5 🔴 Run Database Migrations
```bash
# Initialize Supabase locally (optional)
pnpm supabase init

# Create migration file
pnpm supabase migration new initial_schema

# Paste schema from PRD Section 6.1 into migration file
# Then push to remote
pnpm supabase db push
```

#### 1.6 🔴 Create Auth Middleware
**File**: `src/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Day 2: Auth Pages

#### 2.1 🔴 Create Auth Layout
**File**: `src/app/(auth)/layout.tsx`
```typescript
import { Logo } from '@/components/ui/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
         style={{ background: 'linear-gradient(135deg, #02010A 0%, #0A0A0F 100%)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText />
        </div>
        {children}
      </div>
    </div>
  )
}
```

#### 2.2 🔴 Create Login Page
**File**: `src/app/(auth)/login/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <GlassPanel variant="strong" style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>
        Welcome back
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
        Sign in to your account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div style={{ textAlign: 'right' }}>
          <Link href="/forgot-password" style={{ color: '#00e5cc', fontSize: '14px', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="virtuna" size="lg" loading={isSubmitting} style={{ width: '100%' }}>
          Sign In
        </Button>
      </form>

      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: '#00e5cc', textDecoration: 'none' }}>
          Sign up
        </Link>
      </p>
    </GlassPanel>
  )
}
```

#### 2.3 🔴 Create Signup Page
**File**: `src/app/(auth)/signup/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupInput) {
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <GlassPanel variant="strong" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle style={{ width: '32px', height: '32px', color: '#22c55e' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
          Check your email
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          We've sent you a confirmation link. Click it to activate your account.
        </p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel variant="strong" style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>
        Create your account
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
        Start predicting viral potential
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="virtuna" size="lg" loading={isSubmitting} style={{ width: '100%' }}>
          Create Account
        </Button>
      </form>

      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#00e5cc', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </GlassPanel>
  )
}
```

#### 2.4 🔴 Create Forgot Password Page
**File**: `src/app/(auth)/forgot-password/page.tsx`
*(Similar structure to signup - request reset email)*

#### 2.5 🔴 Create Reset Password Page
**File**: `src/app/(auth)/reset-password/page.tsx`
*(Form to enter new password after clicking email link)*

#### 2.6 🔴 Create Auth Callback Route
**File**: `src/app/api/auth/callback/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

#### 2.7 🔴 Create Auth Hook
**File**: `src/lib/hooks/use-auth.ts`
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { user, loading, signOut }
}
```

#### 2.8 🟠 Test Auth Flows
- [ ] Signup with new email
- [ ] Verify email confirmation
- [ ] Login with credentials
- [ ] Password reset flow
- [ ] Session persistence
- [ ] Protected route redirect
- [ ] Logout functionality

---

## Phase 2: Core Features (Days 3-5)

### Day 3: Analysis API

#### 3.1 🔴 Create TikTok Service
**File**: `src/lib/api/tiktok.ts`
```typescript
interface TikTokVideoData {
  videoId: string
  author: string
  authorAvatar: string
  description: string
  duration: number
  thumbnailUrl: string
  likeCount: number
  commentCount: number
  shareCount: number
  viewCount: number
  hashtags: string[]
  soundName: string
  soundAuthor: string
}

export async function fetchTikTokVideo(url: string): Promise<TikTokVideoData> {
  // Extract video ID from URL
  const videoId = extractVideoId(url)

  // Option 1: Use Apify (production)
  if (process.env.APIFY_API_TOKEN) {
    return fetchFromApify(videoId)
  }

  // Option 2: Mock data (development)
  return generateMockVideoData(videoId)
}

function extractVideoId(url: string): string {
  // Handle various TikTok URL formats
  const patterns = [
    /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/(\w+)/,
    /tiktok\.com\/t\/(\w+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  throw new Error('Invalid TikTok URL')
}

async function fetchFromApify(videoId: string): Promise<TikTokVideoData> {
  const response = await fetch(
    `https://api.apify.com/v2/acts/${process.env.APIFY_TIKTOK_ACTOR_ID}/runs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        postURLs: [`https://www.tiktok.com/@/video/${videoId}`],
      }),
    }
  )

  const data = await response.json()
  // Transform Apify response to our format
  return transformApifyResponse(data)
}

function generateMockVideoData(videoId: string): TikTokVideoData {
  return {
    videoId,
    author: 'mockuser',
    authorAvatar: 'https://picsum.photos/100',
    description: 'This is a mock TikTok video description #viral #fyp',
    duration: 30,
    thumbnailUrl: 'https://picsum.photos/400/700',
    likeCount: Math.floor(Math.random() * 100000),
    commentCount: Math.floor(Math.random() * 5000),
    shareCount: Math.floor(Math.random() * 10000),
    viewCount: Math.floor(Math.random() * 1000000),
    hashtags: ['viral', 'fyp', 'trending'],
    soundName: 'Original Sound',
    soundAuthor: 'mockuser',
  }
}
```

#### 3.2 🔴 Create ML Service Client
**File**: `src/lib/api/ml-service.ts`
```typescript
interface MLAnalysisRequest {
  videoId: string
  metadata: {
    description: string
    hashtags: string[]
    duration: number
    soundName: string
    engagement: {
      likes: number
      comments: number
      shares: number
      views: number
    }
  }
}

interface MLAnalysisResponse {
  overallScore: number
  hookScore: number
  trendScore: number
  audioScore: number
  timingScore: number
  hashtagScore: number
  suggestions: {
    category: string
    priority: string
    title: string
    description: string
  }[]
}

export async function analyzeVideo(request: MLAnalysisRequest): Promise<MLAnalysisResponse> {
  const mlServiceUrl = process.env.ML_SERVICE_URL

  // Use real ML service if available
  if (mlServiceUrl && mlServiceUrl !== 'http://localhost:8000') {
    const response = await fetch(`${mlServiceUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ML_SERVICE_API_KEY!,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('ML service error')
    }

    return response.json()
  }

  // Mock ML response for development
  return generateMockAnalysis()
}

function generateMockAnalysis(): MLAnalysisResponse {
  const hookScore = Math.floor(Math.random() * 40) + 60
  const trendScore = Math.floor(Math.random() * 40) + 55
  const audioScore = Math.floor(Math.random() * 40) + 50
  const timingScore = Math.floor(Math.random() * 40) + 60
  const hashtagScore = Math.floor(Math.random() * 40) + 55

  const overallScore = Math.round(
    hookScore * 0.25 +
    trendScore * 0.25 +
    audioScore * 0.20 +
    timingScore * 0.15 +
    hashtagScore * 0.15
  )

  return {
    overallScore,
    hookScore,
    trendScore,
    audioScore,
    timingScore,
    hashtagScore,
    suggestions: generateSuggestions(hookScore, trendScore, audioScore, timingScore, hashtagScore),
  }
}

function generateSuggestions(hook: number, trend: number, audio: number, timing: number, hashtag: number) {
  const suggestions = []

  if (hook < 70) {
    suggestions.push({
      category: 'hook',
      priority: 'high',
      title: 'Strengthen Your Hook',
      description: 'The first 3 seconds need more impact. Start with action or a surprising element.',
    })
  }

  if (audio < 65) {
    suggestions.push({
      category: 'audio',
      priority: 'high',
      title: 'Use Trending Audio',
      description: 'Consider using a trending sound. Viral sounds can increase reach by 40%.',
    })
  }

  if (hashtag < 60) {
    suggestions.push({
      category: 'hashtag',
      priority: 'medium',
      title: 'Optimize Hashtags',
      description: 'Mix popular hashtags with niche-specific ones for better discovery.',
    })
  }

  if (timing < 70) {
    suggestions.push({
      category: 'timing',
      priority: 'medium',
      title: 'Optimal Posting Time',
      description: 'Best times to post are 7-9 PM EST on weekdays for maximum engagement.',
    })
  }

  return suggestions
}
```

#### 3.3 🔴 Create Analysis API Route
**File**: `src/app/api/analyze/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchTikTokVideo } from '@/lib/api/tiktok'
import { analyzeVideo } from '@/lib/api/ml-service'
import { analyzeSchema } from '@/lib/utils/validation'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage quota
    const { data: profile } = await supabase
      .from('profiles')
      .select('analyses_count, analyses_limit')
      .eq('id', user.id)
      .single()

    if (profile && profile.analyses_count >= profile.analyses_limit) {
      return NextResponse.json(
        { error: 'Analysis limit reached', upgradeUrl: '/settings?upgrade=true' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await request.json()
    const parsed = analyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Fetch video data
    const videoData = await fetchTikTokVideo(parsed.data.videoUrl)

    // Run ML analysis
    const mlResult = await analyzeVideo({
      videoId: videoData.videoId,
      metadata: {
        description: videoData.description,
        hashtags: videoData.hashtags,
        duration: videoData.duration,
        soundName: videoData.soundName,
        engagement: {
          likes: videoData.likeCount,
          comments: videoData.commentCount,
          shares: videoData.shareCount,
          views: videoData.viewCount,
        },
      },
    })

    const processingTime = Date.now() - startTime

    // Save to database
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        video_url: parsed.data.videoUrl,
        video_id: videoData.videoId,
        overall_score: mlResult.overallScore,
        hook_score: mlResult.hookScore,
        trend_score: mlResult.trendScore,
        audio_score: mlResult.audioScore,
        timing_score: mlResult.timingScore,
        hashtag_score: mlResult.hashtagScore,
        metadata: videoData,
        suggestions: mlResult.suggestions,
        processing_time: processingTime,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

### Day 4: Connect Frontend

#### 4.1 🔴 Set Up TanStack Query Provider
**File**: `src/components/providers/query-provider.tsx`
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

#### 4.2 🔴 Create Analysis Hooks
**File**: `src/lib/hooks/use-analyses.ts`
```typescript
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AnalysisWithDetails } from '@/types/analysis'

export function useAnalyze() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoUrl: string) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useAnalyses(options?: {
  page?: number
  limit?: number
  sort?: 'date' | 'score'
}) {
  return useQuery({
    queryKey: ['analyses', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.page) params.set('page', String(options.page))
      if (options?.limit) params.set('limit', String(options.limit))
      if (options?.sort) params.set('sort', options.sort)

      const response = await fetch(`/api/analyses?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analyses')
      return response.json()
    },
  })
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const response = await fetch(`/api/analyses/${id}`)
      if (!response.ok) throw new Error('Analysis not found')
      return response.json() as Promise<{ analysis: AnalysisWithDetails }>
    },
    enabled: !!id,
  })
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}
```

#### 4.3 🔴 Update Analyze Page (Real Data)
**File**: `src/app/(dashboard)/analyze/page.tsx`
*(Rewrite to use useAnalyze hook, show real results)*

#### 4.4 🔴 Create Analyses List API
**File**: `src/app/api/analyses/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sort = searchParams.get('sort') || 'date'
  const order = searchParams.get('order') || 'desc'

  const offset = (page - 1) * limit

  let query = supabase
    .from('analyses')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .range(offset, offset + limit - 1)

  if (sort === 'score') {
    query = query.order('overall_score', { ascending: order === 'asc' })
  } else {
    query = query.order('created_at', { ascending: order === 'asc' })
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    analyses: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}
```

### Day 5: Library & Dashboard

#### 5.1 🔴 Update Library Page (Real Data)
**File**: `src/app/(dashboard)/library/page.tsx`
*(Rewrite to use useAnalyses hook)*

#### 5.2 🔴 Create Analysis Detail Page
**File**: `src/app/(dashboard)/library/[id]/page.tsx`
```typescript
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAnalysis, useDeleteAnalysis } from '@/lib/hooks/use-analyses'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { ScoreBadge } from '@/components/ui/score-badge'
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

export default function AnalysisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data, isLoading, error } = useAnalysis(params.id as string)
  const deleteAnalysis = useDeleteAnalysis()

  if (isLoading) return <AnalysisDetailSkeleton />
  if (error || !data) return <div>Analysis not found</div>

  const { analysis } = data

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this analysis?')) {
      await deleteAnalysis.mutateAsync(analysis.id)
      router.push('/library')
    }
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="primary" asChild>
            <a href={analysis.video_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on TikTok
            </a>
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Score Overview */}
        <GlassPanel variant="strong" style={{ padding: '24px' }}>
          <ScoreBadge score={analysis.overall_score} size="xl" />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>
            Analyzed {formatRelativeTime(analysis.created_at)}
          </p>
        </GlassPanel>

        {/* Metric Breakdown */}
        <GlassPanel style={{ padding: '24px' }}>
          <h3 style={{ color: '#fff', fontWeight: 500, marginBottom: '16px' }}>Score Breakdown</h3>
          <MetricBar label="Hook Strength" score={analysis.hook_score} />
          <MetricBar label="Trend Alignment" score={analysis.trend_score} />
          <MetricBar label="Audio Score" score={analysis.audio_score} />
          <MetricBar label="Timing Score" score={analysis.timing_score} />
          <MetricBar label="Hashtag Score" score={analysis.hashtag_score} />
        </GlassPanel>

        {/* AI Suggestions */}
        <div style={{ gridColumn: 'span 2' }}>
          <GlassPanel style={{ padding: '24px' }}>
            <h3 style={{ color: '#fff', fontWeight: 500, marginBottom: '16px' }}>AI Suggestions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(analysis.suggestions as any[]).map((suggestion, i) => (
                <SuggestionCard key={i} suggestion={suggestion} />
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
```

#### 5.3 🔴 Update Dashboard (Real Data)
*(Fetch real stats from user profile and recent analyses)*

#### 5.4 🔴 Create User Hook
**File**: `src/lib/hooks/use-user.ts`
```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/types/user'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/user')
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json() as Promise<{ user: Profile }>
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}
```

---

## Phase 3: Polish & Settings (Days 6-7)

### Day 6: UI Components

#### 6.1 🟠 Create Skeleton Component
**File**: `src/components/ui/skeleton.tsx`
```typescript
import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg', className)}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        ...style,
      }}
    />
  )
}
```

#### 6.2 🟠 Create Toast System
**File**: `src/components/ui/toast.tsx`
*(Use @radix-ui/react-toast)*

#### 6.3 🟠 Create Modal Component
**File**: `src/components/ui/modal.tsx`
*(Use @radix-ui/react-dialog)*

#### 6.4 🟠 Create Avatar Component
**File**: `src/components/ui/avatar.tsx`
*(Use @radix-ui/react-avatar)*

#### 6.5 🟠 Add Empty States
- Dashboard empty (no analyses)
- Library empty (no saved analyses)
- Search no results

### Day 7: Settings & Polish

#### 7.1 🟠 Update Settings Page (Functional)
- Profile update form
- Password change form
- Usage display
- Account deletion

#### 7.2 🟠 Create Error Boundaries
**File**: `src/components/error-boundary.tsx`

#### 7.3 🟠 Add Loading States
- Page loading skeletons
- Button loading states
- Chart loading placeholders

#### 7.4 🟠 Usage Quota UI
- Show remaining analyses in header
- Upgrade prompts when limit reached

---

## Phase 4: Testing & Launch (Days 8-9)

### Day 8: Testing

#### 8.1 🟠 Unit Tests
```bash
# Set up Vitest
pnpm vitest init

# Run tests
pnpm test
```

**Test Files:**
- `src/lib/utils/*.test.ts`
- `src/lib/hooks/*.test.ts`
- `src/components/ui/*.test.tsx`

#### 8.2 🟠 E2E Tests
```bash
# Set up Playwright
pnpm playwright install

# Run tests
pnpm e2e
```

**Test Files:**
- `e2e/auth.spec.ts` - Signup, login, logout
- `e2e/analyze.spec.ts` - Analysis flow
- `e2e/library.spec.ts` - Library operations

### Day 9: Deploy

#### 9.1 🔴 Vercel Deployment
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

#### 9.2 🔴 Environment Variables
Set in Vercel dashboard:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ML_SERVICE_URL
- ML_SERVICE_API_KEY
- APIFY_API_TOKEN

#### 9.3 🔴 Domain Configuration
- Add custom domain in Vercel
- Configure DNS records
- Verify SSL

#### 9.4 🔴 Production Smoke Test
- [ ] Homepage loads
- [ ] Auth flow works
- [ ] Analysis completes
- [ ] Data persists
- [ ] Mobile responsive

---

## Appendix: Quick Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm start                # Start production server
pnpm lint                 # Run ESLint

# Database
pnpm supabase db push     # Push migrations
pnpm supabase gen types   # Generate TypeScript types

# Testing
pnpm test                 # Unit tests
pnpm test:watch           # Watch mode
pnpm e2e                  # E2E tests

# Deployment
vercel                    # Preview deploy
vercel --prod             # Production deploy
```

---

## Appendix: File Checklist

### New Files to Create
- [ ] `src/lib/utils/cn.ts`
- [ ] `src/lib/utils/format.ts`
- [ ] `src/lib/utils/validation.ts`
- [ ] `src/lib/supabase/client.ts`
- [ ] `src/lib/supabase/server.ts`
- [ ] `src/lib/supabase/admin.ts`
- [ ] `src/lib/api/tiktok.ts`
- [ ] `src/lib/api/ml-service.ts`
- [ ] `src/lib/hooks/use-auth.ts`
- [ ] `src/lib/hooks/use-analyses.ts`
- [ ] `src/lib/hooks/use-user.ts`
- [ ] `src/types/database.ts`
- [ ] `src/types/analysis.ts`
- [ ] `src/types/user.ts`
- [ ] `src/middleware.ts`
- [ ] `src/app/(auth)/layout.tsx`
- [ ] `src/app/(auth)/login/page.tsx`
- [ ] `src/app/(auth)/signup/page.tsx`
- [ ] `src/app/(auth)/forgot-password/page.tsx`
- [ ] `src/app/(auth)/reset-password/page.tsx`
- [ ] `src/app/api/auth/callback/route.ts`
- [ ] `src/app/api/analyze/route.ts`
- [ ] `src/app/api/analyses/route.ts`
- [ ] `src/app/api/analyses/[id]/route.ts`
- [ ] `src/app/api/user/route.ts`
- [ ] `src/app/(dashboard)/library/[id]/page.tsx`
- [ ] `src/components/providers/query-provider.tsx`
- [ ] `src/components/ui/skeleton.tsx`
- [ ] `src/components/ui/toast.tsx`
- [ ] `src/components/ui/modal.tsx`
- [ ] `src/components/ui/avatar.tsx`
- [ ] `src/components/error-boundary.tsx`

### Files to Update
- [ ] `src/app/layout.tsx` - Add QueryProvider
- [ ] `src/app/(dashboard)/page.tsx` - Real data
- [ ] `src/app/(dashboard)/analyze/page.tsx` - Real API
- [ ] `src/app/(dashboard)/library/page.tsx` - Real data
- [ ] `src/app/(dashboard)/settings/page.tsx` - Functional

---

---

## Phase 5: UX Audit Fixes (Post-MVP)

> Based on hands-on UX audit conducted 2026-01-20. Full report: `/docs/UX_AUDIT_REPORT.md`

### 5.1 🔴 Critical Bugs (P0 - Blockers)

#### Fix Broken Pages (Server/Client Component Errors)
3 pages crash when visited due to missing `"use client"` directive:
- [ ] `src/app/(dashboard)/trends/page.tsx` - Add `"use client"` at top
- [ ] `src/app/(dashboard)/analytics/page.tsx` - Add `"use client"` at top
- [ ] `src/app/(dashboard)/help/page.tsx` - Add `"use client"` at top

**Error Message**: `Attempted to call X from the server but X is on the client`

#### Fix Text Concatenation Bug
- [ ] Analyze page: "Hook StrengthFirst 2-3 seconds..." → Should be "Hook Strength" as title, "First 2-3 seconds..." as description
- [ ] Fix CSS/layout in score breakdown component

#### Fix TikTok Metadata Fetching
- [ ] All analyzed videos show "@unknown" author, 0 likes, 0 views
- [ ] Debug `src/lib/api/tiktok.ts` - scraper returning empty data
- [ ] Add error handling when metadata fetch fails (show warning, not silent failure)

---

### 5.2 🟠 Quick Wins (P1 - High Impact, Low Effort)

#### Add "Try Example" Button
- [ ] Add button on Analyze page: "Try with example video"
- [ ] Pre-fill input with known working TikTok URL
- [ ] Reduces time-to-value from "need own URL" to "one click"

#### Add Score Explainability
- [ ] Add info icon (?) next to each score
- [ ] On hover/click: Show tooltip explaining methodology
- [ ] Example: "Hook Score: Measures first 3 seconds impact. Based on: visual hooks, text overlay, pattern interrupt"

#### Improve Error States
- [ ] Red border on input when invalid URL
- [ ] Larger error text (currently small gray)
- [ ] Specific error: "TikTok URL not found" vs "Invalid format"

#### Add Loading Skeletons
- [ ] Dashboard metrics skeleton
- [ ] Library list skeleton
- [ ] Analysis results skeleton

#### Fix Dashboard "0%" Display
- [ ] "Success Rate: 0%" is alarming when no analyses exist
- [ ] Reframe: "Viral Hits: None yet" or hide metric when 0
- [ ] Add encouraging copy for empty state

---

### 5.3 🟠 Medium Priority (P1 - Important Features)

#### Dashboard Improvements
- [ ] Add dominant CTA: "Analyze Your Next Video" as hero element
- [ ] Add "Since your last visit" section for returning users
- [ ] Move Quick Actions to more prominent position
- [ ] Hide/label demo data in charts (currently shows fake Jan-Jun data)

#### Library Improvements
- [ ] Add video thumbnails to list items
- [ ] Add sorting: By date, by score (asc/desc)
- [ ] Add confirmation dialog before delete
- [ ] Expand H/T/A mini scores on hover with labels

#### Analysis Results Improvements
- [ ] Add circular gauge or progress bar for main score
- [ ] Color code scores: Red (<50), Yellow (50-70), Green (>70)
- [ ] Add percentile comparison: "Better than 72% of analyzed videos"
- [ ] Show video thumbnail after analysis

#### Settings Page
- [ ] Already works, but add:
- [ ] Usage progress bar visualization
- [ ] "Upgrade" CTA when approaching limit
- [ ] Email preferences section

---

### 5.4 🟡 Future Enhancements (P2 - Nice to Have)

#### Personalized AI Suggestions
- [ ] Replace generic suggestions with video-specific ones
- [ ] Example: "Add trending sound: [specific sound name]" instead of "Use trending audio"
- [ ] Reference actual hashtags missing, not just "optimize hashtags"

#### Comparison Mode
- [ ] Add checkbox selection in Library
- [ ] "Compare" button to view 2-3 analyses side-by-side
- [ ] Highlight differences in scores

#### Trend/Benchmark Context
- [ ] "66 is above average for dance videos"
- [ ] Add niche-specific benchmarks
- [ ] Show confidence interval

#### Empty State Improvements
- [ ] Dashboard: Show onboarding when no analyses
- [ ] Library: "No videos analyzed yet. Start here →"
- [ ] Personalized greeting for first-time users

#### Accessibility Fixes
- [ ] Check contrast ratios on dark theme
- [ ] Ensure focus states for keyboard navigation
- [ ] Add alt text to all icons/images

---

### 5.5 Confusion Test Failures (Reference)

All 5 confusion tests failed during audit:

| Test | Result | Root Cause |
|------|--------|------------|
| "I don't understand this metric" | ❌ No tooltips, no explainability | Missing help UI |
| "I don't know what to click next" | ❌ No dominant CTA | Too many equal-weight actions |
| "I doubt the score" | ❌ No methodology disclosure | No "How we calculate" page |
| "I have no data yet" | ⚠️ Shows confusing empty state | No onboarding flow |
| "I want a result faster" | ❌ Must have own URL ready | No demo/example path |

---

### 5.6 UX Audit Acceptance Criteria (Top 5)

#### 1. "Try Example" Analysis Flow
```gherkin
GIVEN I am a new user on /analyze
WHEN I click "Try with example"
THEN a TikTok URL is pre-filled
AND I can click Analyze immediately
AND I see results within 10 seconds
```

#### 2. Score Explainability
```gherkin
GIVEN I see a score (e.g., "Hook: 88")
WHEN I hover over the (?) icon
THEN a tooltip appears explaining:
  - What this metric measures
  - What factors affect it
  - What a "good" score is
```

#### 3. Broken Pages Fixed
```gherkin
GIVEN I click any nav item (Dashboard, Analyze, Library, Trends, Analytics, Settings, Help)
WHEN the page loads
THEN no error is displayed
AND the page renders correctly
```

#### 4. Library Item Identification
```gherkin
GIVEN I have 5+ analyses in Library
WHEN I view the list
THEN each item shows:
  - Video thumbnail (or placeholder)
  - Creator username (not "@unknown")
  - Analysis date
AND I can visually distinguish each item
```

#### 5. Dashboard Empty State
```gherkin
GIVEN I am a new user with 0 analyses
WHEN I visit Dashboard
THEN I see an encouraging empty state
AND a clear CTA: "Analyze Your First Video"
AND a link: "Or try with an example"
AND no confusing "0%" or "0 analyses" in alarming red
```

---

**End of Development Plan**

*Total estimated time: 9 working days (~72 hours) for core MVP*
*UX fixes add 2-3 additional days depending on priority*
*Ready to begin implementation upon approval.*
