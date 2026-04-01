/**
 * lib/admin-auth.ts — Clerk role-based admin authentication (v18)
 *
 * FIXES APPLIED (April 2026):
 *
 * 1. SILENT 403 BUG in getRoleFromClerk():
 *    Previous version wrapped the Clerk API call in try/catch { return '' }.
 *    Any transient Clerk API error (network hiccup, rate limit, slow response)
 *    caused the function to silently return '' (empty string), which made
 *    ADMIN_ROLES.includes('') === false, triggering a 403 Forbidden response.
 *
 *    Result: ALL admin operations (sync, delete, manual toggle) showed
 *    "failed to" toasts whenever Clerk's API had any issue, making them look
 *    permanently broken to the user.
 *
 *    FIX: Remove the silent catch. Let exceptions propagate to the outer
 *    try/catch in requireAdminClerk(), which returns a proper 503-style
 *    "Authentication service error." response (HTTP 500). This correctly
 *    distinguishes "not authorised" (403) from "auth service unavailable" (500).
 *
 * 2. ADDED console.error LOGGING:
 *    Errors from the Clerk API are now logged server-side so they appear in
 *    Vercel function logs and can be diagnosed without guessing.
 *
 * ROLE SETUP (unchanged):
 *  Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 *  Supported values: "admin" | "superadmin"
 *
 * USAGE in API route handlers:
 *   const check = await requireAdminClerk();
 *   if (!check.authorized) return check.response;
 *
 * USAGE in Server Components / layouts:
 *   const isAdmin = await isAdminUser();
 *   if (!isAdmin) redirect('/admin/access-denied');
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextResponse }                   from 'next/server';

export type AdminRole = 'admin' | 'superadmin';

const ADMIN_ROLES: readonly string[] = ['admin', 'superadmin'] as const;

// ─── Internal: fetch role from live Clerk user object ────────────────────────

/**
 * Gets the admin role for a userId directly from the Clerk API.
 * Never reads from JWT claims — always reflects the latest publicMetadata.
 *
 * FIX: No longer wraps in try/catch. If the Clerk API call fails, the
 * exception propagates to requireAdminClerk()'s outer try/catch, which
 * returns HTTP 500 "Authentication service error." — distinguishable from
 * a genuine 403 Forbidden (wrong/missing role).
 *
 * Previously: any Clerk API failure → catch → return '' → 403 Forbidden.
 * Now:        any Clerk API failure → 500 Auth service error (logged + safe).
 */
async function getRoleFromClerk(userId: string): Promise<string> {
  const client = await clerkClient();
  const user   = await client.users.getUser(userId);
  const meta   = user.publicMetadata as { role?: string } | undefined;
  return meta?.role ?? '';
}

// ─── API route guard ──────────────────────────────────────────────────────────

type AuthorizedResult   = { authorized: true;  userId: string; role: AdminRole };
type UnauthorizedResult = { authorized: false; response: NextResponse };

/**
 * Use at the top of every admin-protected API route handler.
 *
 * Reads publicMetadata directly from the Clerk API — not from JWT claims —
 * so role changes take effect immediately without requiring re-login.
 *
 * Returns:
 *   { authorized: true,  userId, role }          → proceed
 *   { authorized: false, response: 401 }          → not signed in
 *   { authorized: false, response: 403 }          → signed in, wrong role
 *   { authorized: false, response: 500 }          → Clerk API error
 */
export async function requireAdminClerk(): Promise<AuthorizedResult | UnauthorizedResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Authentication required.' },
          { status: 401 },
        ),
      };
    }

    // getRoleFromClerk() now throws on Clerk API errors (no silent catch)
    // so this outer catch returns 500 "Authentication service error." properly.
    const role = await getRoleFromClerk(userId);

    if (!ADMIN_ROLES.includes(role)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden. Admin role required.', role },
          { status: 403 },
        ),
      };
    }

    return { authorized: true, userId, role: role as AdminRole };
  } catch (err) {
    // Log so Vercel function logs show the actual Clerk/auth error
    console.error('[admin-auth] requireAdminClerk error:', err);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication service error. Please try again.' },
        { status: 500 },
      ),
    };
  }
}

// ─── Server Component helpers ─────────────────────────────────────────────────

/**
 * Returns true if the current user has admin or superadmin role.
 *
 * Uses currentUser() which fetches the full user from Clerk's API,
 * including publicMetadata — never relies on JWT claims.
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;
    const meta = user.publicMetadata as { role?: string } | undefined;
    return ADMIN_ROLES.includes(meta?.role ?? '');
  } catch {
    return false;
  }
}

/**
 * Returns the role string for the current user, or null if not admin.
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  try {
    const user = await currentUser();
    if (!user) return null;
    const meta = user.publicMetadata as { role?: string } | undefined;
    const role = meta?.role ?? '';
    return ADMIN_ROLES.includes(role) ? (role as AdminRole) : null;
  } catch {
    return null;
  }
}
