import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface TokenPayload {
  sub: string;
  role: string;
  email?: string;
  accountType?: string;
  exp?: number;
  iat?: number;
}

function parseJwt(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed || !parsed.sub || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: TokenPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() >= (payload.exp - 5) * 1000;
}

/**
 * Next.js Edge Middleware
 * - Intercepts and satisfies CORS preflight (OPTIONS) and attaches CORS headers
 *   for /api routes so external clients communicate cleanly without CORS blocking.
 * - Protects administrative and restricted application routes (/admin, /dashboard/business, /dashboard/user).
 * - Redirects logged-in users away from auth pages (/login, /signup, /register).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle API routes & CORS
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin') || '*';

    // Handle OPTIONS preflight immediately
    if (request.method === 'OPTIONS') {
      const preflight = new NextResponse(null, { status: 204 });
      preflight.headers.set('Access-Control-Allow-Origin', origin);
      preflight.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      preflight.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range',
      );
      preflight.headers.set('Access-Control-Allow-Credentials', 'true');
      preflight.headers.set('Access-Control-Max-Age', '86400');
      return preflight;
    }

    // Attach CORS headers to standard API responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range',
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // 2. Extract Session Credentials
  const accessToken = request.cookies.get('sadza_access_token')?.value;
  const tokenPayload = accessToken ? parseJwt(accessToken) : null;
  const isExpired = tokenPayload ? isTokenExpired(tokenPayload) : true;
  const hasValidSession = Boolean(tokenPayload && !isExpired);

  // 3. Prevent logged-in users from accessing guest auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/register';
  if (isAuthPage && hasValidSession && !request.nextUrl.searchParams.get('force')) {
    const role = tokenPayload?.role;
    const accountType = tokenPayload?.accountType;

    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (role === 'merchant' || accountType === 'business') {
      return NextResponse.redirect(new URL('/dashboard/business', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }

  // 4. Guard Admin Console (/admin/*) -> Strictly Admin Role
  if (pathname.startsWith('/admin')) {
    if (!hasValidSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (tokenPayload?.role !== 'admin') {
      // Authenticated but unauthorized (customer or merchant)
      if (tokenPayload?.role === 'merchant' || tokenPayload?.accountType === 'business') {
        return NextResponse.redirect(new URL('/dashboard/business', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // 5. Guard Dashboard Root (/dashboard)
  if (pathname === '/dashboard') {
    if (!hasValidSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (tokenPayload?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (tokenPayload?.role === 'merchant' || tokenPayload?.accountType === 'business') {
      return NextResponse.redirect(new URL('/dashboard/business', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }

  // 6. Guard Business Dashboard (/dashboard/business/*) -> Merchant or Admin
  if (pathname.startsWith('/dashboard/business')) {
    if (!hasValidSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (tokenPayload?.role === 'customer' && tokenPayload?.accountType !== 'business') {
      // Consumer trying to access business dashboard -> redirect to business onboarding
      return NextResponse.redirect(new URL('/onboarding/business', request.url));
    }

    return NextResponse.next();
  }

  // 7. Guard User Dashboard (/dashboard/user/*) -> Authenticated User
  if (pathname.startsWith('/dashboard/user')) {
    if (!hasValidSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/register',
  ],
};
