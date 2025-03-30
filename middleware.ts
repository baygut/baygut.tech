import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin paths
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('auth-token');

    // If no token exists, redirect to login
    if (!token) {
      // Store the original URL they were trying to access for redirect after login
      const url = new URL('/login', req.url);
      url.searchParams.set('redirect', encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }

    // You could add additional token validation here if needed
  }

  return NextResponse.next();
}

// Update the matcher to ensure it catches all relevant routes
export const config = {
  // This ensures middleware runs on the admin route and all its subpaths
  matcher: ['/admin', '/admin/:path*'],
};
