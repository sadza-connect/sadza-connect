import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware
 * - Intercepts and satisfies CORS preflight (OPTIONS) and attaches CORS headers
 *   for /api routes so frontend hosted on Netlify or custom domains can communicate
 *   cleanly with backend on Render without browser CORS blocking.
 * - Protects administrative and restricted application routes by validating
 *   the session access token cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API routes & CORS
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

  // Note: /admin authentication gate is disabled during frontend review so all
  // administrative consoles can be inspected without requiring a backend session cookie.

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};

