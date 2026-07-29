'use client';

import { useEffect } from 'react';

export function canRegisterServiceWorker() {
  if (typeof window === 'undefined') return false;
  if (!navigator.serviceWorker) return false;
  if (process.env.NODE_ENV !== 'production') return false;

  const { protocol, hostname } = window.location;
  return protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!canRegisterServiceWorker()) return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('[ServiceWorker] Registration failed:', error);
    });
  }, []);

  return null;
}
