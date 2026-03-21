/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'cdn.example.com' },
    ],
  },
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
