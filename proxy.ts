/**
 * proxy.ts  ─  Next.js 16+ (replaces middleware.ts)
 *
 * - Runs on the Node.js runtime (not Edge — Edge support was removed in v16)
 * - Lightweight route-guard only: checks for the session cookie and redirects
 *   unauthenticated requests to /admin/login.
 * - Heavy auth verification stays in API route handlers and server components
 *   (per CVE-2025-29927 best practices — do not do real auth here).
 */
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard every /admin/* route except the login page itself
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session');
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
