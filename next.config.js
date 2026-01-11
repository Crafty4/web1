/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simple configuration for beginners
  reactStrictMode: true,
  // Allow images from public folder and external sources if needed
  images: {
    unoptimized: false, // Enable image optimization
    remotePatterns: [], // Can add remote image patterns here if needed
  },
}

module.exports = nextConfig
