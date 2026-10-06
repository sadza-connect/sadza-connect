import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#007a3d', // Zimbabwe Flag Green
          700: '#006130',
          800: '#004a24',
          900: '#00391b',
          950: '#00200d',
        },
        gold: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#f6ac02', // Zimbabwe National Gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        ruby: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#d40000', // Zimbabwe Flag Red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['clamp(3rem, 8vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.035em', fontWeight: '800' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(9, 13, 22, 0.05), 0 10px 25px -10px rgba(9, 13, 22, 0.08)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.3), 0 10px 25px -10px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 4px 6px rgba(9, 13, 22, 0.07), 0 20px 40px -15px rgba(9, 13, 22, 0.16)',
        'card-hover-dark': '0 4px 12px rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 122, 61, 0.25)',
        emerald: '0 10px 30px -10px rgba(0, 122, 61, 0.4)',
        gold: '0 10px 30px -10px rgba(246, 172, 2, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
