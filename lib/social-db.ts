/**
 * lib/social-db.ts — Social profile DB helpers (server-only)
 *
 * Separation of concerns: this module owns ALL social-media DB operations.
 * Other server code should import from here rather than querying SocialAccount directly.
 *
 * ── DATA FLOW ──────────────────────────────────────────────────────────────────
 *
 *   API / RapidAPI  ──→  fetchAndStoreSocialProfile()  ──→  DB
 *                                                             │
 *   UI / Pages  ──────────────────────────────────────────→  getSocialProfileFromDB()
 *
 * The UI ALWAYS reads from DB. API calls happen only:
 *   1. On cron schedule (daily at 5 PM IST)
 *   2. On manual admin sync
 *   3. On-demand via getOrFetchSocialProfile() when data is stale (>8h)
 *
 * ── CACHING STRATEGY ──────────────────────────────────────────────────────────
 *
 *   STALE_THRESHOLD_HOURS = 8   (fetch at most every 8 hours)
 *
 *   isStale(lastFetchedAt):
 *     null        → always stale (never fetched)
 *     > 8h ago    → stale, needs refresh
 *     <= 8h ago   → fresh, use cached data
 *
 *   getOrFetchSocialProfile(): returns cached if fresh, re-fetches if stale.
 *   This is the recommended function for on-demand page rendering outside cron.
 */

import prisma                           from '@/lib/db';
import { fetchSocialStatsWithFallback } from '@/lib/social-fetcher';
import type { SocialPlatform }          from '@prisma/client';
import type { Platform, FetchResult }   from '@/lib/social-fetcher';

const PROFILE_ID            = 'artist_profile';
const STALE_THRESHOLD_HOURS = 8;

// ─── Normalized read type ─────────────────────────────────────────────────────

/** Full enriched social profile as read from the DB. */
export interface SocialProfile {
  id:              string;
  platform:        'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK';
  username:        string;
  // Identity
  displayName:     string | null;
  avatarUrl:       string | null;
  // Enriched fields (new)
  bio:             string | null;
  category:        string | null;
  externalUrl:     string | null;
  profileUrl:      string | null;
  // Counts
  followers:       number | null;
  following:       number | null;
  posts:           number | null;
  // Manual override
  manualFollowers: number | null;
  manualPosts:     number | null;
  useManual:       boolean;
  // Meta
  oauthConnected:  boolean;
  lastFetchMethod: string | null;
  fetchStatus:     string;
  lastFetchedAt:   Date | null;
}

// ─── Staleness check ──────────────────────────────────────────────────────────

function isStale(lastFetchedAt: Date | null): boolean {
  if (!lastFetchedAt) return true;
  const ageMs      = Date.now() - lastFetchedAt.getTime();
  const thresholdMs = STALE_THRESHOLD_HOURS * 60 * 60 * 1000;
  return ageMs > thresholdMs;
}

// ─── DB read ──────────────────────────────────────────────────────────────────

/** Read a single social profile from the DB (no fetch). Returns null if not found. */
export async function getSocialProfileFromDB(
  platform: Platform,
  username: string,
): Promise<SocialProfile | null> {
  try {
    const row = await prisma.socialAccount.findFirst({
      where: {
        profileId: PROFILE_ID,
        platform:  platform as SocialPlatform,
        username:  username.replace(/^@/, ''),
      },
      select: {
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
        lastFetchMethod: true,
        fetchStatus:     true,
        lastFetchedAt:   true,
      },
    });
    return row as SocialProfile | null;
  } catch {
    return null;
  }
}

/** Read all social profiles from the DB (no fetch). */
export async function getAllSocialProfilesFromDB(): Promise<SocialProfile[]> {
  try {
    const rows = await prisma.socialAccount.findMany({
      where:   { profileId: PROFILE_ID },
      orderBy: { createdAt: 'asc' },
      select: {
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
        lastFetchMethod: true,
        fetchStatus:     true,
        lastFetchedAt:   true,
      },
    });
    return rows as SocialProfile[];
  } catch {
    return [];
  }
}

