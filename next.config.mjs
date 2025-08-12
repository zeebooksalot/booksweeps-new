/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.svg',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Netlify compatibility
  trailingSlash: false,
  output: 'standalone',
}

export default nextConfig
