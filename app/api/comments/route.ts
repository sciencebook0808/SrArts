/**
 * app/api/comments/route.ts
 *
 * GET  → Threaded, paginated comments   — public
 * POST → Create top-level comment or reply — requires Clerk auth
 *
 * SECURITY:
 *   • Rate limiting: 5/min, 20/hr per userId (in-memory sliding window)
 *   • Input sanitization: HTML stripped server-side (XSS prevention)
 *   • Auth: Clerk userId verified before any write
 *   • parentId ownership: parent must belong to same targetId/targetType
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser }         from '@clerk/nextjs/server';
import {
  getThreadedComments,
  createComment,
}                                    from '@/lib/db-server';
import {
  checkCommentRateLimit,
  recordComment,
}                                    from '@/lib/comment-rate-limiter';
import {
  sanitizeComment,
  validateComment,
}                                    from '@/lib/comment-sanitizer';
import prisma                        from '@/lib/db';

const VALID_TYPES = ['artwork', 'blog', 'community'] as const;
type TargetType   = typeof VALID_TYPES[number];

// ─── GET — paginated threaded comments ───────────────────────────────────────

export async function GET(request: NextRequest) {
  const sp         = new URL(request.url).searchParams;
  const targetId   = sp.get('targetId')   ?? '';
  const targetType = sp.get('targetType') ?? '';
  const cursor     = sp.get('cursor')     ?? undefined;
  const take       = Math.min(parseInt(sp.get('take') ?? '20', 10), 50);

  if (!targetId || !VALID_TYPES.includes(targetType as TargetType)) {
    return NextResponse.json(
      { error: 'targetId and valid targetType required' },
      { status: 400 },
    );
  }

  const page = await getThreadedComments(
    targetId,
    targetType as TargetType,
    cursor,
    take,
  );

  return NextResponse.json(page, {
    headers: {
      // Stale-while-revalidate: allow brief caching for public reads
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    },
  });
}

// ─── POST — create comment or reply ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to comment', authRequired: true },
      { status: 401 },
    );
  }

  // ── Rate limit ─────────────────────────────────────────────────────────
  const rl = checkCommentRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: rl.reason === 'minute_limit'
          ? 'Slow down! You can post 5 comments per minute.'
          : 'Hourly limit reached. Try again in a bit.',
        retryAfterMs: rl.retryAfterMs,
      },
      {
        status:  429,
        headers: {
          'Retry-After': String(Math.ceil((rl.retryAfterMs ?? 60000) / 1000)),
        },
      },
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────
  let body: {
    targetId?:        string;
    targetType?:      string;
    message?:         string;
    parentId?:        string | null;
    replyToUserId?:   string | null;
    replyToUsername?: string | null;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { targetId, targetType, parentId, replyToUserId, replyToUsername } = body;

  // ── Validate target ────────────────────────────────────────────────────
  if (!targetId || !VALID_TYPES.includes(targetType as TargetType)) {
    return NextResponse.json(
      { error: 'targetId and valid targetType required' },
      { status: 400 },
    );
  }

  // ── Sanitize + validate message ────────────────────────────────────────
  const sanitized = sanitizeComment(body.message ?? '');
  const msgError  = validateComment(sanitized);
  if (msgError) {
    return NextResponse.json({ error: msgError }, { status: 422 });
  }

  // ── Validate parentId (must exist and belong to same target) ──────────
  if (parentId) {
    try {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent comment not found.' },
          { status: 404 },
        );
      }
      if (parent.targetId !== targetId || parent.targetType !== targetType) {
        return NextResponse.json(
          { error: 'Parent comment belongs to a different target.' },
          { status: 400 },
        );
      }
      if (parent.isDeleted) {
        return NextResponse.json(
          { error: 'Cannot reply to a deleted comment.' },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Could not verify parent comment.' },
        { status: 500 },
      );
    }
  }

  // ── Fetch Clerk user ───────────────────────────────────────────────────
  const user     = await currentUser();
  const username = user?.fullName
    ?? user?.username
    ?? user?.emailAddresses[0]?.emailAddress
    ?? 'Anonymous';

  // ── Create ─────────────────────────────────────────────────────────────
  try {
    const comment = await createComment({
      targetId,
      targetType:      targetType as TargetType,
      userId,
      username,
      userImage:       user?.imageUrl ?? undefined,
      message:         sanitized,
      parentId:        parentId ?? null,
      replyToUserId:   replyToUserId   ?? null,
      replyToUsername: replyToUsername ?? null,
    });

    // Record rate-limit usage AFTER successful DB write
    recordComment(userId);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create comment. Please try again.' },
      { status: 500 },
    );
  }
}
