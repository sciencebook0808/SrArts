/**
 * lib/social-fetcher.ts — 3-tier social stats fetcher (enriched profile edition)
 *
 * ENRICHED DATA: Now captures full social profile per platform:
 *   followers, following, posts, avatarUrl, displayName,
 *   bio, category, externalUrl, profileUrl
 *
 * VERIFIED ENDPOINTS (March 2026):
 *   YouTube:   googleapis.com/youtube/v3/channels?forHandle=@handle&part=snippet,statistics
 *   Instagram: instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url={user}
 *   Twitter:   twitter-api45.p.rapidapi.com/screenname.php?screenname={user}
 *   Facebook:  facebook-scraper3.p.rapidapi.com/page-details?page_name={user}
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

// ─── Core types ───────────────────────────────────────────────────────────────

/** Normalized social profile — single shape across all platforms. */
export interface SocialStats {
  // Counts
  followers:    number;
  following?:   number;
  posts?:       number;
  // Identity
  avatarUrl?:   string;
  displayName?: string;
  // Enriched profile fields
  bio?:         string;
  category?:    string;
  externalUrl?: string;
  profileUrl?:  string;
}

export type FetchMethod = 'clerk_oauth' | 'youtube_api' | 'rapidapi' | 'failed';

export interface FetchResult {
  success:  boolean;
  method:   FetchMethod;
  stats?:   SocialStats;
  error?:   string;
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

// ─── Retry utility ────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 2,
  delayMs = 1000,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Never retry client errors (4xx)
      if (err instanceof Error && err.message.startsWith('HTTP 4')) break;
      if (attempt < maxAttempts) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }
  throw lastErr;
}

// ─── Safe fetch ───────────────────────────────────────────────────────────────

async function safeFetch(url: string, options: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache:  'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 429) throw new Error(`HTTP 429: Rate limit exceeded. ${body.slice(0, 200)}`);
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res;
}

// ─── Platform URL builder ─────────────────────────────────────────────────────

function buildProfileUrl(platform: Platform, username: string): string {
  const clean = username.replace(/^@/, '');
  switch (platform) {
    case 'INSTAGRAM': return `https://www.instagram.com/${clean}/`;
    case 'TWITTER':   return `https://twitter.com/${clean}`;
    case 'FACEBOOK':  return `https://www.facebook.com/${clean}`;
    case 'YOUTUBE':
      return clean.startsWith('UC')
        ? `https://www.youtube.com/channel/${clean}`
        : `https://www.youtube.com/@${clean.replace(/^@/, '')}`;
  }
}

// ─── TIER 2: YouTube Official API ─────────────────────────────────────────────

