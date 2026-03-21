import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';

export async function POST() {
  // clearAdminSession uses `await cookies()` internally — Next.js 16 safe
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
