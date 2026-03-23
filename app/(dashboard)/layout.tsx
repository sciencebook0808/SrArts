/**
 * app/(dashboard)/layout.tsx — Admin dashboard route group auth guard (v17)
 *
 * ROOT CAUSE FIX:
 *  Previous version read role from `sessionClaims?.publicMetadata`.
 *  Clerk does NOT embed publicMetadata in the JWT by default, so
 *  `sessionClaims?.publicMetadata` is always undefined, causing every
 *  admin user to be redirected to /admin/access-denied even when their
 *  role is correctly set in Clerk Dashboard.
 *
 *  FIX: Use `currentUser()` which calls the Clerk API directly and
 *  always returns the real, live user object with publicMetadata.
 *  No Clerk Dashboard JWT template configuration required.
 *
 * ROUTE GROUP: (dashboard)
 *  Wraps: /admin/dashboard, /admin/artworks/*, /admin/blog/*
 *
 * REDIRECT TARGETS:
 *  Not signed in      → /sign-in
 *  No admin role      → /admin/access-denied
 *
 * SEO:
 *  robots: noindex, nofollow — admin must never appear in search results.
 */

import type { Metadata } from 'next';
import { redirect }      from 'next/navigation';
import { currentUser }   from '@clerk/nextjs/server';

// ─── SEO: block admin routes from all search engine indexing ──────────────────
export const metadata: Metadata = {
  robots: {
    index:     false,
    follow:    false,
    googleBot: { index: false, follow: false },
  },
  title: {
    absolute: 'Admin — SR Arts',
  },
};

// ─── Role constants ───────────────────────────────────────────────────────────
const ADMIN_ROLES = ['admin', 'superadmin'] as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * currentUser() fetches the full Clerk user object from the Clerk API.
   * This is the ONLY reliable way to read publicMetadata in server components —
   * reading from sessionClaims?.publicMetadata fails because Clerk does not
   * include publicMetadata in the session JWT by default.
   */
  const user = await currentUser();

  // 1. Not signed in → sign-in page
  if (!user) {
    redirect('/sign-in');
  }

  // 2. Check publicMetadata.role from the live Clerk user object
  const meta = user.publicMetadata as { role?: string } | undefined;
  const role = meta?.role ?? '';

  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    redirect('/admin/access-denied');
  }

  // 3. Authorised — render dashboard
  return <>{children}</>;
}
