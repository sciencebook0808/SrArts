/**
 * app/api/notifications/route.ts
 *
 * GET — returns the single most-recent active notification (or null).
 * Called client-side by NotificationBanner on mount.
 * No auth required — public endpoint.
 * Cached for 60 s at the CDN level so it doesn't hammer the DB on every pageview.
 */

import { NextResponse } from 'next/server';
import prisma           from '@/lib/db';

export const revalidate = 60; // ISR-style: re-check every 60 seconds

export async function GET() {
  const notification = await prisma.siteNotification.findFirst({
    where:   { isActive: true },
    orderBy: { createdAt: 'desc' },
    select:  { id: true, message: true, type: true, createdAt: true },
  });

  return NextResponse.json(
    { notification: notification ?? null },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    },
  );
}
