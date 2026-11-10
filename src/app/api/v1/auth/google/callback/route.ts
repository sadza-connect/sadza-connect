import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/application/auth/auth-service';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getClientIp } from '@/shared/utils/route-handler';
import { env } from '@/config/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authService = new AuthService();

function resolveOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}

function redirectWithError(
  origin: string,
  source: string,
  errorCode: string,
  requestedType?: string,
) {
  const path = source === 'signup' ? '/signup' : '/login';
  const url = new URL(path, origin);
  url.searchParams.set('error', errorCode);
  if (source === 'signup' && requestedType === 'business') {
    url.searchParams.set('type', 'business');
  }
  const res = NextResponse.redirect(url);
  res.cookies.delete('sadza_google_oauth_state');
  return res;
}

export async function GET(req: NextRequest) {
  const origin = resolveOrigin(req);
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  // Parse state cookie for CSRF validation & onboarding context
  let parsedState: {
    state: string;
    type?: 'personal' | 'business';
    redirect?: string;
    source?: string;
  } | null = null;

  try {
    const rawCookie = req.cookies.get('sadza_google_oauth_state')?.value;
    if (rawCookie) {
      parsedState = JSON.parse(rawCookie);
    }
  } catch {
    parsedState = null;
  }

  const source = parsedState?.source || 'login';
  const requestedType = parsedState?.type || 'personal';

  if (oauthError) {
    return redirectWithError(origin, source, 'google_auth_cancelled', requestedType);
  }

  if (!code || !state || !parsedState || parsedState.state !== state) {
    return redirectWithError(origin, source, 'google_state_invalid', requestedType);
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return redirectWithError(origin, source, 'google_not_configured', requestedType);
  }

  try {
    const redirectUri = `${origin}/api/v1/auth/google/callback`;

    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData?.access_token) {
      return redirectWithError(origin, source, 'google_token_exchange_failed', requestedType);
    }

    // 2. Retrieve verified Google user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile?.sub || !profile?.email) {
      return redirectWithError(origin, source, 'google_profile_failed', requestedType);
    }

    if (profile.email_verified === false) {
      return redirectWithError(origin, source, 'google_email_unverified', requestedType);
    }

    // 3. Authenticate or create user in Sadza Connect DB
    const { user, tokens } = await authService.authenticateWithGoogle({
      googleId: profile.sub,
      email: profile.email,
      fullName: profile.name || profile.given_name || profile.email.split('@')[0],
      avatarUrl: profile.picture,
      requestedAccountType: requestedType,
      deviceFingerprint: req.headers.get('user-agent') || undefined,
      ipAddress: getClientIp(req),
    });

    // 4. Determine destination strictly according to user role & onboarding completeness
    const rawRedirect = parsedState.redirect || '';
    const safeRedirect =
      rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '';

    let destination = safeRedirect || '/dashboard/user';

    if (user.role === 'admin') {
      destination = safeRedirect || '/admin';
    } else if (
      user.role === 'merchant' ||
      user.accountType === 'business' ||
      requestedType === 'business'
    ) {
      const userBusinesses = await businessRepository.findByUserId(user.id);
      if (userBusinesses.length === 0) {
        // Business user has not yet customized/registered their storefront -> prompt onboarding
        const onboardingParams = new URLSearchParams({
          owner: user.fullName,
          email: user.email.getValue(),
          verified: 'true',
          provider: 'google',
        });
        destination = `/onboarding/business?${onboardingParams.toString()}`;
      } else {
        destination = safeRedirect || '/dashboard/business';
      }
    }

    const response = NextResponse.redirect(new URL(destination, origin));
    response.cookies.delete('sadza_google_oauth_state');

    response.cookies.set('sadza_access_token', tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.cookies.set('sadza_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return redirectWithError(origin, source, 'google_auth_failed', requestedType);
  }
}
