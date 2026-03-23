/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image optimisation ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Cloudinary — artwork, post and profile images
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      // Clerk — user profile photos (primary CDN)
      { protocol: 'https', hostname: 'img.clerk.com',      pathname: '/**' },
      // Clerk — legacy CDN
      { protocol: 'https', hostname: 'images.clerk.dev',   pathname: '/**' },
      // Gravatar (Clerk sometimes proxies avatars)
      { protocol: 'https', hostname: 'www.gravatar.com',   pathname: '/**' },
      // OG / link-preview images — allow any HTTPS host
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
    // Cache optimised images for 60 s minimum — Cloudinary CDN handles the rest
    minimumCacheTTL: 60,
    // Enable modern formats for 20–40% smaller payload
    formats: ['image/avif', 'image/webp'],
  },

  // ─── Server-only packages ─────────────────────────────────────────────────
  // Prisma 7 + adapter-pg use Node.js native bindings.
  // These MUST NOT be bundled into client or edge bundles.
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
  ],

  // ─── Tree-shaking for heavy icon / component libraries ────────────────────
  // Next.js 16 uses this to avoid importing entire packages when only a few
  // exports are used — cuts client bundle size significantly for lucide-react.
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-tooltip',
    'framer-motion',
    '@clerk/nextjs',
  ],

  // ─── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Admin routes — never cache, never index
        source: '/admin/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        // API routes — no caching by default (individual routes opt-in)
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
