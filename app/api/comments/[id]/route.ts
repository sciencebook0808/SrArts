/**
 * app/api/comments/[id]/route.ts
 *
 * PATCH  → Edit own comment          — requires Clerk auth + ownership
 * DELETE → Soft-delete own comment   — requires Clerk auth + ownership
 *          Hard-delete any comment   — requires admin role
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
    const msg = err instanceof Error ? err.message : 'Failed';
    const status = msg.startsWith('Forbidden') ? 403
                 : msg.includes('not found')   ? 404
                 : 500;
    return NextResponse.json({ error: msg }, { status });
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
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed' },
        { status: 500 },
      );
    }
  }

  // Owner soft-delete
  try {
    await deleteOwnComment(id, userId);
    return NextResponse.json({ success: true, method: 'soft_delete' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
