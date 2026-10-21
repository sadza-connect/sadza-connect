'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { safeFetchJson, getApiBaseUrl } from '@/shared/utils/api-client';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: string;
  accountType: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logoutError: string | null;
  clearLogoutError: () => void;
  login: (payload: { user: UserSession; accessToken: string; refreshToken: string }) => void;
  logout: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const router = useRouter();

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken =
        localStorage.getItem('sadza_refresh_token') || getCookie('sadza_refresh_token');
      if (!refreshToken) return false;

      const apiUrl = getApiBaseUrl();
      const res = await safeFetchJson(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok && res.data?.data?.accessToken) {
        const payload = res.data.data;
        localStorage.setItem('sadza_user', JSON.stringify(payload.user));
        localStorage.setItem('sadza_access_token', payload.accessToken);
        localStorage.setItem('sadza_refresh_token', payload.refreshToken);

        setCookie('sadza_access_token', payload.accessToken, 15 * 60);
        setCookie('sadza_refresh_token', payload.refreshToken, 7 * 24 * 60 * 60);

        setUser(payload.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Initialize auth state and verify session against server
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const storedUser = localStorage.getItem('sadza_user');
        const token = localStorage.getItem('sadza_access_token') || getCookie('sadza_access_token');
        const refreshToken = localStorage.getItem('sadza_refresh_token') || getCookie('sadza_refresh_token');

        if (token && storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (isMounted) setUser(parsed);
          } catch {
            // invalid JSON
          }

          if (!getCookie('sadza_access_token')) {
            setCookie('sadza_access_token', token, 15 * 60);
          }

          // Verify token with backend
          const apiUrl = getApiBaseUrl();
          const meRes = await safeFetchJson(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (meRes.ok && meRes.data?.data?.user) {
            if (isMounted) {
              setUser(meRes.data.data.user);
              localStorage.setItem('sadza_user', JSON.stringify(meRes.data.data.user));
            }
          } else if (refreshToken) {
            // Try refreshing if access token expired
            const refreshed = await refreshSession();
            if (!refreshed && isMounted) {
              localStorage.removeItem('sadza_user');
              localStorage.removeItem('sadza_access_token');
              localStorage.removeItem('sadza_refresh_token');
              deleteCookie('sadza_access_token');
              deleteCookie('sadza_refresh_token');
              setUser(null);
            }
          }
        } else if (refreshToken) {
          // Token missing but refresh token present
          await refreshSession();
        } else {
          if (isMounted) setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshSession]);

  // Periodic silent refresh every 10 minutes while user is authenticated
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  const login = useCallback((payload: { user: UserSession; accessToken: string; refreshToken: string }) => {
    try {
      localStorage.setItem('sadza_user', JSON.stringify(payload.user));
      localStorage.setItem('sadza_access_token', payload.accessToken);
      localStorage.setItem('sadza_refresh_token', payload.refreshToken);

      setCookie('sadza_access_token', payload.accessToken, 15 * 60);
      setCookie('sadza_refresh_token', payload.refreshToken, 7 * 24 * 60 * 60);

      setUser(payload.user);
      setLogoutError(null);
    } catch (err) {
      console.error('Failed to store session credentials', err);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    setLogoutError(null);
    const refreshToken = localStorage.getItem('sadza_refresh_token') || getCookie('sadza_refresh_token');

    try {
      const apiUrl = getApiBaseUrl();
      const result = await safeFetchJson(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('sadza_access_token')
            ? { Authorization: `Bearer ${localStorage.getItem('sadza_access_token')}` }
            : {}),
        },
        body: JSON.stringify({ refreshToken: refreshToken || '' }),
      });

      if (!result.ok) {
        setLogoutError(result.error || 'Failed to securely end session on server. Please try again.');
        return false;
      }

      // Invalidate tokens and user state securely
      localStorage.removeItem('sadza_user');
      localStorage.removeItem('sadza_access_token');
      localStorage.removeItem('sadza_refresh_token');

      deleteCookie('sadza_access_token');
      deleteCookie('sadza_refresh_token');
      deleteCookie('sadza_user');

      setUser(null);

      // Queue friendly logged-out celebration for the destination page
      try {
        sessionStorage.setItem(
          'sadza_auth_celebration',
          JSON.stringify({
            type: 'logout',
            title: 'Signed Out Successfully',
            message: 'You have been safely signed out of Sadza Connect. See you soon!',
          })
        );
      } catch {
        // Ignore storage errors
      }

      // Redirect user to the login page
      router.push('/login');
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Network error occurred during logout. Please try again.';
      setLogoutError(message);
      return false;
    }
  }, [router]);

  const clearLogoutError = useCallback(() => {
    setLogoutError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        logoutError,
        clearLogoutError,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
