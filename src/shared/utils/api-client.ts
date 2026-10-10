/**
 * Resilient API Client Helper for Sadza Connect.
 * Safely executes HTTP requests and parses responses, guarding against
 * raw HTML responses (such as Netlify SPA 200 fallbacks, 404s, or 502/503 cold starts)
 * that cause "Unexpected token '<', '<!DOCTYPE ' is not valid JSON" errors.
 */

export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  return '/api/v1';
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
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

    // Guard: Detect HTML returned instead of JSON (Netlify SPA 200 fallback, CDN 404, or gateway error)
    const isHtmlResponse =
      contentType.includes('text/html') ||
      rawText.trim().startsWith('<!DOCTYPE') ||
      rawText.trim().startsWith('<html');

    if (isHtmlResponse) {
      return {
        ok: false,
        status: res.status,
        error:
          'Backend API returned an HTML page instead of JSON. If your frontend is hosted on Netlify and backend on Render, please set NEXT_PUBLIC_API_URL in Netlify Site Settings > Environment Variables to your live Render API URL (e.g. https://your-backend.onrender.com/api/v1).',
      };
    }

    if (!res.ok) {
      // 1. Structured JSON error response from API
      if (parsedBody?.error?.message) {
        return { ok: false, status: res.status, error: parsedBody.error.message };
      }
      if (parsedBody?.message) {
        return { ok: false, status: res.status, error: parsedBody.message };
      }

      // 2. 404 Not Found
      if (res.status === 404) {
        return {
          ok: false,
          status: 404,
          error:
            'Backend API endpoint not found (404). If your frontend is on Netlify and backend on Render, ensure NEXT_PUBLIC_API_URL is set in Netlify to your live Render backend URL.',
        };
      }

      // 3. Cold-start or gateway error (502/503/504)
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        return {
          ok: false,
          status: res.status,
          error:
            'The backend server is currently starting up (Render cold start). Please wait 15 seconds and try again.',
        };
      }

      // 4. Raw text fallback error
      if (rawText && rawText.length < 200 && !rawText.includes('<')) {
        return { ok: false, status: res.status, error: rawText.trim() };
      }

      return {
        ok: false,
        status: res.status,
        error: `Server request failed with status ${res.status}. Please check your connection.`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsedBody as T,
    };
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return {
        ok: false,
        status: 0,
        error:
          'Network connection error: Unable to reach the API server. Please check your internet connection or verify the backend service is running.',
      };
    }

    return {
      ok: false,
      status: 0,
      error: msg || 'An unexpected error occurred while communicating with the server.',
    };
  }
}
