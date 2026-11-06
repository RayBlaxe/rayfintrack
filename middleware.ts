import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Explicitly bypass static PWA files and public assets from auth redirection
  if (
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)

  const isAuthRoute = pathname === '/login' || pathname === '/register'
  
  if (!user && !isAuthRoute) {
    // Redirect unauthenticated users to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    // Redirect authenticated users away from login/register to dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js, manifest.json (PWA files)
     * - icons/ (PWA icons)
     * - api/ (API routes might need their own auth checks)
     * - static asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
}
