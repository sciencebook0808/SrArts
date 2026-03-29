/**
 * lib/social-oauth.ts — Clerk OAuth token retrieval for social APIs
 *
 * SERVER-ONLY. Never import in client components.
 *
 * ── VERIFIED APIs (March 2026) ───────────────────────────────────────────────
 *
 * TWITTER/X (oauth_twitter):
 *   Scopes: tweet.read users.read offline.access
 *   Endpoint: GET https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url,name
 *   Auth: Authorization: Bearer <user_oauth2_token>
 *   Returns: data.public_metrics.followers_count, data.public_metrics.tweet_count
 *   Docs: https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me
 *
 * INSTAGRAM / FACEBOOK (oauth_facebook):
 *   Scopes: public_profile email pages_show_list instagram_basic pages_read_engagement
 *   Step 1: GET /me/accounts?fields=name,instagram_business_account{...}
 *   Step 2: Use IG business account ID to GET /{ig-user-id}?fields=followers_count,media_count
 *   Auth: access_token query param (Graph API doesn't use Bearer header)
 *   Note: Instagram Basic Display API deprecated Dec 4, 2024. Graph API only.
 *   Docs: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/
 *
 * YOUTUBE via GOOGLE (oauth_google):
 *   Scope: https://www.googleapis.com/auth/youtube.readonly
 *   Endpoint: GET https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet,statistics
 *   Auth: Authorization: Bearer <google_oauth_token>
 *   Returns: items[0].statistics.subscriberCount, items[0].statistics.videoCount
 *   Docs: https://developers.google.com/youtube/v3/docs/channels/list
 *
 * ── HOW CLERK OAUTH WORKS ────────────────────────────────────────────────────
 *   1. Admin connects social account via Clerk Dashboard social connections
 *   2. We call clerkClient().users.getUserOauthAccessToken(userId, provider)
 *   3. Returns { data: [{ token, scopes, externalAccountId }] }
 *   4. Token is used server-side only (never exposed to client)
 *   Note: Clerk does NOT auto-refresh tokens. We call getUserOauthAccessToken()
 *   fresh on every cron run — Clerk attempts a refresh internally at that point.
 *   Ref: https://clerk.com/docs/authentication/social-connections/oauth
 */

import { clerkClient }  from '@clerk/nextjs/server';

// ─── Clerk provider type alias ────────────────────────────────────────────────
// getUserOauthAccessToken() requires `oauth_${OAuthProvider}` not plain string.
// We define a local alias for the values we actually use so callers stay typed.
type ClerkOAuthProvider = 
  | 'oauth_google'
  | 'oauth_facebook'
  | 'oauth_twitter'
  | 'oauth_instagram'
  | 'oauth_github'
  | `oauth_custom_${string}`;

const FETCH_TIMEOUT_MS = 10_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OAuthStats {
  followers:    number;
  posts?:       number;
  avatarUrl?:   string;
  displayName?: string;
}

