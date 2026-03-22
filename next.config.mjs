/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
  },

  // Server-only packages that must not be bundled into client/edge bundles.
  // Prisma 7 + adapter-pg use Node.js native bindings.
  // @clerk/nextjs server-side code also needs to stay server-only.
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
  ],
};

export default nextConfig;
