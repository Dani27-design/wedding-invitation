'use client';

import { useEffect } from 'react';

const INVITATION_BYPASS_PATH_PREFIXES = [
  '/admin',
  '/login',
  '/register',
  '/api',
  '/server-sitemap-index.xml',
  '/robots.txt',
  '/favicon.ico',
];

function hasPathPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function canRegisterServiceWorker() {
  if (typeof window === 'undefined') return false;
  if (!navigator.serviceWorker) return false;
  if (process.env.NODE_ENV !== 'production') return false;

  const { protocol, hostname } = window.location;
  return protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
}

export function isPublicInvitationPath(pathname: string) {
  if (hasPathPrefix(pathname, INVITATION_BYPASS_PATH_PREFIXES)) return false;

  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 1;
}

async function requestCurrentInvitationCache() {
  if (!isPublicInvitationPath(window.location.pathname)) return;

  const registration = await navigator.serviceWorker.ready;
  const activeWorker = navigator.serviceWorker.controller ?? registration.active;

  activeWorker?.postMessage({
    type: 'CACHE_INVITATION_PAGE',
    url: window.location.href,
  });
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!canRegisterServiceWorker()) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => requestCurrentInvitationCache())
      .catch((error) => {
        console.error('[ServiceWorker] Registration failed:', error);
      });
  }, []);

  return null;
}
