/**
 * app/api/admin/social-sync/route.ts
 *
 * Admin-only manual trigger for social stats sync.
 * Uses the same fetchSocialStatsWithFallback logic as the cron job,
 * but authenticated via the admin session cookie instead of CRON_SECRET.
 *
 * POST /api/admin/social-sync          — sync ALL accounts
 * POST /api/admin/social-sync?id=xxx   — sync a single account by ID
 */

import { NextRequest, NextResponse }        from 'next/server';
import { requireAdminClerk }                from '@/lib/admin-auth';
import prisma                               from '@/lib/db';
import { fetchSocialStatsWithFallback }     from '@/lib/social-fetcher';
import type { SocialPlatform }              from '@prisma/client';
import type { Platform }                   from '@/lib/social-fetcher';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // ── Admin auth check ────────────────────────────────────────────────────
  const auth = await requireAdminClerk();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const singleId = searchParams.get('id');

  // ── Load accounts ────────────────────────────────────────────────────────
  let accounts: Array<{
    id:             string;
    platform:       SocialPlatform;
    username:       string;
    useManual:      boolean;
    clerkUserId:    string | null;
    clerkProvider:  string | null;
    oauthConnected: boolean;
  }>;

  try {
    accounts = await prisma.socialAccount.findMany({
      where: {
        profileId: 'artist_profile',
        ...(singleId ? { id: singleId } : {}),
      },
      select: {
        id:             true,
        platform:       true,
        username:       true,
        useManual:      true,
        clerkUserId:    true,
        clerkProvider:  true,
        oauthConnected: true,
      },
    });
  } catch (err) {
    console.error('[admin/social-sync] DB error:', err);
    return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
  }

  if (accounts.length === 0) {
    return NextResponse.json({ message: 'No accounts found', updated: 0, skipped: 0, failed: 0 });
  }

  // ── Process each account ────────────────────────────────────────────────
  const summary = {
    updated:  0,
    skipped:  0,
    failed:   0,
    errors:   [] as Array<{ platform: string; username: string; error: string }>,
  };

  for (const account of accounts) {
    if (account.useManual) {
      summary.skipped++;
      continue;
    }

    const result = await fetchSocialStatsWithFallback({
      platform:       account.platform as Platform,
      username:       account.username,
      clerkUserId:    account.clerkUserId,
      clerkProvider:  account.clerkProvider,
      oauthConnected: account.oauthConnected,
    });

    if (result.success && result.stats) {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          followers:       result.stats.followers,
          posts:           result.stats.posts      ?? null,
          avatarUrl:       result.stats.avatarUrl  ?? null,
          displayName:     result.stats.displayName ?? null,
          lastFetchMethod: result.method,
          lastFetchError:  null,
          fetchStatus:     'success',
          lastFetchedAt:   new Date(),
        },
      });
      summary.updated++;
    } else {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          lastFetchMethod: 'failed',
          lastFetchError:  result.error ?? 'Unknown error',
          fetchStatus:     'failed',
          lastFetchedAt:   new Date(),
        },
      });
      summary.failed++;
      summary.errors.push({
        platform: account.platform,
        username: account.username,
        error:    result.error ?? 'Unknown',
      });
    }
  }

  return NextResponse.json({
    message:   'Manual sync complete',
    timestamp: new Date().toISOString(),
    ...summary,
  });
}
