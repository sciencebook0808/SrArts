/**
 * app/api/comments/[id]/replies/route.ts
 *
 * GET → Load all replies for a parent comment (lazy-loaded on "View replies" click)
 *
 * Only returns non-deleted replies. Ordered oldest-first (YouTube style).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReplies }                from '@/lib/db-server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const replies = await getReplies(id);
    return NextResponse.json({ replies }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    });
  } catch (err: unknown) {
    console.error('[api/comments/[id]/replies]', err);
    return NextResponse.json(
      { error: 'Failed to load replies.' },
      { status: 500 },
    );
  }
}
