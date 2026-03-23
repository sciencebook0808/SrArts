/**
 * GET /api/link-preview?url=https://...
 *
 * Fetches OpenGraph + Twitter Card metadata for a URL server-side.
 * Returns { title, description, image, favicon, url, hostname } or { error }.
 *
 * CORS-safe: fetched server-side so no browser CORS issues.
 * Cached: 1 hour via Cache-Control header.
 */
import { NextRequest, NextResponse } from 'next/server';

interface LinkPreviewData {
  url:         string;
  hostname:    string;
  title:       string;
  description: string;
  image:       string | null;
  favicon:     string | null;
}

function extractMeta(html: string, property: string): string | null {
  // Try og: and twitter: and name= variants
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property.replace('og:', '').replace('twitter:', '')}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property.replace('og:', '').replace('twitter:', '')}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  const patterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) {
      const href = m[1].trim();
      if (href.startsWith('http')) return href;
      if (href.startsWith('//')) return `https:${href}`;
      const base = new URL(baseUrl);
      return `${base.origin}${href.startsWith('/') ? '' : '/'}${href}`;
    }
  }
  // Fallback to /favicon.ico
  try {
    return `${new URL(baseUrl).origin}/favicon.ico`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(raw);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return NextResponse.json({ error: 'Only http/https URLs allowed' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SRArtsBot/1.0; +https://sr-arts.com)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Fetch failed: ${res.status}` }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      // For non-HTML (image, PDF etc), return basic info
      return NextResponse.json({
        url:         targetUrl.toString(),
        hostname:    targetUrl.hostname,
        title:       targetUrl.hostname,
        description: '',
        image:       contentType.startsWith('image/') ? targetUrl.toString() : null,
        favicon:     null,
      });
    }

    // Read only first 200KB to avoid huge pages
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytesRead = 0;
    const MAX_BYTES = 200 * 1024;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        bytesRead += value.length;
        if (bytesRead >= MAX_BYTES) { reader.cancel(); break; }
      }
    }

    const html = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array(0))
    );

    const ogTitle       = extractMeta(html, 'og:title')       ?? extractMeta(html, 'twitter:title')   ?? extractTitle(html) ?? targetUrl.hostname;
    const ogDescription = extractMeta(html, 'og:description') ?? extractMeta(html, 'twitter:description') ?? extractMeta(html, 'description') ?? '';
    const ogImage       = extractMeta(html, 'og:image')       ?? extractMeta(html, 'twitter:image')    ?? null;
    const favicon       = extractFavicon(html, targetUrl.toString());

    const preview: LinkPreviewData = {
      url:         targetUrl.toString(),
      hostname:    targetUrl.hostname,
      title:       ogTitle.slice(0, 200),
      description: ogDescription.slice(0, 500),
      image:       ogImage,
      favicon,
    };

    return NextResponse.json(preview, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch preview' },
      { status: 502 }
    );
  }
}
