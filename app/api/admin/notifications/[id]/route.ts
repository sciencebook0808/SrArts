/**
 * app/api/admin/notifications/[id]/route.ts
 *
 * PATCH  — toggle isActive or update message/type
 * DELETE — permanently remove a notification
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
  const body = await req.json() as { message?: string; type?: string; isActive?: boolean };

  const validTypes = ['info', 'warning', 'success', 'error'];

  const notification = await prisma.siteNotification.update({
    where: { id },
    data: {
      ...(body.message  !== undefined && { message: body.message.trim() }),
      ...(body.type     !== undefined && validTypes.includes(body.type) && { type: body.type }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json({ notification });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  await prisma.siteNotification.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
