import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface CookieToSet {
  name: string
  value: string
  options?: CookieOptions
}

/**
 * Public paths that don't require authentication
 */
const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
]

/**
 * Check if a path is public
 */
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

/**
 * Auth proxy - protects routes and manages session
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if it exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublic = isPublicPath(pathname)

  // Redirect unauthenticated users to login (except for public paths)
  if (!user && !isPublic) {
    const redirectUrl = new URL('/login', request.url)
    // Preserve the original URL to redirect back after login
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (user && isPublic && pathname !== '/api/auth/callback') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

/**
 * Configure which paths the proxy runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
