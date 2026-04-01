/**
 * app/api/cron/social-sync/route.ts
 *
 * Vercel Cron Job — runs daily at 5:00 PM IST (11:30 AM UTC).
 *
 * ── VERCEL CONFIG (vercel.json) ───────────────────────────────────────────────
 *   {
 *     "crons": [{ "path": "/api/cron/social-sync", "schedule": "30 11 * * *" }]
 *   }
 *
 * ── SECURITY ──────────────────────────────────────────────────────────────────
 *   Vercel automatically injects:  Authorization: Bearer ${CRON_SECRET}
 *   Ref: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 *
 * ── PRIORITY CHAIN PER ACCOUNT ────────────────────────────────────────────────
 *   1. useManual=true           → SKIP (never overwrite manual data)
 *   2. oauthConnected=true      → Try Clerk OAuth → platform API
 *   3. oauthConnected=false     → Try official API (YouTube) or RapidAPI
 *   4. All fail                 → Record error, set fetchStatus="failed",
 *                                 DB retains last valid data
 *
 * FIX APPLIED (April 2026):
 *  LOOP ISOLATION: Each prisma.socialAccount.update() call inside the for-loop is
 *  now wrapped in its own try/catch. A single DB write failure for one account no
 *  longer aborts the entire cron job — the loop continues to the next account and
 *  the failure is recorded in summary.errors.
 */

import { NextRequest, NextResponse }          from 'next/server';
import prisma                                  from '@/lib/db';
import { fetchSocialStatsWithFallback }        from '@/lib/social-fetcher';
import type { SocialPlatform }                 from '@prisma/client';
import type { Platform }                       from '@/lib/social-fetcher';

export const maxDuration = 60; // Vercel Pro: up to 60s. Hobby: 10s.

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // ── Security check ──────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[social-sync] CRON_SECRET env var is not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // ── Load all accounts ───────────────────────────────────────────────────
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
      where:  { profileId: 'artist_profile' },
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
    console.error('[social-sync] DB error loading accounts:', err);
    return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
  }

  if (accounts.length === 0) {
    return NextResponse.json({
      message: 'No accounts configured', updated: 0, skipped: 0, failed: 0,
    });
  }

  // ── Process each account ────────────────────────────────────────────────

  const summary = {
    updated:    0,
    skipped:    0,   // useManual = true
    oauth:      0,   // fetched via Clerk OAuth
    api:        0,   // fetched via official/RapidAPI
    failed:     0,
    errors:     [] as Array<{ platform: string; username: string; error: string }>,
  };

  for (const account of accounts) {
    // TIER 3: Manual — never overwrite
    if (account.useManual) {
      summary.skipped++;
      continue;
    }

    // fetchSocialStatsWithFallback never throws — always returns a FetchResult
    const result = await fetchSocialStatsWithFallback({
      platform:       account.platform as Platform,
      username:       account.username,
      clerkUserId:    account.clerkUserId,
      clerkProvider:  account.clerkProvider,
      oauthConnected: account.oauthConnected,
    });

    if (result.success && result.stats) {
      // ── FIX: per-account try/catch so a single DB write failure cannot abort
      //    the entire cron job. The loop continues to the next account.
      try {
        await prisma.socialAccount.update({
          where: { id: account.id },
          data: {
            followers:      result.stats.followers,
            posts:          result.stats.posts      ?? null,
            avatarUrl:      result.stats.avatarUrl  ?? null,
            displayName:    result.stats.displayName ?? null,
            lastFetchMethod: result.method,
            lastFetchError:  null,
            fetchStatus:     'success',
            lastFetchedAt:   new Date(),
          },
        });

        summary.updated++;
        if (result.method === 'clerk_oauth') summary.oauth++;
        else summary.api++;

        console.log(
          `[social-sync] ✓ ${account.platform}:${account.username}` +
          ` → ${result.stats.followers.toLocaleString()} followers (${result.method})`,
        );
      } catch (dbErr) {
        console.error(
          `[social-sync] DB write failed for ${account.platform}:${account.username}:`,
          dbErr,
        );
        summary.failed++;
        summary.errors.push({
          platform: account.platform,
          username: account.username,
          error:    `DB write failed: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
        });
      }
    } else {
      // Fetch failed — record error, DO NOT overwrite last valid data
      // ── FIX: per-account try/catch for the error-recording update too
      try {
        await prisma.socialAccount.update({
          where: { id: account.id },
          data: {
            lastFetchMethod: 'failed',
            lastFetchError:  result.error ?? 'Unknown error',
            fetchStatus:     'failed',
            lastFetchedAt:   new Date(),
          },
        });
      } catch (dbErr) {
        console.error(
          `[social-sync] DB error-status write failed for ${account.platform}:${account.username}:`,
          dbErr,
        );
      }

      summary.failed++;
      summary.errors.push({
        platform: account.platform,
        username: account.username,
        error:    result.error ?? 'Unknown',
      });

      console.error(
        `[social-sync] ✗ ${account.platform}:${account.username} →`,
        result.error,
      );
    }
  }

  console.log('[social-sync] Complete:', summary);

  return NextResponse.json({
    message:   'Sync complete',
    timestamp: new Date().toISOString(),
    ...summary,
  });
}
