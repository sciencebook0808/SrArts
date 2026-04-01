/**
 * app/api/admin/notifications/[id]/route.ts
 *
 * PATCH  — toggle isActive or update message/type
 * DELETE — permanently remove a notification
 *
 * FIX APPLIED (April 2026):
 *  UNGUARDED PRISMA CALLS: Both PATCH and DELETE had bare prisma.siteNotification.*
 *  calls that could throw (e.g. record not found → Prisma P2025) and produce an
 *  unhandled 500 with a raw stack. All operations are now in try/catch with
 *  structured JSON error responses. req.json() in PATCH is also guarded.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk }          from '@/lib/admin-auth';
import prisma                         from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  let body: { message?: string; type?: string; isActive?: boolean };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validTypes = ['info', 'warning', 'success', 'error'];

  try {
    const notification = await prisma.siteNotification.update({
      where: { id },
      data: {
        ...(body.message  !== undefined && { message: body.message.trim() }),
        ...(body.type     !== undefined && validTypes.includes(body.type) && { type: body.type }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ notification });
  } catch (err) {
    console.error('[admin/notifications/[id] PATCH]', err);
    const isNotFound = err instanceof Error && err.message.includes('Record to update not found');
    return NextResponse.json(
      { error: isNotFound ? 'Notification not found.' : 'Failed to update notification.' },
      { status: isNotFound ? 404 : 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    await prisma.siteNotification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/notifications/[id] DELETE]', err);
    const isNotFound = err instanceof Error && err.message.includes('Record to delete does not exist');
    return NextResponse.json(
      { error: isNotFound ? 'Notification not found.' : 'Failed to delete notification.' },
      { status: isNotFound ? 404 : 500 },
    );
  }
}
