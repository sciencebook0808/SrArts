/**
 * lib/comment-rate-limiter.ts
 *
 * Server-side in-memory sliding-window rate limiter for comment posting.
 *
 * LIMITS (matching Reddit/YouTube norms):
 *   • 5  comments per 60 seconds  per userId
 *   • 20 comments per 3600 seconds per userId
 *
 * NOTES:
 *   • Works in Next.js App Router API routes (Node.js runtime)
 *   • Resets on server restart — acceptable; not a hard security boundary
 *   • For multi-instance production: replace with Redis (Upstash recommended)
 *   • Memory-safe: entries auto-expire after the longer window
 */

interface RateWindow {
  timestamps: number[];  // epoch ms of each comment attempt
}

// Separate stores for minute and hour windows
const minuteStore = new Map<string, RateWindow>();
const hourStore   = new Map<string, RateWindow>();

const MINUTE_MS    = 60_000;
const HOUR_MS      = 3_600_000;
const MINUTE_LIMIT = 5;
const HOUR_LIMIT   = 20;

function prune(store: Map<string, RateWindow>, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

function countInWindow(store: Map<string, RateWindow>, userId: string, windowMs: number): number {
  const cutoff = Date.now() - windowMs;
  const entry  = store.get(userId);
  if (!entry) return 0;
  return entry.timestamps.filter(t => t > cutoff).length;
}

function record(store: Map<string, RateWindow>, userId: string): void {
  const entry = store.get(userId) ?? { timestamps: [] };
  entry.timestamps.push(Date.now());
  store.set(userId, entry);
}

// Prune every 10 minutes to prevent unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    prune(minuteStore, MINUTE_MS);
    prune(hourStore, HOUR_MS);
  }, 600_000);
}

export interface RateLimitResult {
  allowed:      boolean;
  reason?:      'minute_limit' | 'hour_limit';
  retryAfterMs?: number;
}

/**
 * Check whether `userId` is allowed to post a comment.
 * Call BEFORE creating the comment; call `recordComment` AFTER success.
 */
export function checkCommentRateLimit(userId: string): RateLimitResult {
  const minuteCount = countInWindow(minuteStore, userId, MINUTE_MS);
  if (minuteCount >= MINUTE_LIMIT) {
    return {
      allowed:      false,
      reason:       'minute_limit',
      retryAfterMs: MINUTE_MS,
    };
  }

  const hourCount = countInWindow(hourStore, userId, HOUR_MS);
  if (hourCount >= HOUR_LIMIT) {
    return {
      allowed:      false,
      reason:       'hour_limit',
      retryAfterMs: HOUR_MS,
    };
  }

  return { allowed: true };
}

/**
 * Record a successful comment post. Must be called after the DB write succeeds.
 */
export function recordComment(userId: string): void {
  record(minuteStore, userId);
  record(hourStore, userId);
}
