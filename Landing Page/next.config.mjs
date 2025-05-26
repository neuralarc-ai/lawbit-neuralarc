/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: ['localhost:3000'],
      },
    },
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
    },
    reactStrictMode: process.env.NODE_ENV !== 'production',
  }
  
  export default nextConfig;
  