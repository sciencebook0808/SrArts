import { NextRequest, NextResponse } from 'next/server';
import { getCommissions, createCommission } from '@/lib/appwrite-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET() {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const commissions = await getCommissions();
  return NextResponse.json({ commissions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const commission = await createCommission(body);
    return NextResponse.json({ commission }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit commission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
