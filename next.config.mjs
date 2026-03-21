/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image domains ──────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        pathname: '/**',
      },
    ],
    // Next.js 16 changed minimumCacheTTL default to 4 hours.
    // Keep 60s so artwork image updates are visible quickly.
    minimumCacheTTL: 60,
  },

  // ── External packages ──────────────────────────────────────────────────────
  // In Next.js 15+ this is TOP-LEVEL — no longer under `experimental`.
  // node-appwrite uses Node.js native modules so it must not be bundled.
  serverExternalPackages: ['node-appwrite'],
};

export default nextConfig;
