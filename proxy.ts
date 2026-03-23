/**
 * proxy.ts — Next.js 16 request interceptor
 *
 * ✅ File name: proxy.ts  (Next.js 16 — middleware.ts is DEPRECATED)
 * ✅ Runtime:   Node.js   (Edge runtime NOT supported in proxy.ts)
 * ✅ Clerk v7:  clerkMiddleware API unchanged from v6
 *
 * Docs:
 *  https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 *  https://clerk.com/docs/references/nextjs/clerk-middleware
 *
 * THIN PROXY PATTERN:
 *  Only lightweight redirect/rewrite logic here.
 *  Full role validation in app/(dashboard)/layout.tsx.
 *
 * REDIRECT MAP:
 *  /admin/*             → needs auth + role
 *  /admin/access-denied → always public (MUST exclude — prevents loop)
 *  /sign-in, /sign-up   → always public (Clerk managed)
 *
 * ROLE SETUP:
 *  Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse }                        from 'next/server';
import type { NextRequest }                    from 'next/server';

const isAdminRoute  = createRouteMatcher(['/admin/(.*)']);

const isPublicRoute = createRouteMatcher([
  '/admin/access-denied',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const ADMIN_ROLES = ['admin', 'superadmin'] as const;

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isPublicRoute(req)) return NextResponse.next();

  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      const url = new URL('/sign-in', req.url);
      url.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
    const role  = meta?.role ?? '';

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
