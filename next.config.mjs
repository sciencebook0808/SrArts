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

  // Prisma 7 is pure TypeScript (no Rust engine binary).
  // @prisma/client and @prisma/adapter-pg still need to be external
  // to avoid bundling their Node.js native bindings into the edge/browser bundles.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
};

export default nextConfig;
