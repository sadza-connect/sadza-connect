import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { env } from '@/config/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type');
  const requestedType: 'personal' | 'business' =
    typeParam === 'business' ? 'business' : 'personal';
  const redirectParam = searchParams.get('redirect') || '';
  const sourceParam = searchParams.get('source') === 'signup' ? 'signup' : 'login';

  const origin = resolveOrigin(req);

  // Guard if Google OAuth credentials have not yet been configured in environment
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    const fallbackPath = sourceParam === 'signup' ? '/signup' : '/login';
    const errUrl = new URL(fallbackPath, origin);
    errUrl.searchParams.set('error', 'google_not_configured');
    if (requestedType === 'business' && sourceParam === 'signup') {
      errUrl.searchParams.set('type', 'business');
    }
    return NextResponse.redirect(errUrl);
  }

  const state = randomBytes(24).toString('hex');
  const redirectUri = `${origin}/api/v1/auth/google/callback`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('access_type', 'online');

  const response = NextResponse.redirect(googleAuthUrl);

  const statePayload = JSON.stringify({
    state,
    type: requestedType,
    redirect: redirectParam,
    source: sourceParam,
  });

  response.cookies.set('sadza_google_oauth_state', statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return response;
}
