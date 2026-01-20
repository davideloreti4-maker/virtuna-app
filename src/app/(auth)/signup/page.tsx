'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { signupSchema, type SignupInput } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      if (error.message.includes('already registered')) {
        setError('This email is already registered')
      } else {
        setError(error.message)
      }
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
          We&apos;ve sent a confirmation link to your email address.
          Click the link to activate your account.
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
      <h1 className="text-2xl font-semibold text-white text-center mb-2">
        Create your account
      </h1>
      <p className="text-[var(--text-secondary)] text-sm text-center mb-6">
        Start predicting viral potential today
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
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
          Create Account
        </Button>
      </form>

      <p className="text-[var(--text-secondary)] text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-virtuna hover:underline">
          Sign in
        </Link>
      </p>
    </GlassPanel>
  )
}
