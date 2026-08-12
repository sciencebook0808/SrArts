/**
 * lib/rate-limiter.ts
 *
 * Generic server-side in-memory sliding-window rate limiter.
 *
 * Extracted from lib/comment-rate-limiter.ts so the same logic can guard any
 * expensive or abusable endpoint (AI generation, share counters, …) instead of
 * being duplicated per route.
 *
 * NOTES:
 *   • Works in Next.js App Router route handlers (Node.js runtime)
 *   • Resets on server restart, and is per-instance — this is a cost/abuse
 *     speed bump, not a hard security boundary. For multi-instance production
 *     replace the store with Redis (Upstash) behind the same interface.
 *   • Memory-safe: expired buckets are pruned on a timer.
 */

export interface RateLimitRule {
  /** Sliding window size in milliseconds */
  windowMs: number;
  /** Maximum allowed events inside the window */
  limit: number;
  /** Short label surfaced in the result, e.g. "minute" */
  label: string;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Which rule tripped (its `label`), when not allowed */
  reason?: string;
  /** How long the caller should wait before retrying */
  retryAfterMs?: number;
}

/** bucket name → key → event timestamps (epoch ms) */
const stores = new Map<string, Map<string, number[]>>();

function getStore(bucket: string): Map<string, number[]> {
  let store = stores.get(bucket);
  if (!store) {
    store = new Map<string, number[]>();
    stores.set(bucket, store);
  }
  return store;
}

/**
 * Check whether `key` may perform an action in `bucket`.
 * Call BEFORE doing the work; call `recordHit` AFTER it succeeds.
 */
export function checkRateLimit(
  bucket: string,
  key: string,
  rules: RateLimitRule[],
): RateLimitResult {
  const store = getStore(bucket);
  const stamps = store.get(key) ?? [];
  const now = Date.now();

  for (const rule of rules) {
    const cutoff = now - rule.windowMs;
    const recent = stamps.filter(t => t > cutoff);
    if (recent.length >= rule.limit) {
      // Oldest event in the window decides when a slot frees up.
      const oldest = Math.min(...recent);
      return {
        allowed: false,
        reason: rule.label,
        retryAfterMs: Math.max(0, oldest + rule.windowMs - now),
      };
    }
  }

  return { allowed: true };
}

/** Record a successful action. Must be called after the work succeeds. */
export function recordHit(bucket: string, key: string): void {
  const store = getStore(bucket);
  const stamps = store.get(key) ?? [];
  stamps.push(Date.now());
  store.set(key, stamps);
}

/** Drop timestamps older than `maxWindowMs` across every bucket. */
function pruneAll(): void {
  const now = Date.now();
  // 1 hour covers the longest window any caller currently uses; anything older
  // can never affect a decision.
  const cutoff = now - 3_600_000;
  for (const [bucket, store] of stores) {
    for (const [key, stamps] of store) {
      const kept = stamps.filter(t => t > cutoff);
      if (kept.length === 0) store.delete(key);
      else store.set(key, kept);
    }
    if (store.size === 0) stores.delete(bucket);
  }
}

if (typeof setInterval !== 'undefined') {
  // `unref` so the timer never keeps a serverless invocation alive.
  const timer = setInterval(pruneAll, 600_000);
  (timer as unknown as { unref?: () => void }).unref?.();
}
