
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = request.cookies.has('ltoportal-user')

  // If the user is logged in, and tries to access /login, redirect to home
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If the user is not logged in and is trying to access any page other than /login,
  // redirect them to /login.
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
