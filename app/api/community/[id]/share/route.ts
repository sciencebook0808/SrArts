/**
 * POST /api/community/[id]/share — increment the share counter.
 *
 * Intentionally open to anonymous visitors (sharing does not require an
 * account), but previously completely unbounded: anyone could loop this
 * endpoint and inflate a post's share count without limit. It is now rate
 * limited per client IP + post so the number stays meaningful.
 */
import { NextRequest, NextResponse } from 'next/server';
import { incrementShareCount } from '@/lib/db-server';
import { checkRateLimit, recordHit, type RateLimitRule } from '@/lib/rate-limiter';

type Params = { params: Promise<{ id: string }> };

const SHARE_RULES: RateLimitRule[] = [
  { windowMs:    60_000, limit:  5, label: 'minute' },
  { windowMs: 3_600_000, limit: 20, label: 'hour'   },
];

/** Best-effort client identity from proxy headers (Vercel sets x-forwarded-for). */
function clientKey(req: NextRequest, postId: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `${ip}:${postId}`;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  const key = clientKey(req, id);
  if (!checkRateLimit('community-share', key, SHARE_RULES).allowed) {
    // Report success to the client — the share itself worked, we simply refuse
    // to count it again. Surfacing a 429 here would only confuse the UI.
    return NextResponse.json({ success: true, counted: false });
  }

  try {
    await incrementShareCount(id);
    recordHit('community-share', key);
    return NextResponse.json({ success: true, counted: true });
  } catch {
    // Non-critical — fire and forget; never block the client
    return NextResponse.json({ success: false });
  }
}
