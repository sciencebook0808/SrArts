/**
 * app/api/social/[id]/route.ts
 *
 * PATCH  /api/social/[id]  — update account settings (admin only)
 * DELETE /api/social/[id]  — remove account (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk }         from '@/lib/admin-auth';
import prisma                        from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
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

  const data: Record<string, unknown> = {};

  if (typeof useManual === 'boolean') {
    data.useManual   = useManual;
    data.fetchStatus = useManual ? 'manual' : 'pending';
  }
  if (manualFollowers !== undefined) {
    data.manualFollowers = manualFollowers === null ? null : Number(manualFollowers);
  }
  if (manualPosts !== undefined) {
    data.manualPosts = manualPosts === null ? null : Number(manualPosts);
  }
  if (username?.trim()) {
    data.username    = username.trim();
    data.fetchStatus = 'pending'; // reset on username change
  }
  if (clerkUserId !== undefined)   data.clerkUserId    = clerkUserId;
  if (clerkProvider !== undefined) data.clerkProvider  = clerkProvider;
  if (typeof oauthConnected === 'boolean') data.oauthConnected = oauthConnected;

  try {
    const account = await prisma.socialAccount.update({ where: { id }, data });
    return NextResponse.json({ account });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    console.error('[social/[id]/PATCH]', err);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const { id } = await params;

  try {
    await prisma.socialAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    console.error('[social/[id]/DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
