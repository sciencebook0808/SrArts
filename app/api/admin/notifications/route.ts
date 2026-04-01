/**
 * app/api/admin/notifications/route.ts
 *
 * GET  — list all notifications (newest first)
 * POST — create a new notification
 *
 * FIX APPLIED (April 2026):
 *  UNGUARDED PRISMA CALLS: Both GET and POST handlers had bare prisma.* calls
 *  that could throw and produce an unhandled 500 with a raw error stack trace.
 *  All Prisma operations are now wrapped in try/catch with structured JSON errors.
 *  req.json() in POST is also guarded to prevent crashing on malformed payloads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk }          from '@/lib/admin-auth';
import prisma                         from '@/lib/db';

// GET /api/admin/notifications
export async function GET(req: NextRequest) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  try {
    const notifications = await prisma.siteNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error('[admin/notifications GET]', err);
    return NextResponse.json(
      { error: 'Failed to load notifications.' },
      { status: 500 },
    );
  }
}

// POST /api/admin/notifications
export async function POST(req: NextRequest) {
  const auth = await requireAdminClerk();
  if (!auth.authorized) return auth.response;

  let body: { message?: string; type?: string; isActive?: boolean };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const validTypes = ['info', 'warning', 'success', 'error'];
  const type = validTypes.includes(body.type ?? '') ? body.type! : 'info';

  try {
    const notification = await prisma.siteNotification.create({
      data: {
        message:  body.message.trim(),
        type,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ notification }, { status: 201 });
  } catch (err) {
    console.error('[admin/notifications POST]', err);
    return NextResponse.json(
      { error: 'Failed to create notification.' },
      { status: 500 },
    );
  }
}
