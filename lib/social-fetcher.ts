/**
 * lib/social-fetcher.ts — 3-tier social stats fetcher
 *
 * ── PRIORITY CHAIN ────────────────────────────────────────────────────────────
 *
 * TIER 1 — Clerk OAuth (if admin connected their social account via Clerk)
 *   Uses getUserOauthAccessToken(clerkUserId, provider) then calls the
 *   official platform API with the user's real OAuth token.
 *   Most reliable — real data, no scraping, no rate limit issues.
 *
 * TIER 2 — Official API / RapidAPI Scraper (fallback when not OAuth connected)
 *   YOUTUBE:   Official YouTube Data API v3 (YOUTUBE_API_KEY)
 *   INSTAGRAM: RapidAPI instagram-scraper-api2 (RAPIDAPI_KEY)
 *   TWITTER:   RapidAPI twitter-api45 (RAPIDAPI_KEY)
 *   FACEBOOK:  RapidAPI facebook-scraper3 (RAPIDAPI_KEY)
 *
 * TIER 3 — Manual (admin sets numbers in dashboard, NEVER overwritten by cron)
 *   Tracked via useManual=true + manualFollowers fields on SocialAccount.
 *
 * ── VERIFIED ENDPOINTS (March 2026) ──────────────────────────────────────────
 *
 * YouTube Official:  googleapis.com/youtube/v3/channels?forHandle=@handle&part=snippet,statistics
 * Instagram RapidAPI: instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url={user}
 * Twitter RapidAPI:  twitter-api45.p.rapidapi.com/screenname.php?screenname={user}
 * Facebook RapidAPI: facebook-scraper3.p.rapidapi.com/page-details?page_name={user}
 */

import {
  fetchTwitterViaOAuth,
  fetchInstagramViaFacebookOAuth,
  fetchFacebookViaOAuth,
  fetchYouTubeViaOAuth,
  OAuthFetchError,
  type OAuthStats,
} from '@/lib/social-oauth';

const TIMEOUT_MS = 10_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocialStats {
  followers:    number;
  posts?:       number;
  avatarUrl?:   string;
  displayName?: string;
}

export type FetchMethod = 'clerk_oauth' | 'youtube_api' | 'rapidapi' | 'failed';

export interface FetchResult {
  success:      boolean;
  method:       FetchMethod;
  stats?:       SocialStats;
  error?:       string;
}

export class SocialFetchError extends Error {
  constructor(
    public readonly platform: string,
    public readonly username: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${platform}:${username}] ${message}`);
    this.name = 'SocialFetchError';
  }
}

export type Platform = 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK';

// ─── Utility ─────────────────────────────────────────────────────────────────

async function safeFetch(url: string, options: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache:  'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res;
}

// ─── TIER 2: YouTube Official API ─────────────────────────────────────────────

interface YouTubeAPIResponse {
  items?: Array<{
    snippet?: {
      title?:      string;
      thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
    };
    statistics?: {
      subscriberCount?:       string;
      videoCount?:            string;
      hiddenSubscriberCount?: boolean;
    };
  }>;
}

async function fetchYouTubeOfficial(username: string): Promise<SocialStats> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new SocialFetchError('YOUTUBE', username, 'YOUTUBE_API_KEY not set');

  const handle   = username.startsWith('@') ? username : `@${username}`;
  const isChannel = /^UC[\w-]{22}$/.test(username);

  const params = new URLSearchParams({
    part: 'snippet,statistics',
    key:  apiKey,
    ...(isChannel ? { id: username } : { forHandle: handle }),
  });

  const res  = await safeFetch(
    `https://www.googleapis.com/youtube/v3/channels?${params}`,
    { method: 'GET' },
  );
  const data = await res.json() as YouTubeAPIResponse;

  const item = data.items?.[0];
  if (!item) throw new SocialFetchError('YOUTUBE', username, 'Channel not found');
  if (item.statistics?.hiddenSubscriberCount) {
    throw new SocialFetchError('YOUTUBE', username, 'Subscriber count hidden');
  }

  return {
    followers:   item.statistics?.subscriberCount ? parseInt(item.statistics.subscriberCount, 10) : 0,
    posts:       item.statistics?.videoCount       ? parseInt(item.statistics.videoCount, 10)       : undefined,
    avatarUrl:   item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url,
    displayName: item.snippet?.title,
  };
}

// ─── TIER 2: RapidAPI — Instagram ────────────────────────────────────────────

interface InstagramScraperResponse {
  data?: {
    user?: {
      follower_count?: number;
      media_count?:    number;
      profile_pic_url?: string;
      full_name?:      string;
      username?:       string;
    };
  };
}

async function fetchInstagramRapidAPI(username: string): Promise<SocialStats> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new SocialFetchError('INSTAGRAM', username, 'RAPIDAPI_KEY not set');

  const clean = username.replace(/^@/, '');
  const res   = await safeFetch(
    `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${encodeURIComponent(clean)}`,
    {
      method:  'GET',
      headers: {
        'X-RapidAPI-Key':  key,
        'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com',
      },
    },
  );
  const data = await res.json() as InstagramScraperResponse;

  const user = data.data?.user;
  if (!user) throw new SocialFetchError('INSTAGRAM', username, 'User not found or private');

  return {
    followers:   user.follower_count  ?? 0,
    posts:       user.media_count,
    avatarUrl:   user.profile_pic_url,
    displayName: user.full_name || user.username,
  };
}

// ─── TIER 2: RapidAPI — Twitter/X ────────────────────────────────────────────

