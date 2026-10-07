#!/usr/bin/env node

/**
 * Custom Next.js build runner for Sadza Connect.
 * Enforces strictly standard lowercase NODE_ENV='production' before Next.js starts,
 * preventing cloud host environment variable quirks (e.g. quotes, trailing spaces,
 * or non-standard casing) from triggering development fallback error prerenders.
 */

// 1. Force standard lowercase production
process.env.NODE_ENV = 'production';

const path = require('path');
const { spawnSync } = require('child_process');

// 2. Resolve next binary
const nextBin = path.resolve(__dirname, '../node_modules/.bin/next');

console.log('✨ [Sadza Build] Starting Next.js build with clean NODE_ENV=production...');

const result = spawnSync(nextBin, ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
