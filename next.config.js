/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    // 添加对本地图片的支持
    domains: ['localhost'],
    // 禁用图片优化以解决 400 错误
    unoptimized: true,
  },
  // Ensure static assets are properly served
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Add trailing slash for better compatibility
  trailingSlash: false,
  // Ensure public folder is properly handled
  publicRuntimeConfig: {
    // Add any runtime config here if needed
  },
}

module.exports = nextConfig