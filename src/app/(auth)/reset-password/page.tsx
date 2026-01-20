'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Check if user has a valid reset session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // User should have a session from the reset link
      if (session) {
        setIsValidSession(true)
      } else {
        setIsValidSession(false)
      }
    }

    checkSession()
  }, [])

  async function onSubmit(data: ResetPasswordInput) {
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  // Loading state
  if (isValidSession === null) {
    return (
      <GlassPanel variant="strong" style={{ padding: '32px', textAlign: 'center' }}>
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-white/10 rounded w-64 mx-auto" />
        </div>
      </GlassPanel>
    )
  }

  // Invalid or expired session
  if (!isValidSession) {
    return (
      <GlassPanel variant="strong" style={{ padding: '32px', textAlign: 'center' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239, 68, 68, 0.2)' }}
        >
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          Invalid or expired link
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button
          variant="virtuna"
          size="md"
          onClick={() => router.push('/forgot-password')}
        >
          Request New Link
        </Button>
      </GlassPanel>
    )
  }

  // Success state
  if (success) {
    return (
      <GlassPanel variant="strong" style={{ padding: '32px', textAlign: 'center' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 197, 94, 0.2)' }}
        >
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          Password updated!
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Redirecting you to the dashboard...
        </p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel variant="strong" style={{ padding: '32px' }}>
      <h1 className="text-2xl font-semibold text-white text-center mb-2">
        Set new password
      </h1>
      <p className="text-[var(--text-secondary)] text-sm text-center mb-6">
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Password requirements */}
        <div className="text-xs text-[var(--text-muted)] space-y-1">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One number</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="virtuna"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Update Password
        </Button>
      </form>
    </GlassPanel>
  )
}
