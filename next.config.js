const path = require('path');

// Ensure NODE_ENV is strictly standard lowercase 'production', 'development', or 'test'
if (process.env.NODE_ENV) {
  const rawEnv = process.env.NODE_ENV.trim().toLowerCase().replace(/['"]/g, '');
  if (rawEnv === 'prod' || rawEnv === 'production') {
    process.env.NODE_ENV = 'production';
  } else if (rawEnv === 'dev' || rawEnv === 'development') {
    process.env.NODE_ENV = 'development';
  } else if (rawEnv === 'test') {
    process.env.NODE_ENV = 'test';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['knex', 'pg', 'pino', 'pino-pretty'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    config.resolve.extensions = Array.from(
      new Set(['.ts', '.tsx', '.js', '.jsx', '.json', ...(config.resolve.extensions || [])])
    );
    return config;
  },
};

module.exports = nextConfig;
