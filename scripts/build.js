#!/usr/bin/env node

/**
 * Custom Next.js build runner for Sadza Connect.
 * - Ensures build dependencies (like tailwindcss, postcss, autoprefixer) are present
 *   even if a cloud host cached node_modules with NODE_ENV=production.
 * - Enforces strictly standard lowercase NODE_ENV='production' before Next.js starts.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

// 1. Self-heal node_modules if tailwindcss was omitted by a cached production-only install
try {
  require.resolve('tailwindcss', { paths: [rootDir] });
} catch {
  console.log('📦 [Sadza Build] Installing missing build dependencies (tailwindcss/postcss)...');
  const installRes = spawnSync('npm', ['install', '--include=dev', '--no-audit', '--no-fund'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
    shell: process.platform === 'win32',
  });
  if (installRes.status !== 0) {
    process.exit(installRes.status || 1);
  }
}

// 2. Force standard lowercase production for Next.js build
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// 3. Resolve next binary
const nextBin = path.resolve(rootDir, 'node_modules/.bin/next');

console.log('✨ [Sadza Build] Starting Next.js build with clean NODE_ENV=production...');

const result = spawnSync(nextBin, ['build'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
  },
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
