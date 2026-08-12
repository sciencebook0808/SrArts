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
    /**
     * CSP origin groups.
     *
     * FIX: the previous policy listed only Clerk + Vercel Analytics in
     * `script-src`, but app/layout.tsx injects Google Analytics / Google Ads
     * (googletagmanager.com), the Meta Pixel (connect.facebook.net) and
     * AdSense (pagead2.googlesyndication.com). Every one of those was blocked
     * by CSP the moment its env var was set — analytics silently collected
     * nothing and the browser console filled with CSP violations. The same
     * gap existed in `connect-src` (beacon endpoints) and `img-src`
     * (tracking pixels), and `frame-src` was missing Clerk, which breaks
     * Clerk's hosted auth flows.
     *
     * Groups are declared once and reused so the directives cannot drift apart.
     */
    const CLERK = [
      // Custom Clerk frontend-API domain for this deployment. Kept as the
      // default so an existing production deploy is not broken; override with
      // NEXT_PUBLIC_CLERK_FRONTEND_API when the domain changes.
      process.env.NEXT_PUBLIC_CLERK_FRONTEND_API ?? 'https://clerk.srarts.qzz.io',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com',
      'https://challenges.cloudflare.com', // Clerk bot-protection widget
    ].filter(Boolean);

    const GOOGLE_TAG = [
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
    ];

    const ADSENSE = [
      'https://pagead2.googlesyndication.com',
      'https://*.googlesyndication.com',
      'https://*.doubleclick.net',
      'https://googleads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ];

    const META_PIXEL = ['https://connect.facebook.net', 'https://www.facebook.com'];

    const IMAGE_HOSTS = [
      'https://res.cloudinary.com',
      'https://img.clerk.com',
      'https://images.clerk.dev',
      'https://www.gravatar.com',
    ];

    const cspDirectives = [
      "default-src 'self'",

      // Scripts: self + Clerk + Vercel Analytics + GA/Ads + Meta Pixel + AdSense
      [
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        'https://va.vercel-scripts.com',
        ...CLERK, ...GOOGLE_TAG, ...META_PIXEL, ...ADSENSE,
      ].join(' '),

      // Some browsers honour script-src-elem separately; keep it in sync.
      [
        "script-src-elem 'self' 'unsafe-inline'",
        'https://va.vercel-scripts.com',
        ...CLERK, ...GOOGLE_TAG, ...META_PIXEL, ...ADSENSE,
      ].join(' '),

      // Styles: self + inline (Tailwind/next-themes needs it) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

      // Images: self + data/blob + CDNs + analytics tracking pixels
      [
        "img-src 'self' data: blob:",
        ...IMAGE_HOSTS, ...GOOGLE_TAG, ...META_PIXEL, ...ADSENSE,
      ].join(' '),

      // Fonts: self + data (next/font inlines via data URIs)
      "font-src 'self' data: https://fonts.gstatic.com",

      // Fetch/XHR/beacon: self + Cloudinary uploads + Clerk API + analytics
      [
        "connect-src 'self'",
        'https://api.cloudinary.com',
        'https://va.vercel-scripts.com',
        'https://vitals.vercel-insights.com',
        'https://generativelanguage.googleapis.com',
        ...CLERK,
        'wss://*.clerk.accounts.dev',
        ...GOOGLE_TAG, ...META_PIXEL, ...ADSENSE,
      ].join(' '),

      // Frames: YouTube embeds in rich content + Clerk auth + AdSense iframes
      [
        "frame-src 'self'",
        'https://www.youtube-nocookie.com',
        'https://www.youtube.com',
        ...CLERK, ...ADSENSE,
      ].join(' '),

      // Workers: Clerk and some analytics scripts spawn blob workers
      "worker-src 'self' blob:",

      // Objects: none
      "object-src 'none'",
      // Base URI: self only (prevents base-tag injection attacks)
      "base-uri 'self'",
      // Form submissions: self only
      "form-action 'self'",
      // Nobody may frame us (pairs with X-Frame-Options for old browsers)
      "frame-ancestors 'self'",
      // Upgrade insecure requests in production
      'upgrade-insecure-requests',
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
