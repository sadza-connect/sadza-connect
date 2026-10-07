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
  experimental: {
    serverComponentsExternalPackages: ['knex', 'pg', 'pino', 'pino-pretty'],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
};

module.exports = nextConfig;
