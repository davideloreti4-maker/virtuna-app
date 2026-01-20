'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 197, 94, 0.2)' }}
        >
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">
          Check your email
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login">
          <Button variant="secondary" size="md">
            Back to Sign In
          </Button>
        </Link>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel variant="strong" style={{ padding: '32px' }}>
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <h1 className="text-2xl font-semibold text-white text-center mb-2">
        Forgot password?
      </h1>
      <p className="text-[var(--text-secondary)] text-sm text-center mb-6">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="virtuna"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Send Reset Link
        </Button>
      </form>
    </GlassPanel>
  )
}
