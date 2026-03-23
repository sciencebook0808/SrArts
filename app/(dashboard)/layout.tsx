/**
 * app/(dashboard)/layout.tsx  — Admin dashboard route group layout
 *
 * Wraps every protected admin URL:
 *   /admin/dashboard
 *   /admin/artworks/new
 *   /admin/artworks/[id]/edit
 *   /admin/blog/new
 *   /admin/blog/[id]/edit
 *
 * RESPONSIBILITIES:
 *  ✅ Server-side auth guard (Clerk v7 — auth() from @clerk/nextjs/server)
 *  ✅ Role check: publicMetadata.role must be "admin" | "superadmin"
 *  ✅ Redirect unauthenticated → /sign-in
 *  ✅ Redirect unauthorised  → /admin/access-denied
 *  ❌ NO public SEO metadata — admin pages must NOT be indexed
 *  ❌ NO public navigation — admin has its own chrome in the dashboard page
 *
 * SEO:
 *  robots: noindex, nofollow  — admin routes must never appear in search results.
 *  This is enforced here so it applies to EVERY dashboard page automatically.
 *
 * DEFENCE-IN-DEPTH:
 *  proxy.ts does the first check at the network boundary.
 *  This layout is the app-layer safety net — both must pass.
 */

import type { Metadata }    from 'next';
import { redirect }         from 'next/navigation';
import { auth }             from '@clerk/nextjs/server';

// ─── SEO: explicitly block all admin routes from indexing ─────────────────────
export const metadata: Metadata = {
  robots: {
    index:     false,
    follow:    false,
    googleBot: { index: false, follow: false },
  },
  // Prevent inheriting a public title template
  title: {
    absolute: 'Admin — SR Arts',
  },
};

// ─── Auth constants ───────────────────────────────────────────────────────────
const ADMIN_ROLES = ['admin', 'superadmin'] as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clerk v7: auth() returns auth state synchronously in server components
  const { userId, sessionClaims } = await auth();

  // 1. Not signed in → /sign-in
  //    proxy.ts already sets redirect_url, so a plain redirect is fine here
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Check Clerk publicMetadata.role
  const meta  = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const role  = meta?.role ?? '';

  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    redirect('/admin/access-denied');
  }

  // 3. Authorised — render dashboard content
  return <>{children}</>;
}
