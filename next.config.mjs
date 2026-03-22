/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — artwork and post images
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Clerk — user profile photos (primary CDN)
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      // Clerk — legacy image CDN
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
      // Gravatar / uploaded avatars (Clerk sometimes proxies these)
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
  },

  // Server-only packages — must not be bundled into client/edge bundles.
  // Prisma 7 + adapter-pg use Node.js native bindings.
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
  ],
};

export default nextConfig;
