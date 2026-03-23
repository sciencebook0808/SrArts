/**
 * proxy.ts — Next.js 16 request interceptor (v17)
 *
 * ROOT CAUSE FIX:
 *  Previous version read role from `sessionClaims?.publicMetadata` which is
 *  always undefined because Clerk does not embed publicMetadata in the JWT
 *  session token by default. This caused all admin users to be bounced to
 *  /admin/access-denied even when their role was correctly set.
 *
 *  FIX: Use `clerkClient().users.getUser(userId)` to fetch the live user
 *  object and read publicMetadata directly from the Clerk API.
 *
 * FILE: proxy.ts (Next.js 16 — middleware.ts is deprecated)
 * RUNTIME: Node.js (Edge runtime NOT supported)
 *
 * THIN PROXY PATTERN:
 *  1. Check session (userId) — fast, from JWT
 *  2. If admin route: fetch user from Clerk API to read real publicMetadata
 *  3. Redirect based on role
 *  Full server-side validation also happens in (dashboard)/layout.tsx
 *
 * REDIRECT MAP:
 *  /admin/*             → Clerk auth + admin role required
 *  /admin/access-denied → always public (prevents redirect loop)
 *  /sign-in, /sign-up   → always public
 *
 * ROLE SETUP:
 *  Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 */

import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Route matchers ───────────────────────────────────────────────────────────

const isAdminRoute = createRouteMatcher(['/admin/(.*)']);

/** MUST exclude access-denied to prevent an infinite redirect loop */
const isPublicRoute = createRouteMatcher([
  '/admin/access-denied',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const ADMIN_ROLES = ['admin', 'superadmin'] as const;

// ─── Proxy handler ────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Always pass through auth pages and the access-denied page
  if (isPublicRoute(req)) return NextResponse.next();

  if (isAdminRoute(req)) {
    const { userId } = await auth();

    // 1. Not signed in → redirect to Clerk sign-in with return URL
    if (!userId) {
      const url = new URL('/sign-in', req.url);
      url.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 2. Fetch the real user from Clerk API to read live publicMetadata.
    //    sessionClaims?.publicMetadata is NOT used because Clerk does not
    //    include publicMetadata in the session JWT token by default.
    try {
      const client = await clerkClient();
      const user   = await client.users.getUser(userId);
      const meta   = user.publicMetadata as { role?: string } | undefined;
      const role   = meta?.role ?? '';

      if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
        return NextResponse.redirect(new URL('/admin/access-denied', req.url));
      }
    } catch {
      // If the Clerk API call fails (network error etc.), deny access safely
      return NextResponse.redirect(new URL('/admin/access-denied', req.url));
    }
  }

  return NextResponse.next();
});

// ─── Matcher ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
