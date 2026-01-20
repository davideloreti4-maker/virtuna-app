import { Logo } from '@/components/ui/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #02010A 0%, #0A0A0F 50%, #12121C 100%)',
      }}
    >
      {/* Background glow effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 229, 204, 0.08) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText />
        </div>

        {/* Auth content */}
        {children}

        {/* Footer */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-virtuna hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-virtuna hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
