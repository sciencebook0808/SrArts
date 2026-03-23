import { NextRequest, NextResponse } from 'next/server';
import { requireAdminClerk } from '@/lib/admin-auth';

const BASE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? '';

export async function POST(request: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  let urls: string[] = [];
  try {
    const body = await request.json() as { urls?: string[] };
    urls = Array.isArray(body.urls) ? body.urls : [];
  } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (urls.length === 0) urls = [`${BASE_URL}/sitemap.xml`];
  const results: Record<string, string> = {};
  // 1. IndexNow — covers Bing, Yandex, DuckDuckGo, Seznam in one call
  if (INDEXNOW_KEY) {
    try {
      const r = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: new URL(BASE_URL).hostname, key: INDEXNOW_KEY, keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls.filter(u => u.startsWith('http')) }),
      });
      results.indexNow = r.ok ? `OK (${r.status})` : `Failed (${r.status})`;
    } catch (e) { results.indexNow = `Error: ${String(e)}`; }
  } else { results.indexNow = 'Skipped (INDEXNOW_KEY not set)'; }
  // 2. Google sitemap ping
  try {
    const r = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
    results.google = r.ok ? `OK (${r.status})` : `Failed (${r.status})`;
  } catch (e) { results.google = `Error: ${String(e)}`; }
  // 3. Bing sitemap ping
  try {
    const r = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
    results.bing = r.ok ? `OK (${r.status})` : `Failed (${r.status})`;
  } catch (e) { results.bing = `Error: ${String(e)}`; }
  return NextResponse.json({ success: true, urlsSubmitted: urls.length, results });
}
