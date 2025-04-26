/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure module resolution to match jsconfig.json
  experimental: {
    esmExternals: 'loose', // Required to make certain dependencies work properly
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Path rewriting for improved module resolution
  async rewrites() {
    return [];
  },
  // Environment variables that will be available at build time
  env: {
    APP_NAME: 'MeshOS',
    APP_VERSION: '0.1.0',
  },
  // Enable image optimization
  images: {
    domains: ['placeholder.com'], // Add any image domains you need
  },
  // Custom webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
}

module.exports = nextConfig