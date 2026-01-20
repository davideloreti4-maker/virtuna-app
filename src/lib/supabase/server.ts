import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

interface CookieToSet {
  name: string
  value: string
  options: CookieOptions
}

/**
 * Creates a Supabase client for use in Server Components and Route Handlers
 * This client reads/writes auth cookies automatically
 */
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
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component
            // which cannot set cookies. This can be safely ignored when
            // called from Server Components (reading only).
          }
        },
      },
    }
  )
}
