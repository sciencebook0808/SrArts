/**
 * proxy.ts — Next.js 16 request interceptor
 *
 * ─── Architecture (v14) ───────────────────────────────────────────────────────
 *
 * Auth is enforced at TWO layers — each independently sufficient:
 *
 *   1. This middleware (edge, runs before any page renders)
 *   2. app/(admin)/layout.tsx (server, runs after middleware passes)
 *
 * Both layers redirect to destinations OUTSIDE the (admin) route group:
 *   • Unauthenticated  → /admin/login        (app/admin/login/ — NOT in (admin))
 *   • No admin role    → /admin/access-denied (app/admin/access-denied/ — NOT in (admin))
 *
 * This structural guarantee (route groups) makes redirect loops architecturally
 * impossible regardless of how many auth layers exist.
 *
 * ─── Protected routes ─────────────────────────────────────────────────────────
 *   /admin/dashboard   → requires role: admin | superadmin
 *   /admin/artworks/** → requires role: admin | superadmin
 *   /admin/blog/**     → requires role: admin | superadmin
 *
 * ─── Always public (no auth check) ───────────────────────────────────────────
 *   /admin/login        — sign-in form
 *   /admin/access-denied — no-role landing page
 *   /sign-in/**         — Clerk hosted UI
 *   /sign-up/**         — Clerk hosted UI
 *   All other routes   — public site
 *
 * ─── Role setup ───────────────────────────────────────────────────────────────
 *   Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Matchers ──────────────────────────────────────────────────────────────────

/** Routes that bypass all auth checks completely */
const isPublicAdminRoute = createRouteMatcher([
  '/admin/login',
  '/admin/access-denied',
]);

/** Routes that require admin/superadmin role */
const isProtectedAdminRoute = createRouteMatcher([
  '/admin/dashboard(.*)',
  '/admin/artworks(.*)',
  '/admin/blog(.*)',
]);

const ADMIN_ROLES: readonly string[] = ['admin', 'superadmin'];

// ── Middleware ────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // 1. Public admin pages — pass through immediately, zero checks
  if (isPublicAdminRoute(req)) {
    return NextResponse.next();
  }

  // 2. Protected admin pages — enforce role
  if (isProtectedAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // Not signed in → sign-in page
    if (!userId) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Signed in but no admin role → access denied
    const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
    if (!ADMIN_ROLES.includes(meta?.role ?? '')) {
      return NextResponse.redirect(new URL('/admin/access-denied', req.url));
    }
  }

  // 3. Everything else — allow through (public site, API routes, etc.)
  return NextResponse.next();
});

// ── Config ────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
