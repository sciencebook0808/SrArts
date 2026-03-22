import { NextRequest, NextResponse } from 'next/server';
import { getProfile, upsertProfile } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json() as Parameters<typeof upsertProfile>[0];
    const profile = await upsertProfile(body);
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
