/**
 * app/api/notifications/route.ts
 *
 * GET — returns the single most-recent active notification (or null).
 * Called client-side by NotificationBanner on mount.
 * No auth required — public endpoint.
 * Cached for 60 s at the CDN level so it doesn't hammer the DB on every pageview.
 *
 * FIX APPLIED (April 2026):
 *  UNGUARDED PUBLIC PRISMA CALL: The bare prisma.siteNotification.findFirst() could
 *  crash with an unhandled exception if the DB is temporarily unavailable, returning
 *  an ugly 500 with a raw stack trace to unauthenticated clients. The call is now
 *  wrapped in try/catch; on DB error the endpoint returns null (no banner) so the
 *  page still renders normally rather than showing an error.
 */

import { NextResponse } from 'next/server';
import prisma           from '@/lib/db';

export const revalidate = 60; // ISR-style: re-check every 60 seconds

export async function GET() {
  try {
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
  } catch (err) {
    console.error('[api/notifications GET]', err);
    // Return null gracefully — the banner simply won't show; the page still renders.
    return NextResponse.json(
      { notification: null },
      {
        headers: {
          // Short cache on errors — retry soon, but don't hammer a broken DB
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      },
    );
  }
}
