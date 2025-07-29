
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = request.cookies.has('ltoportal-user')

  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = pathname.startsWith('/_next/static') || pathname.startsWith('/_next/image') || pathname === '/favicon.ico';

  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // If the user is logged in
  if (isLoggedIn) {
    // and tries to access /login, redirect to home
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    // and tries to access /, redirect to home
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/home', request.url))
    }
  } else { // If the user is not logged in
    // and is trying to access any page other than /login, redirect them to /login.
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