// ─── DB write ─────────────────────────────────────────────────────────────────

/**
 * Fetch fresh data from the API and store it in the DB.
 * Returns the FetchResult (use result.success to check outcome).
 *
 * Use this in:
 *   - Cron jobs
 *   - Manual admin sync
 *   - On-demand refresh when data is stale
 */
export async function fetchAndStoreSocialProfile(
  platform: Platform,
  username: string,
  opts: {
    clerkUserId?:    string | null;
    clerkProvider?:  string | null;
    oauthConnected?: boolean;
  } = {},
): Promise<FetchResult> {
  const clean  = username.replace(/^@/, '');
  const result = await fetchSocialStatsWithFallback({
    platform,
    username: clean,
    ...opts,
  });

  if (result.success && result.stats) {
    try {
      await prisma.socialAccount.updateMany({
        where: { profileId: PROFILE_ID, platform: platform as SocialPlatform, username: clean },
        data: {
          followers:       result.stats.followers,
          following:       result.stats.following    ?? null,
          posts:           result.stats.posts        ?? null,
          avatarUrl:       result.stats.avatarUrl    ?? null,
          displayName:     result.stats.displayName  ?? null,
          bio:             result.stats.bio          ?? null,
          category:        result.stats.category     ?? null,
          externalUrl:     result.stats.externalUrl  ?? null,
          profileUrl:      result.stats.profileUrl   ?? null,
          lastFetchMethod: result.method,
          lastFetchError:  null,
          fetchStatus:     'success',
          lastFetchedAt:   new Date(),
        },
      });
    } catch (err) {
      console.error(`[social-db] DB write failed for ${platform}:${clean}:`, err);
      return {
        success: false,
        method:  result.method,
        error:   `DB write failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  } else {
    // Record error without overwriting valid cached data
    try {
      await prisma.socialAccount.updateMany({
        where: { profileId: PROFILE_ID, platform: platform as SocialPlatform, username: clean },
        data: {
          lastFetchMethod: 'failed',
          lastFetchError:  result.error ?? 'Unknown error',
          fetchStatus:     'failed',
          lastFetchedAt:   new Date(),
        },
      });
    } catch { /* non-critical — ignore write error for error recording */ }
  }

  return result;
}

// ─── Cache-aware read (auto-refresh if stale) ─────────────────────────────────

/**
 * Return cached social profile if fresh (< 8h old), otherwise re-fetch from API.
 *
 * Designed for on-demand use in pages that need guaranteed fresh-ish data
 * without waiting for the cron job.
 *
 * Returns null if the account isn't configured in the DB.
 */
export async function getOrFetchSocialProfile(
  platform: Platform,
  username: string,
): Promise<SocialProfile | null> {
  const existing = await getSocialProfileFromDB(platform, username);
  if (!existing) return null;

  // Manual accounts — never auto-fetch
  if (existing.useManual) return existing;

  if (isStale(existing.lastFetchedAt)) {
    await fetchAndStoreSocialProfile(platform, username, {
      clerkUserId:    null,
      clerkProvider:  null,
      oauthConnected: existing.oauthConnected,
    });
    // Re-read fresh data
    return getSocialProfileFromDB(platform, username);
  }

  return existing;
}

// ─── Effective count helpers ──────────────────────────────────────────────────

/**
 * Return the follower count that should be displayed for a profile.
 * Respects the useManual flag.
 */
export function effectiveFollowers(profile: SocialProfile): number | null {
  if (profile.useManual) return profile.manualFollowers;
  return profile.followers;
}

/**
 * Return the post count that should be displayed for a profile.
 * Respects the useManual flag.
 */
export function effectivePosts(profile: SocialProfile): number | null {
  if (profile.useManual) return profile.manualPosts;
  return profile.posts;
}

/** Format a follower count to human-readable string (12.4K, 1.2M). */
export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}
