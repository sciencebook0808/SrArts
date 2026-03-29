/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Compression (Brotli + gzip) — critical for LCP, reduces payload 60-80% ─
  compress: true,

  // ─── Image optimisation ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.clerk.com',      pathname: '/**' },
      { protocol: 'https', hostname: 'images.clerk.dev',   pathname: '/**' },
      { protocol: 'https', hostname: 'www.gravatar.com',   pathname: '/**' },
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
    // 30-day cache for artwork images (Cloudinary CDN handles freshness)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // AVIF first for 50% smaller files, WebP as fallback
    formats: ['image/avif', 'image/webp'],
    // Responsive breakpoints — prevents over-large images on small screens
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
    // Dangerously allow SVG (needed for icon.svg in remotePatterns)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ─── Server-only packages — MUST NOT be bundled into client/edge ─────────
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
  ],

  // ─── Security + Performance headers ────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',           value: 'on' },
          { key: 'X-Content-Type-Options',            value: 'nosniff' },
          { key: 'X-Frame-Options',                   value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',                   value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',                value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Static assets — aggressive long-term caching (Vercel hashes filenames)
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Optimised images — 30-day cache
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // Public static files
        source: '/favicon(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Content-Type',  value: 'application/manifest+json' },
        ],
      },
      {
        source: '/admin/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Robots-Tag',  value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },

  // ─── Redirects — canonical domain enforcement ──────────────────────────────
  async redirects() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    const hostname = siteUrl ? new URL(siteUrl).hostname : '';
    // If canonical is srarts.qzz.io, redirect from sr-arts.com and vice versa
    if (!hostname) return [];
    return [];
  },
};

export default nextConfig;
