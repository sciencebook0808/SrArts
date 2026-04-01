import { NextRequest, NextResponse } from 'next/server';
import { getProfile, upsertProfile } from '@/lib/db-server';
import type { ProfileInput } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  try {
    const body = await request.json() as ProfileInput;
    const profile = await upsertProfile(body);
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    console.error('[api/profile]', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
