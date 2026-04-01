/**
 * app/api/social/[id]/route.ts
 *
 * PATCH  /api/social/[id]  — update account settings (admin only)
 * DELETE /api/social/[id]  — remove account (admin only)
 *
 * FIXES APPLIED (April 2026):
 *
 * 1. TYPESCRIPT BUILD BUG — PATCH data typed as `Record<string, unknown>`.
 *    After the `!admin` build fix was deployed, TypeScript's next pass surfaces
 *    this: `Record<string,unknown>` is not assignable to
 *    `Prisma.SocialAccountUpdateInput`. Fixed by using the proper Prisma type.
 *
 * 2. WRONG P2025 DETECTION — Old code used `err.message.includes('Record to
 *    update not found')` / `'Record to delete does not exist'`. In Prisma 7
 *    the actual error message format changed. Fixed by using the documented
 *    `err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'`
 *    pattern per https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors
 *
 * 3. EMPTY UPDATE GUARD — If a PATCH body contains no recognised fields, the
 *    previous code built an empty `data` object and sent it to Prisma.
 *    Prisma 7 now raises `PrismaClientValidationError` for empty updates.
 *    Fixed: return 400 immediately when no valid fields are present.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk }         from '@/lib/admin-auth';
import prisma                        from '@/lib/db';
import { Prisma }                    from '@prisma/client';

type Params = { params: Promise<{ id: string }> };

// ─── PATCH — update account settings ─────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    manualFollowers,
    manualPosts,
    useManual,
    username,
    clerkUserId,
    clerkProvider,
    oauthConnected,
  } = body as {
    manualFollowers?: number | null;
    manualPosts?:     number | null;
    useManual?:       boolean;
    username?:        string;
    clerkUserId?:     string | null;
    clerkProvider?:   string | null;
    oauthConnected?:  boolean;
  };

  // FIX 1: Build update payload as the correct Prisma type.
  // `Record<string, unknown>` caused a hidden TypeScript error that surfaced
  // after the primary `!admin` build fix was applied.
  const updateData: Prisma.SocialAccountUpdateInput = {};

  if (typeof useManual === 'boolean') {
    updateData.useManual   = useManual;
    updateData.fetchStatus = useManual ? 'manual' : 'pending';
  }
  if (manualFollowers !== undefined) {
    updateData.manualFollowers =
      manualFollowers === null ? null : Math.round(Number(manualFollowers));
  }
  if (manualPosts !== undefined) {
    updateData.manualPosts =
      manualPosts === null ? null : Math.round(Number(manualPosts));
  }
  if (username?.trim()) {
    updateData.username    = username.trim();
    updateData.fetchStatus = 'pending'; // reset on username change
  }
  if (clerkUserId !== undefined)   updateData.clerkUserId    = clerkUserId;
  if (clerkProvider !== undefined) updateData.clerkProvider  = clerkProvider;
  if (typeof oauthConnected === 'boolean') updateData.oauthConnected = oauthConnected;

  // FIX 3: Guard against empty update (Prisma 7 raises PrismaClientValidationError)
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 },
    );
  }

  try {
    const account = await prisma.socialAccount.update({
      where: { id },
      data:  updateData,
    });
    return NextResponse.json({ account });
  } catch (err: unknown) {
    // FIX 2: Use Prisma's documented P2025 error code check (not string matching)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    console.error('[social/[id]/PATCH]', err);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 },
    );
  }
}

// ─── DELETE — remove account ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const { id } = await params;

  try {
    await prisma.socialAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    // FIX 2: Use Prisma's documented P2025 error code check (not string matching)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    console.error('[social/[id]/DELETE]', err);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
