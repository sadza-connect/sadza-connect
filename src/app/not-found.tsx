import Link from 'next/link';
import { Home } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-4">
          Error 404
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 text-sm sm:text-base">
          Sorry, we couldn&apos;t find the page you are looking for. It might have been moved or removed.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