interface YouTubeAPIResponse {
  items?: Array<{
    snippet?: {
      title?:       string;
      description?: string;
      thumbnails?:  { default?: { url?: string }; medium?: { url?: string } };
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
  const params   = new URLSearchParams({
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
    bio:         item.snippet?.description?.trim().slice(0, 500) || undefined,
    profileUrl:  buildProfileUrl('YOUTUBE', username),
  };
}

// ─── TIER 2: RapidAPI — Instagram ────────────────────────────────────────────

interface InstagramScraperResponse {
  data?: {
    user?: {
      follower_count?:   number;
      following_count?:  number;
      media_count?:      number;
      profile_pic_url?:  string;
      full_name?:        string;
      username?:         string;
      biography?:        string;
      category_name?:    string;
      external_url?:     string;
    };
  };
}

/**
 * Fetch full Instagram profile via RapidAPI instagram-scraper-api2.
 * Returns complete SocialStats including bio, following, category, externalUrl.
 */
export async function getInstagramProfile(username: string): Promise<SocialStats> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new SocialFetchError('INSTAGRAM', username, 'RAPIDAPI_KEY not set');

  const clean = username.replace(/^@/, '');
  const res   = await withRetry(() => safeFetch(
    `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${encodeURIComponent(clean)}`,
    {
      method:  'GET',
      headers: {
        'X-RapidAPI-Key':  key,
        'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com',
      },
    },
  ));
  const data = await res.json() as InstagramScraperResponse;

  const user = data.data?.user;
  if (!user) throw new SocialFetchError('INSTAGRAM', username, 'User not found or private');

  return {
    followers:   user.follower_count   ?? 0,
    following:   user.following_count,
    posts:       user.media_count,
    avatarUrl:   user.profile_pic_url,
    displayName: user.full_name || user.username,
    bio:         user.biography?.trim()    || undefined,
    category:    user.category_name        || undefined,
    externalUrl: user.external_url         || undefined,
    profileUrl:  buildProfileUrl('INSTAGRAM', clean),
  };
}

// ─── TIER 2: RapidAPI — Twitter/X ────────────────────────────────────────────

interface TwitterScraperResponse {
  followers_count?:         number;
  friends_count?:           number;
  statuses_count?:          number;
  profile_image_url_https?: string;
  name?:                    string;
  screen_name?:             string;
  description?:             string;
  url?:                     string;
  entities?: {
    url?: { urls?: Array<{ expanded_url?: string }> };
  };
  error?: string;
}

/**
 * Fetch full Twitter/X profile via RapidAPI twitter-api45.
 * Returns complete SocialStats including bio, following, externalUrl.
 */
export async function getTwitterProfile(username: string): Promise<SocialStats> {
  const key   = process.env.RAPIDAPI_KEY;
  if (!key) throw new SocialFetchError('TWITTER', username, 'RAPIDAPI_KEY not set');

  const clean = username.replace(/^@/, '');
  const res   = await withRetry(() => safeFetch(
    `https://twitter-api45.p.rapidapi.com/screenname.php?screenname=${encodeURIComponent(clean)}`,
    {
      method:  'GET',
      headers: {
        'X-RapidAPI-Key':  key,
        'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com',
      },
    },
  ));
  const data = await res.json() as TwitterScraperResponse;

  if (data.error) throw new SocialFetchError('TWITTER', username, data.error);
  if (data.followers_count === undefined) {
    throw new SocialFetchError('TWITTER', username, 'User not found');
  }

  // Unwrap t.co shortened URL to the real destination
  const externalUrl =
    data.entities?.url?.urls?.[0]?.expanded_url
    ?? (data.url && !data.url.startsWith('https://t.co') ? data.url : undefined);

  return {
    followers:   data.followers_count,
    following:   data.friends_count,
    posts:       data.statuses_count,
    avatarUrl:   data.profile_image_url_https?.replace('_normal', '_400x400'),
    displayName: data.name || data.screen_name,
    bio:         data.description?.trim() || undefined,
    externalUrl: externalUrl              || undefined,
    profileUrl:  buildProfileUrl('TWITTER', clean),
  };
}

// ─── TIER 2: RapidAPI — Facebook ─────────────────────────────────────────────

interface FacebookScraperResponse {
  followers_count?: number;
  likes?:           number;
  name?:            string;
  profile_picture?: string;
  about?:           string;
  description?:     string;
  website?:         string;
  category?:        string;
  error?:           string | { message?: string };
}

/**
 * Fetch full Facebook page profile via RapidAPI facebook-scraper3.
 * Returns complete SocialStats including bio, category, externalUrl.
 */
export async function getFacebookProfile(username: string): Promise<SocialStats> {
  const key   = process.env.RAPIDAPI_KEY;
  if (!key) throw new SocialFetchError('FACEBOOK', username, 'RAPIDAPI_KEY not set');

  const clean = username.replace(/^@/, '');
  const res   = await withRetry(() => safeFetch(
    `https://facebook-scraper3.p.rapidapi.com/page-details?page_name=${encodeURIComponent(clean)}`,
    {
      method:  'GET',
      headers: {
        'X-RapidAPI-Key':  key,
        'X-RapidAPI-Host': 'facebook-scraper3.p.rapidapi.com',
      },
    },
  ));
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
    bio:         (data.about || data.description)?.trim() || undefined,
    category:    data.category   || undefined,
    externalUrl: data.website    || undefined,
    profileUrl:  buildProfileUrl('FACEBOOK', clean),
  };
}

// ─── Main dispatcher with full priority chain ─────────────────────────────────

interface FetchOptions {
  platform:        Platform;
  username:        string;
  clerkUserId?:    string | null;
  clerkProvider?:  string | null;
  oauthConnected?: boolean;
}

/**
 * Fetch social stats with automatic 3-tier fallback.
 * Never throws — always returns a FetchResult for safe cron/batch use.
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
        case 'TWITTER':   stats = await fetchTwitterViaOAuth(clerkUserId);               break;
        case 'INSTAGRAM': stats = await fetchInstagramViaFacebookOAuth(clerkUserId);     break;
        case 'FACEBOOK':  stats = await fetchFacebookViaOAuth(clerkUserId);              break;
        case 'YOUTUBE':   stats = await fetchYouTubeViaOAuth(clerkUserId);               break;
        default:          throw new Error(`Unknown platform: ${platform}`);
      }
      return { success: true, method: 'clerk_oauth', stats };
    } catch (err) {
      const errMsg = err instanceof OAuthFetchError
        ? err.message
        : (err instanceof Error ? err.message : String(err));
      console.warn(`[social-fetcher] OAuth failed for ${platform}:${username}, falling back:`, errMsg);
    }
  }

  // ── TIER 2: Official API / RapidAPI ──────────────────────────────────────
  try {
    let stats: SocialStats;
    switch (platform) {
      case 'YOUTUBE':   stats = await fetchYouTubeOfficial(username);   return { success: true, method: 'youtube_api', stats };
      case 'INSTAGRAM': stats = await getInstagramProfile(username);     return { success: true, method: 'rapidapi', stats };
      case 'TWITTER':   stats = await getTwitterProfile(username);       return { success: true, method: 'rapidapi', stats };
      case 'FACEBOOK':  stats = await getFacebookProfile(username);      return { success: true, method: 'rapidapi', stats };
      default:          throw new Error(`Unknown platform: ${platform}`);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[social-fetcher] All tiers failed for ${platform}:${username}:`, errMsg);
    return { success: false, method: 'failed', error: errMsg };
  }
}

/** Legacy direct fetch — throws on failure. Prefer fetchSocialStatsWithFallback in cron. */
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
