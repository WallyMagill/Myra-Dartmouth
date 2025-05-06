import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = !!request.cookies.get('next-auth.session-token') || !!request.cookies.get('__Secure-next-auth.session-token');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  if (request.nextUrl.pathname === '/' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
}; 