/**
 * app/api/social/route.ts
 *
 * GET  /api/social  — list all social accounts (public — used by homepage)
 * POST /api/social  — create account (admin only, max 8)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk }          from '@/lib/admin-auth';
import prisma                        from '@/lib/db';
import type { SocialPlatform }       from '@prisma/client';

const PROFILE_ID   = 'artist_profile';
const MAX_ACCOUNTS = 8;
const VALID_PLATFORMS: SocialPlatform[] = ['INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK'];

/**
 * Fields safe to expose publicly.
 *
 * SECURITY FIX (this audit): this handler previously returned the full row,
 * which leaked `clerkUserId` (the admin's Clerk user ID), `clerkProvider` and
 * `lastFetchError` (raw upstream error strings, sometimes containing API
 * endpoints and key fragments) to anonymous callers. Admins get the full row
 * from the admin dashboard via `?admin=true`.
 */
const PUBLIC_ACCOUNT_FIELDS = {
  id:              true,
  platform:        true,
  username:        true,
  displayName:     true,
  avatarUrl:       true,
  bio:             true,
  category:        true,
  externalUrl:     true,
  profileUrl:      true,
  followers:       true,
  following:       true,
  posts:           true,
  manualFollowers: true,
  manualPosts:     true,
  useManual:       true,
  oauthConnected:  true,
  fetchStatus:     true,
  lastFetchedAt:   true,
  createdAt:       true,
} as const;

export async function GET(req: NextRequest) {
  const wantsAdminView = new URL(req.url).searchParams.get('admin') === 'true';

  try {
    // Only an authenticated admin may see the operational fields.
    if (wantsAdminView) {
      const check = await requireAdminClerk();
      if (!check.authorized) return check.response;

      const accounts = await prisma.socialAccount.findMany({
        where:   { profileId: PROFILE_ID },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json({ accounts });
    }

    const accounts = await prisma.socialAccount.findMany({
      where:   { profileId: PROFILE_ID },
      orderBy: { createdAt: 'asc' },
      select:  PUBLIC_ACCOUNT_FIELDS,
    });
    return NextResponse.json({ accounts });
  } catch (err) {
    console.error('[social/GET]', err);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { platform, username } = body as { platform?: string; username?: string };

  if (!platform || !VALID_PLATFORMS.includes(platform as SocialPlatform)) {
    return NextResponse.json(
      { error: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}` },
      { status: 400 },
    );
  }
  if (!username?.trim()) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const count = await prisma.socialAccount.count({ where: { profileId: PROFILE_ID } });
    if (count >= MAX_ACCOUNTS) {
      return NextResponse.json({ error: `Maximum ${MAX_ACCOUNTS} accounts allowed` }, { status: 400 });
    }

    const account = await prisma.socialAccount.create({
      data: {
        profileId:   PROFILE_ID,
        platform:    platform as SocialPlatform,
        username:    username.trim(),
        fetchStatus: 'pending',
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.toLowerCase().includes('unique')) {
      return NextResponse.json({ error: 'This account already exists' }, { status: 409 });
    }
    console.error('[social/POST]', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
