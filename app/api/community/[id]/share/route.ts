/**
 * POST /api/community/[id]/share — increment share count (no auth required)
 */
import { NextRequest, NextResponse } from 'next/server';
import { incrementShareCount } from '@/lib/db-server';

type Params = { params: Promise<{ id: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await incrementShareCount(id);
    return NextResponse.json({ success: true });
  } catch {
    // Non-critical — silently ignore
    return NextResponse.json({ success: false });
  }
}
