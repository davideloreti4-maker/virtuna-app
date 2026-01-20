import { z } from 'zod'

// ============================================
// Base Schemas
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ============================================
// Auth Schemas
// ============================================

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
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

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ============================================
// Analysis Schemas
// ============================================

const tiktokUrlRegex = /^https?:\/\/(www\.|vm\.|m\.)?tiktok\.com\//

export const analyzeSchema = z.object({
  videoUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => tiktokUrlRegex.test(url),
      'Please enter a valid TikTok URL'
    ),
})

// ============================================
// Profile Schemas
// ============================================

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ============================================
// Type Exports
// ============================================

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type AnalyzeInput = z.infer<typeof analyzeSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ============================================
// Utility Functions
// ============================================

/**
 * Extract TikTok video ID from various URL formats
 */
export function extractTikTokVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[\w.]+\/video\/(\d+)/, // Standard format
    /vm\.tiktok\.com\/(\w+)/, // Short format
    /tiktok\.com\/t\/(\w+)/, // T format
    /m\.tiktok\.com\/v\/(\d+)/, // Mobile format
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Validate if a URL is a valid TikTok video URL
 */
export function isValidTikTokUrl(url: string): boolean {
  return tiktokUrlRegex.test(url) && extractTikTokVideoId(url) !== null
}
