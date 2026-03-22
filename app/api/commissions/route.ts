import { NextRequest, NextResponse } from 'next/server';
import { getCommissions, createCommission } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET() {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const commissions = await getCommissions();
  return NextResponse.json({ commissions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      userName: string; userEmail: string; userPhone?: string;
      projectTitle?: string; description?: string;
      style?: string; budget?: string; timeline?: string;
    };
    const commission = await createCommission(body);
    return NextResponse.json({ commission }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
