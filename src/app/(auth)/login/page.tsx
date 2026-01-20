'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
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
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in')
      } else {
        setError(error.message)
      }
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <GlassPanel variant="strong" style={{ padding: '32px' }}>
      <h1 className="text-2xl font-semibold text-white text-center mb-2">
        Welcome back
      </h1>
      <p className="text-[var(--text-secondary)] text-sm text-center mb-6">
        Sign in to continue to Virtuna
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

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-virtuna hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="virtuna"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <p className="text-[var(--text-secondary)] text-sm text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-virtuna hover:underline">
          Sign up
        </Link>
      </p>
    </GlassPanel>
  )
}

function LoadingFallback() {
  return (
    <GlassPanel variant="strong" style={{ padding: '32px' }}>
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-virtuna animate-spin" />
      </div>
    </GlassPanel>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  )
}
