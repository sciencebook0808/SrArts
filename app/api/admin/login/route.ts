import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { password?: string };
    const password = body.password ?? '';

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