export class OAuthFetchError extends Error {
  constructor(
    public readonly platform: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[OAuth:${platform}] ${message}`);
    this.name = 'OAuthFetchError';
  }
}

// ─── Clerk token retrieval ────────────────────────────────────────────────────

export async function getClerkOAuthToken(
  clerkUserId: string,
  provider: string,   // e.g. "oauth_facebook", "oauth_twitter", "oauth_google"
): Promise<string | null> {
  try {
    const client   = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(clerkUserId, provider as ClerkOAuthProvider);
    return response.data[0]?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if a Clerk user has an active OAuth connection for a provider.
 * Used in the admin UI to show connection status.
 */
export async function checkOAuthConnection(
  clerkUserId: string,
  provider: string,
): Promise<{ connected: boolean; scopes: string[] }> {
  try {
    const client   = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(clerkUserId, provider as ClerkOAuthProvider);
    const token    = response.data[0];
    if (!token?.token) return { connected: false, scopes: [] };
    return {
      connected: true,
      scopes:    token.scopes ?? [],
    };
  } catch {
    return { connected: false, scopes: [] };
  }
}

// ─── Twitter/X via Clerk OAuth ────────────────────────────────────────────────

interface TwitterMeResponse {
  data?: {
    id?:                string;
    name?:              string;
    username?:          string;
    profile_image_url?: string;
    public_metrics?: {
      followers_count?: number;
      tweet_count?:     number;
    };
  };
  errors?: Array<{ title: string; detail: string }>;
}

export async function fetchTwitterViaOAuth(
  clerkUserId: string,
): Promise<OAuthStats> {
  const token = await getClerkOAuthToken(clerkUserId, 'oauth_twitter');
  if (!token) throw new OAuthFetchError('TWITTER', 'No OAuth token in Clerk — user must connect Twitter');

  let data: TwitterMeResponse;
  try {
    const res = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url,name',
      {
        headers: { Authorization: `Bearer ${token}` },
        signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
        cache:   'no-store',
      },
    );
    data = await res.json() as TwitterMeResponse;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new OAuthFetchError('TWITTER', 'API request failed', err);
  }

  if (data.errors?.length) {
    throw new OAuthFetchError('TWITTER', data.errors[0]?.detail ?? 'API error');
  }

  const metrics = data.data?.public_metrics;
  if (metrics?.followers_count === undefined) {
    throw new OAuthFetchError('TWITTER', 'followers_count missing — check tweet.read + users.read scopes');
  }

  return {
    followers:   metrics.followers_count,
    posts:       metrics.tweet_count,
    avatarUrl:   data.data?.profile_image_url?.replace('_normal', '_400x400'),
    displayName: data.data?.name,
  };
}

// ─── Instagram via Facebook OAuth ────────────────────────────────────────────
// Requires: pages_show_list + instagram_basic scopes
// Flow: /me/accounts → find page with instagram_business_account → get IG stats
//
// ⚠️  Requires Business or Creator Instagram account connected to a Facebook Page.
//     Personal Instagram accounts are NOT supported since Dec 4, 2024.

interface FacebookPagesResponse {
  data?: Array<{
    id:   string;
    name: string;
    instagram_business_account?: {
      id:                   string;
      name?:                string;
      username?:            string;
      followers_count?:     number;
      media_count?:         number;
      profile_picture_url?: string;
    };
  }>;
  error?: { message: string; code: number };
}

export async function fetchInstagramViaFacebookOAuth(
  clerkUserId: string,
): Promise<OAuthStats> {
  const token = await getClerkOAuthToken(clerkUserId, 'oauth_facebook');
  if (!token) throw new OAuthFetchError('INSTAGRAM', 'No Facebook OAuth token in Clerk — user must connect Facebook');

  // Step 1: Get Facebook Pages with linked Instagram Business Accounts
  const fields = 'name,instagram_business_account{id,name,username,followers_count,media_count,profile_picture_url}';

  let pagesData: FacebookPagesResponse;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=${fields}&access_token=${token}`,
      {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        cache:  'no-store',
      },
    );
    pagesData = await res.json() as FacebookPagesResponse;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new OAuthFetchError('INSTAGRAM', 'Facebook Graph API request failed', err);
  }

  if (pagesData.error) {
    throw new OAuthFetchError(
      'INSTAGRAM',
      `Graph API error ${pagesData.error.code}: ${pagesData.error.message}`,
    );
  }

  // Find first page that has a connected Instagram Business Account
  const igAccount = pagesData.data
    ?.map(p => p.instagram_business_account)
    .find(ig => ig?.id);

  if (!igAccount?.id) {
    throw new OAuthFetchError(
      'INSTAGRAM',
      'No Instagram Business/Creator account found linked to your Facebook Page. ' +
      'Personal Instagram accounts are not supported by Meta API since Dec 2024.',
    );
  }

  if (igAccount.followers_count === undefined) {
    throw new OAuthFetchError(
      'INSTAGRAM',
      'followers_count not returned — ensure instagram_basic + pages_read_engagement scopes are granted',
    );
  }

  return {
    followers:   igAccount.followers_count,
    posts:       igAccount.media_count,
    avatarUrl:   igAccount.profile_picture_url,
    displayName: igAccount.name ?? igAccount.username,
  };
}