interface TwitterScraperResponse {
  followers_count?:         number;
  statuses_count?:          number;
  profile_image_url_https?: string;
  name?:                    string;
  screen_name?:             string;
  error?:                   string;
}

async function fetchTwitterRapidAPI(username: string): Promise<SocialStats> {
  const key   = process.env.RAPIDAPI_KEY;
  if (!key) throw new SocialFetchError('TWITTER', username, 'RAPIDAPI_KEY not set');

  const clean = username.replace(/^@/, '');
  const res   = await safeFetch(
    `https://twitter-api45.p.rapidapi.com/screenname.php?screenname=${encodeURIComponent(clean)}`,
    {
      method:  'GET',
      headers: {
        'X-RapidAPI-Key':  key,
        'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com',
      },
    },
  );
  const data = await res.json() as TwitterScraperResponse;

  if (data.error) throw new SocialFetchError('TWITTER', username, data.error);
  if (data.followers_count === undefined) {
    throw new SocialFetchError('TWITTER', username, 'User not found');
  }

  return {
    followers:   data.followers_count,
    posts:       data.statuses_count,
    avatarUrl:   data.profile_image_url_https?.replace('_normal', '_400x400'),
    displayName: data.name || data.screen_name,
  };
}

// ─── TIER 2: RapidAPI — Facebook ─────────────────────────────────────────────

interface FacebookScraperResponse {
  followers_count?: number;
  likes?:           number;
  name?:            string;
  profile_picture?: string;
  error?:           string | { message?: string };
}

async function fetchFacebookRapidAPI(username: string): Promise<SocialStats> {
  const key   = process.env.RAPIDAPI_KEY;
  if (!key) throw new SocialFetchError('FACEBOOK', username, 'RAPIDAPI_KEY not set');

  const clean = username.replace(/^@/, '');
  const res   = await safeFetch(
    `https://facebook-scraper3.p.rapidapi.com/page-details?page_name=${encodeURIComponent(clean)}`,
    {
      method:  'GET',
      headers: {
        'X-RapidAPI-Key':  key,
        'X-RapidAPI-Host': 'facebook-scraper3.p.rapidapi.com',
      },
    },
  );
  const data = await res.json() as FacebookScraperResponse;

  if (data.error) {
    const msg = typeof data.error === 'string' ? data.error : (data.error.message ?? 'Error');
    throw new SocialFetchError('FACEBOOK', username, msg);
  }

  const followers = data.followers_count ?? data.likes;
  if (followers === undefined) throw new SocialFetchError('FACEBOOK', username, 'Page not found');

  return {
    followers,
    avatarUrl:   data.profile_picture,
    displayName: data.name,
  };
}

// ─── Main dispatcher with full priority chain ─────────────────────────────────

interface FetchOptions {
  platform:      Platform;
  username:      string;
  clerkUserId?:  string | null;
  clerkProvider?: string | null;
  oauthConnected?: boolean;
}

/**
 * Fetch social stats with automatic 3-tier fallback.
 *
 * Returns a FetchResult that records which method succeeded or failed.
 * Never throws — always returns a result object for cron use.
 */
export async function fetchSocialStatsWithFallback(
  opts: FetchOptions,
): Promise<FetchResult> {
  const { platform, username, clerkUserId, clerkProvider, oauthConnected } = opts;

  // ── TIER 1: Clerk OAuth ───────────────────────────────────────────────────
  if (oauthConnected && clerkUserId && clerkProvider) {
    try {
      let stats: OAuthStats;

      switch (platform) {
        case 'TWITTER':
          stats = await fetchTwitterViaOAuth(clerkUserId);
          break;
        case 'INSTAGRAM':
          stats = await fetchInstagramViaFacebookOAuth(clerkUserId);
          break;
        case 'FACEBOOK':
          stats = await fetchFacebookViaOAuth(clerkUserId);
          break;
        case 'YOUTUBE':
          stats = await fetchYouTubeViaOAuth(clerkUserId);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      return { success: true, method: 'clerk_oauth', stats };
    } catch (err) {
      const errMsg = err instanceof OAuthFetchError
        ? err.message
        : (err instanceof Error ? err.message : String(err));
      // Log and fall through to TIER 2
      console.warn(`[social-fetcher] OAuth failed for ${platform}:${username}, trying fallback:`, errMsg);
    }
  }

  // ── TIER 2: Official API / RapidAPI ──────────────────────────────────────
  try {
    let stats: SocialStats;

    switch (platform) {
      case 'YOUTUBE':
        stats  = await fetchYouTubeOfficial(username);
        return { success: true, method: 'youtube_api', stats };
      case 'INSTAGRAM':
        stats  = await fetchInstagramRapidAPI(username);
        return { success: true, method: 'rapidapi', stats };
      case 'TWITTER':
        stats  = await fetchTwitterRapidAPI(username);
        return { success: true, method: 'rapidapi', stats };
      case 'FACEBOOK':
        stats  = await fetchFacebookRapidAPI(username);
        return { success: true, method: 'rapidapi', stats };
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { success: false, method: 'failed', error: errMsg };
  }
}

/** Legacy direct fetch (used outside cron — throws on failure) */
export async function fetchSocialStats(
  platform: Platform,
  username: string,
): Promise<SocialStats> {
  const result = await fetchSocialStatsWithFallback({ platform, username });
  if (!result.success || !result.stats) {
    throw new SocialFetchError(platform, username, result.error ?? 'All fetch methods failed');
  }
  return result.stats;
}
