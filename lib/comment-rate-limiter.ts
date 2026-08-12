/**
 * lib/comment-rate-limiter.ts
 *
 * Comment-posting limits, expressed on top of the shared sliding-window
 * limiter in lib/rate-limiter.ts.
 *
 * LIMITS (matching Reddit/YouTube norms):
 *   • 5  comments per 60 seconds   per userId
 *   • 20 comments per 3600 seconds per userId
 *
 * The window/pruning mechanics used to live here in a comment-specific copy.
 * They now live in lib/rate-limiter.ts so other abusable endpoints (AI
 * generation, share counters) reuse the same implementation.
 */

import {
  checkRateLimit,
  recordHit,
  type RateLimitRule,
} from '@/lib/rate-limiter';

const BUCKET = 'comments';

const RULES: RateLimitRule[] = [
  { windowMs:    60_000, limit:  5, label: 'minute_limit' },
  { windowMs: 3_600_000, limit: 20, label: 'hour_limit'   },
];

export interface RateLimitResult {
  allowed:       boolean;
  reason?:       'minute_limit' | 'hour_limit';
  retryAfterMs?: number;
}

/**
 * Check whether `userId` is allowed to post a comment.
 * Call BEFORE creating the comment; call `recordComment` AFTER success.
 */
export function checkCommentRateLimit(userId: string): RateLimitResult {
  const result = checkRateLimit(BUCKET, userId, RULES);
  return {
    allowed:      result.allowed,
    reason:       result.reason as RateLimitResult['reason'],
    retryAfterMs: result.retryAfterMs,
  };
}

/**
 * Record a successful comment post. Must be called after the DB write succeeds.
 */
export function recordComment(userId: string): void {
  recordHit(BUCKET, userId);
}
