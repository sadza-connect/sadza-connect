import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CelebrationProvider } from '@/context/CelebrationContext';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { CelestialSky } from '@/components/animations/CelestialSky';
import { AuthCelebrationModal } from '@/components/ui/AuthCelebrationModal';

export const metadata: Metadata = {
  title: 'Sadza Connect — Zimbabwe’s Digital Platform for Business, Marketplace, Jobs & Utilities',
  description:
    'Zimbabwe’s unified commercial discovery platform. Connecting people, verified businesses, marketplace deals, open jobs, and instant utility bill settlements across all 10 provinces.',
  keywords: [
    'Sadza Connect',
    'Sadza Connect',
    'Zimbabwe business directory',
    'Harare businesses',
    'Bulawayo marketplace',
    'ZESA electricity tokens',
    'Zimbabwe jobs',
    'Gweru solar suppliers',
    'Victoria Falls lodges',
  ],
  authors: [{ name: 'Africdominion Group (Pvt) Ltd' }],
  icons: {
    icon: '/logo.png',
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash inline script to prevent theme flicker and initialize sky parameters */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('sadza-theme-v2');
                const isDark = stored === 'dark';
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                  document.documentElement.dataset.sky = 'night';
                  document.documentElement.style.setProperty('--sky-turn', '195');
                  document.documentElement.style.setProperty('--moon-turn', '40');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                  document.documentElement.dataset.sky = 'day';
                  document.documentElement.style.setProperty('--sky-turn', '30');
                  document.documentElement.style.setProperty('--moon-turn', '-110');
                }
                document.documentElement.style.setProperty('--sky-dur', '0s');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-brand-600/20 selection:text-brand-700 dark:selection:bg-brand-500/30 dark:selection:text-brand-300 min-h-screen flex flex-col relative text-ink-950 dark:text-ink-50">
        <ThemeProvider>
          <AuthProvider>
            <CelebrationProvider>
              <ToastProvider>
                <CelestialSky />
                {children}
                <AuthCelebrationModal />
              </ToastProvider>
            </CelebrationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
