/**
 * app/api/admin/notifications/route.ts
 *
 * GET  — list all notifications (newest first)
 * POST — create a new notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk }          from '@/lib/admin-auth';
import prisma                         from '@/lib/db';

// GET /api/admin/notifications
export async function GET(req: NextRequest) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  const notifications = await prisma.siteNotification.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ notifications });
}

// POST /api/admin/notifications
export async function POST(req: NextRequest) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  const body = await req.json() as { message?: string; type?: string; isActive?: boolean };

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const validTypes = ['info', 'warning', 'success', 'error'];
  const type = validTypes.includes(body.type ?? '') ? body.type! : 'info';

  const notification = await prisma.siteNotification.create({
    data: {
      message:  body.message.trim(),
      type,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json({ notification }, { status: 201 });
}
