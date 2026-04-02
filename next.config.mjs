/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Compression (Brotli + gzip) ─────────────────────────────────────────
  compress: true,

  // ─── Image optimisation ───────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com',  pathname: '/**' },
      { protocol: 'https', hostname: 'img.clerk.com',       pathname: '/**' },
      { protocol: 'https', hostname: 'images.clerk.dev',    pathname: '/**' },
      { protocol: 'https', hostname: 'www.gravatar.com',    pathname: '/**' },
      // ⛔ Wildcard '**' removed — it turned the image optimizer into an open proxy.
      //    Add specific trusted hostnames above as needed.
    ],
    minimumCacheTTL:    60 * 60 * 24 * 30,
    formats:            ['image/avif', 'image/webp'],
    deviceSizes:        [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes:         [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ─── Server-only packages ─────────────────────────────────────────────────
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
  ],

  // ─── Security + Performance headers ──────────────────────────────────────
  async headers() {
    // Build CSP — Clerk needs multiple origins for auth iframes / API calls
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self + Clerk (auth) + Vercel Analytics
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.srarts.qzz.io https://*.clerk.accounts.dev https://va.vercel-scripts.com",
      // Styles: self + inline (Tailwind/next-themes needs it)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Images: self + data URIs + Cloudinary + Clerk avatars + Gravatar
      "img-src 'self' data: blob: https://res.cloudinary.com https://img.clerk.com https://images.clerk.dev https://www.gravatar.com",
      // Fonts: self + data (next/font inlines via data URIs)
      "font-src 'self' data: https://fonts.gstatic.com",
      // Fetch/XHR: self + Cloudinary uploads + Clerk API
      "connect-src 'self' https://api.cloudinary.com https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://va.vercel-scripts.com https://generativelanguage.googleapis.com",
      // Frames: none (no iframes needed)
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
      // Objects: none
      "object-src 'none'",
      // Base URI: self only (prevents base-tag injection attacks)
      "base-uri 'self'",
      // Form submissions: self only
      "form-action 'self'",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',            value: 'on' },
          { key: 'X-Content-Type-Options',             value: 'nosniff' },
          { key: 'X-Frame-Options',                    value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',                    value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',                 value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // HSTS: 2 years, include subdomains, submit to preload list
          { key: 'Strict-Transport-Security',          value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy',            value: cspDirectives },
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
        // Admin routes: never cache, never index
        source: '/admin/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Robots-Tag',  value: 'noindex, nofollow' },
        ],
      },
      {
        // API routes: never cache by default (individual routes may override)
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [];
  },
};

export default nextConfig;
