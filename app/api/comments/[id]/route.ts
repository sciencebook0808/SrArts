/**
 * app/api/comments/[id]/route.ts
 *
 * PATCH  → Edit own comment          — requires Clerk auth + ownership
 * DELETE → Soft-delete own comment   — requires Clerk auth + ownership
 *          Hard-delete any comment   — requires admin role
 *
 * FIX APPLIED (April 2026):
 *  LOGIC BUG — HARDCODED ERROR STATUS: The PATCH catch block used:
 *    const msg = 'Failed to process comment.';           // hardcoded string
 *    const status = msg.startsWith('Forbidden') ? 403   // never true
 *                 : msg.includes('not found')   ? 404   // never true
 *                 : 500;                                 // always 500
 *  The err was caught but never used, so all editComment() errors (including
 *  "Forbidden" and "not found") always returned 500 instead of 403/404.
 *  Fix: extract the message from the thrown Error and use it for status routing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient }         from '@clerk/nextjs/server';
import {
  editComment,
  deleteOwnComment,
  deleteComment,
}                                    from '@/lib/db-server';
import {
  sanitizeComment,
  validateComment,
}                                    from '@/lib/comment-sanitizer';
import prisma                        from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

const ADMIN_ROLES = ['admin', 'superadmin'];

async function isAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user   = await client.users.getUser(userId);
    const role   = (user.publicMetadata as { role?: string })?.role ?? '';
    return ADMIN_ROLES.includes(role);
  } catch {
    return false;
  }
}

// ─── PATCH — edit own comment ────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;

  let body: { message?: string };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const sanitized = sanitizeComment(body.message ?? '');
  const msgError  = validateComment(sanitized);
  if (msgError) {
    return NextResponse.json({ error: msgError }, { status: 422 });
  }

  try {
    const updated = await editComment(id, userId, sanitized);
    return NextResponse.json({ comment: updated });
  } catch (err) {
    // FIX: use the actual thrown error message for status routing
    const msg    = err instanceof Error ? err.message : 'Failed to process comment.';
    const status = msg.startsWith('Forbidden') ? 403
                 : msg.toLowerCase().includes('not found') ? 404
                 : 500;
    // Never expose raw internal error details to the client
    const clientMsg = status === 403 ? 'Forbidden: you can only edit your own comments.'
                    : status === 404 ? 'Comment not found.'
                    : 'Failed to process comment.';
    return NextResponse.json({ error: clientMsg }, { status });
  }
}

// ─── DELETE — owner soft-delete OR admin hard-delete ─────────────────────────

export async function DELETE(request: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;

  // Look up the comment to check ownership
  let comment: { userId: string } | null;
  try {
    comment = await prisma.comment.findUnique({
      where:  { id },
      select: { userId: true },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to look up comment.' }, { status: 500 });
  }

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  const isOwner = comment.userId === userId;

  // Check admin role if not owner
  if (!isOwner) {
    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: you can only delete your own comments.' },
        { status: 403 },
      );
    }
    // Admin hard-delete
    try {
      await deleteComment(id);
      return NextResponse.json({ success: true, method: 'hard_delete' });
    } catch (err) {
      console.error('[api/comments/[id] DELETE admin]', err);
      return NextResponse.json(
        { error: 'Failed to process comment.' },
        { status: 500 },
      );
    }
  }

  // Owner soft-delete
  try {
    await deleteOwnComment(id, userId);
    return NextResponse.json({ success: true, method: 'soft_delete' });
  } catch (err) {
    const msg    = err instanceof Error ? err.message : 'Failed to process comment.';
    const status = msg.startsWith('Forbidden') ? 403 : 500;
    const clientMsg = status === 403 ? 'Forbidden: you can only delete your own comments.'
                    : 'Failed to process comment.';
    return NextResponse.json({ error: clientMsg }, { status });
  }
}
