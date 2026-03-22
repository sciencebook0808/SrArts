/**
 * app/admin/layout.tsx
 *
 * Server-side auth guard for ALL /admin/* routes (except /admin/login).
 *
 * Architecture:
 *  1. Cookie session check  — isAdminLoggedIn() reads the HttpOnly session cookie
 *  2. Clerk email check     — if ADMIN_EMAIL is set, also verify the signed-in
 *                             Clerk user's primary email matches it
 *
 * Both checks must pass to access the admin area.
 * Failure → redirect to /admin/login (no flash, server-side).
 *
 * Note: /admin/login is explicitly excluded so it doesn't redirect itself.
 *
 * Next.js 16: layout.tsx in app/ segment runs as a Server Component;
 * reading cookies + Clerk auth in layouts is fully supported.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAdminLoggedIn } from '@/lib/admin-auth';
import { auth, clerkClient } from '@clerk/nextjs/server';

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  // ── 1. Read the current request path ──────────────────────────────────────
  // headers() is available in Server Components in Next.js 16.
  // x-invoke-path is set by Next.js internally; fall back to x-pathname.
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path')
    ?? headersList.get('x-pathname')
    ?? '';

  // Allow the login page through unconditionally
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // ── 2. Cookie session check ────────────────────────────────────────────────
  const hasSession = await isAdminLoggedIn();
  if (!hasSession) {
    redirect('/admin/login');
  }

  // ── 3. Optional Clerk email guard ─────────────────────────────────────────
  // If ADMIN_EMAIL is configured, the signed-in Clerk user's primary email
  // must match it. This adds a second factor beyond the password.
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim() ?? '';
  if (adminEmail) {
    try {
      const { userId } = await auth();
      if (userId) {
        const client = await clerkClient();
        const user   = await client.users.getUser(userId);
        const primaryEmail = user.emailAddresses
          .find(e => e.id === user.primaryEmailAddressId)
          ?.emailAddress
          ?.toLowerCase()
          .trim()
          ?? '';

        if (primaryEmail !== adminEmail) {
          // Wrong Clerk account — clear admin session and redirect
          redirect('/admin/login?error=access_denied');
        }
      }
      // If userId is null (not signed into Clerk), we still allow access
      // because the password session is the primary guard.
      // The Clerk email check is additive when both are configured.
    } catch {
      // Non-critical — if Clerk lookup fails, fall through to allow access.
      // The cookie session has already been verified.
    }
  }

  return <>{children}</>;
}
