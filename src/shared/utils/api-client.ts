/**
 * Resilient API Client Helper for Sadza Connect.
 * - Normalizes NEXT_PUBLIC_API_URL (auto-appends /api/v1 if omitted, strips quotes,
 *   and prevents localhost URLs from being called on live cloud domains).
 * - Automatically falls back to same-origin /api/v1 routes if an external URL returns
 *   an HTML 404 or network failure.
 */

export function getApiBaseUrl(): string {
  const raw =
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/^['"]+|['"]+$/g, '').replace(/\/+$/, '')
      : '';

  if (!raw || raw === '/api/v1' || raw === '/api') {
    return '/api/v1';
  }

  // If running in browser on a live domain, never call localhost
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalBrowser = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalBrowser && (raw.includes('localhost') || raw.includes('127.0.0.1'))) {
      return '/api/v1';
    }

    // If the configured URL points to the exact same origin, use relative '/api/v1'
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const parsed = new URL(raw);
        if (parsed.origin === window.location.origin) {
          return '/api/v1';
        }
      }
    } catch {
      return '/api/v1';
    }
  }

  // Ensure absolute URLs end with /api/v1
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (!raw.endsWith('/api/v1') && !raw.includes('/api/v1/')) {
      return raw.endsWith('/api') ? `${raw}/v1` : `${raw}/api/v1`;
    }
    return raw;
  }

  return '/api/v1';
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function executeSingleFetch<T = any>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T> & { isHtmlOr404?: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    let parsedBody: any = null;
    let rawText = '';

    if (contentType.includes('application/json')) {
      try {
        parsedBody = await res.json();
      } catch {
        parsedBody = null;
      }
    } else {
      try {
        rawText = await res.text();
      } catch {
        rawText = '';
      }
    }

    const isHtmlResponse =
      contentType.includes('text/html') ||
      rawText.trim().startsWith('<!DOCTYPE') ||
      rawText.trim().startsWith('<html');

    if (isHtmlResponse) {
      return {
        ok: false,
        status: res.status,
        isHtmlOr404: true,
        error: `Server returned an unexpected response (${res.status}). Please try again in a moment.`,
      };
    }

    if (!res.ok) {
      const rawMsg = parsedBody?.error?.message || parsedBody?.message;
      if (rawMsg) {
        let msg = String(rawMsg);
        const lower = msg.toLowerCase();

        // Extract specific validation message if generic 'Validation failed' was returned
        if (msg === 'Validation failed' && parsedBody?.error?.details?.fields) {
          const fieldEntries = Object.values(parsedBody.error.details.fields);
          if (fieldEntries.length > 0 && Array.isArray(fieldEntries[0]) && fieldEntries[0][0]) {
            msg = String(fieldEntries[0][0]);
          }
        }

        // Catch database connection drops and socket resets
        if (
          lower.includes('econnreset') ||
          lower.includes('read econnreset') ||
          lower.includes('57p01') ||
          lower.includes('connection terminated') ||
          lower.includes('socket hang up') ||
          lower.includes('broken pipe')
        ) {
          msg = 'Database connection was temporarily interrupted. Please try again in a moment.';
        } else if (
          lower.includes('select ') ||
          lower.includes('insert into') ||
          lower.includes('update ') ||
          lower.includes('delete from') ||
          lower.includes('relation ') ||
          lower.includes('syntax error') ||
          lower.includes('knex') ||
          lower.includes('postgres') ||
          lower.includes('supabase') ||
          lower.includes('pooler')
        ) {
          msg = 'Database service is temporarily unavailable. Please try again in a few moments.';
        } else if (
          lower.includes('getaddrinfo') ||
          lower.includes('eai_again') ||
          lower.includes('etimedout') ||
          lower.includes('econnrefused') ||
          lower.includes('enotfound')
        ) {
          msg = 'Unable to establish secure connection. Please check your internet connection and try again.';
        }
        return { ok: false, status: res.status, error: msg };
      }

      if (res.status === 401) {
        return {
          ok: false,
          status: 401,
          error: 'Incorrect email, phone number, or password. Please try again.',
        };
      }

      if (res.status === 404) {
        return {
          ok: false,
          status: 404,
          isHtmlOr404: true,
          error: 'Requested API endpoint was not found (404).',
        };
      }

      if (res.status === 409) {
        return {
          ok: false,
          status: 409,
          error: 'An account or record with these details already exists.',
        };
      }

      if (res.status === 429) {
        return {
          ok: false,
          status: 429,
          error: 'Too many attempts. Please wait a few moments before trying again.',
        };
      }

      if (res.status === 502 || res.status === 503 || res.status === 504) {
        return {
          ok: false,
          status: res.status,
          isHtmlOr404: true,
          error:
            'The service is temporarily unavailable or warming up. Please wait 5 seconds and try again.',
        };
      }

      if (rawText && rawText.length < 200 && !rawText.includes('<')) {
        return { ok: false, status: res.status, error: rawText.trim() };
      }

      return {
        ok: false,
        status: res.status,
        error: `Request failed with status ${res.status}. Please check your details and try again.`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsedBody as T,
    };
  } catch (err: any) {
    const msg = err?.message || '';
    return {
      ok: false,
      status: 0,
      isHtmlOr404: true,
      error:
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Network error: Unable to reach the server. Please check your internet connection.'
          : msg || 'An unexpected error occurred while communicating with the server.',
    };
  }
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const firstAttempt = await executeSingleFetch<T>(url, options);

  // If the first attempt was to an external URL and failed with a 404/HTML/Network error,
  // automatically fallback to the local same-origin /api/v1 route on Netlify/Next.js
  if (
    !firstAttempt.ok &&
    firstAttempt.isHtmlOr404 &&
    (url.startsWith('http://') || url.startsWith('https://'))
  ) {
    const apiIndex = url.indexOf('/api/v1/');
    if (apiIndex !== -1) {
      const localFallbackUrl = url.slice(apiIndex);
      const fallbackAttempt = await executeSingleFetch<T>(localFallbackUrl, options);
      if (fallbackAttempt.ok || !fallbackAttempt.isHtmlOr404) {
        return fallbackAttempt;
      }
    }
  }

  return firstAttempt;
}
