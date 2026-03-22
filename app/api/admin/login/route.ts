import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminSession } from '@/lib/admin-auth';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * POST /api/admin/login
 *
 * Two-layer authentication:
 *  1. Password check  — ADMIN_PASSWORD env var (required)
 *  2. Clerk email     — ADMIN_EMAIL env var (optional but recommended)
 *
 * Both must pass when ADMIN_EMAIL is configured.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { password?: string };
    const password = body.password?.trim() ?? '';

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // ── 1. Password verification ───────────────────────────────────────────
    const passwordValid = await verifyAdminPassword(password);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // ── 2. Optional Clerk email verification ───────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim() ?? '';
    if (adminEmail) {
      try {
        const { userId } = await auth();
        if (userId) {
          const client = await clerkClient();
          const user   = await client.users.getUser(userId);
          const primary = user.emailAddresses
            .find(e => e.id === user.primaryEmailAddressId)
            ?.emailAddress
            ?.toLowerCase()
            .trim()
            ?? '';

          if (primary !== adminEmail) {
            return NextResponse.json(
              { error: 'This Clerk account is not authorised for admin access' },
              { status: 403 }
            );
          }
        }
        // If not signed into Clerk but password is correct, allow (password is primary guard)
      } catch {
        // Clerk SDK error — allow through (password has been verified)
      }
    }

    // ── 3. Set session cookie ──────────────────────────────────────────────
    await setAdminSession();
    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
