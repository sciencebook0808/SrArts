/**
 * proxy.ts — Next.js 16 request interceptor (Clerk role-based admin auth)
 *
 * AUTH ARCHITECTURE (v12, March 2026):
 *  Password cookie system REMOVED. All admin auth via Clerk publicMetadata.role.
 *
 *  /admin/*            → Requires Clerk sign-in + role: "admin" | "superadmin"
 *  /admin/access-denied → Public (to avoid redirect loop)
 *  All other routes    → Public (Clerk provides auth context via ClerkProvider)
 *
 * ROLE SETUP:
 *  Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 *
 * FIX: Previous infinite redirect was caused by cookie-header pathname detection
 *      failing silently (empty string), causing the layout to always redirect.
 *      This version moves all routing logic into the proxy (middleware) layer
 *      where pathname is always reliable via req.nextUrl.
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require admin role
const isAdminRoute = createRouteMatcher(['/admin/(.*)']);

// Routes excluded from the admin guard (prevent redirect loops)
const isExcluded = createRouteMatcher([
  '/admin/access-denied',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const ADMIN_ROLES = ['admin', 'superadmin'] as const;

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip guard for excluded routes
  if (isExcluded(req)) return NextResponse.next();

  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // 1. Not signed in → redirect to Clerk sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Signed in but missing admin role → access denied
    const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
    const role = meta?.role ?? '';

    if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
      return NextResponse.redirect(new URL('/admin/access-denied', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