/**
 * Fetch Facebook Page follower count via OAuth.
 * Returns fan_count (likes) or followers_count for the user's first managed Page.
 */

interface FacebookPageStatsResponse {
  id?:              string;
  name?:            string;
  fan_count?:       number;
  followers_count?: number;
  picture?: { data?: { url?: string } };
  error?: { message: string; code: number };
}

export async function fetchFacebookViaOAuth(
  clerkUserId: string,
): Promise<OAuthStats> {
  const token = await getClerkOAuthToken(clerkUserId, 'oauth_facebook');
  if (!token) throw new OAuthFetchError('FACEBOOK', 'No Facebook OAuth token in Clerk');

  // Get the first managed Page's followers
  const fields = 'name,fan_count,followers_count,picture.type(large)';

  let pagesData: { data?: Array<{ id: string; access_token: string }> };
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${token}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' },
    );
    pagesData = await res.json() as typeof pagesData;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new OAuthFetchError('FACEBOOK', 'Could not list pages', err);
  }

  const firstPage = pagesData.data?.[0];
  if (!firstPage) {
    throw new OAuthFetchError('FACEBOOK', 'No managed Facebook Pages found');
  }

  let pageData: FacebookPageStatsResponse;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${firstPage.id}?fields=${fields}&access_token=${firstPage.access_token}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' },
    );
    pageData = await res.json() as FacebookPageStatsResponse;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new OAuthFetchError('FACEBOOK', 'Could not fetch page stats', err);
  }

  if (pageData.error) {
    throw new OAuthFetchError('FACEBOOK', `${pageData.error.code}: ${pageData.error.message}`);
  }

  const followers = pageData.followers_count ?? pageData.fan_count;
  if (followers === undefined) {
    throw new OAuthFetchError('FACEBOOK', 'No follower data in response — check pages_read_engagement scope');
  }

  return {
    followers,
    avatarUrl:   pageData.picture?.data?.url,
    displayName: pageData.name,
  };
}

// ─── YouTube via Google OAuth ─────────────────────────────────────────────────
// Requires: https://www.googleapis.com/auth/youtube.readonly scope
// Must be added in Clerk Dashboard → Social Connections → Google → Scopes

interface YouTubeChannelOAuthResponse {
  items?: Array<{
    snippet?: {
      title?:       string;
      thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
    };
    statistics?: {
      subscriberCount?:     string;
      videoCount?:          string;
      hiddenSubscriberCount?: boolean;
    };
  }>;
  error?: { message: string; code: number };
}

export async function fetchYouTubeViaOAuth(
  clerkUserId: string,
): Promise<OAuthStats> {
  const token = await getClerkOAuthToken(clerkUserId, 'oauth_google');
  if (!token) throw new OAuthFetchError('YOUTUBE', 'No Google OAuth token in Clerk');

  let data: YouTubeChannelOAuthResponse;
  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet,statistics',
      {
        headers: { Authorization: `Bearer ${token}` },
        signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
        cache:   'no-store',
      },
    );
    data = await res.json() as YouTubeChannelOAuthResponse;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new OAuthFetchError('YOUTUBE', 'YouTube API request failed', err);
  }

  if (data.error) {
    throw new OAuthFetchError('YOUTUBE', `${data.error.code}: ${data.error.message}`);
  }

  const item = data.items?.[0];
  if (!item) throw new OAuthFetchError('YOUTUBE', 'No YouTube channel found for this Google account');

  const stats = item.statistics;
  if (stats?.hiddenSubscriberCount) {
    throw new OAuthFetchError('YOUTUBE', 'Subscriber count is hidden by the channel owner');
  }

  return {
    followers:   stats?.subscriberCount ? parseInt(stats.subscriberCount, 10) : 0,
    posts:       stats?.videoCount       ? parseInt(stats.videoCount, 10)       : undefined,
    avatarUrl:   item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url,
    displayName: item.snippet?.title,
  };
}
