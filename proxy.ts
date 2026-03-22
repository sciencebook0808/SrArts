/**
 * proxy.ts — Next.js 16 request interceptor
 *
 * VERIFIED FACTS (March 2026):
 *  ✓ Next.js 16: middleware.ts → deprecated; use proxy.ts
 *    Source: nextjs.org/docs/app/api-reference/file-conventions/proxy
 *  ✓ Export: `export default` OR named `export function proxy()` — both valid
 *  ✓ Runtime: Node.js ONLY (Edge runtime not supported in proxy.ts)
 *    Source: nextjs.org/docs/app/guides/upgrading/version-16
 *  ✓ Clerk: `export default clerkMiddleware()` as default export in proxy.ts
 *    Source: clerk.com/docs/nextjs/getting-started/quickstart
 *
 * ARCHITECTURE (proxy = lightweight routing layer only):
 *  - Admin /admin/* → check password-cookie, redirect to /admin/login if missing
 *  - Community /community/* → public read, Clerk auth enforced in API routes
 *  - All other routes → public (Clerk provides auth context via ClerkProvider)
 *  - Heavy auth logic (DB, session) stays in Server Components & API routes
 */
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((_auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // ── Admin cookie guard ────────────────────────────────────────────────────
  // /admin/* (except /admin/login) requires the password-cookie session.
  // Cookie is set by POST /api/admin/login; full verification in isAdminLoggedIn().
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get('admin_session');
    if (!session?.value) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Official Clerk + Next.js 16 matcher pattern (March 2026)
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
