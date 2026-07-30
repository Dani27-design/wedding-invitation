'use client';

import { useEffect, useState } from 'react';

const OFFLINE_SESSION_KEY = 'marinikah-offline-detected';

function readOnlineStatus() {
  if (typeof navigator === 'undefined') return true;
  if (typeof navigator.onLine !== 'boolean') return true;
  if (navigator.onLine) return true;
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(OFFLINE_SESSION_KEY) === '1') return false;
  } catch {
    /* sessionStorage may be unavailable in restricted browsing contexts. */
  }
  return false;
}

function markOffline() {
  try {
    sessionStorage.setItem(OFFLINE_SESSION_KEY, '1');
  } catch {
    /* sessionStorage may be unavailable in restricted browsing contexts. */
  }
}

function clearOffline() {
  try {
    sessionStorage.removeItem(OFFLINE_SESSION_KEY);
  } catch {
    /* sessionStorage may be unavailable in restricted browsing contexts. */
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(readOnlineStatus);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const nextIsOnline = readOnlineStatus();
      if (nextIsOnline) clearOffline();
      setIsOnline(nextIsOnline);
    };
    const handleOffline = () => {
      markOffline();
      setIsOnline(false);
    };
    const handleOnline = () => {
      if (typeof navigator.onLine !== 'boolean' || navigator.onLine) clearOffline();
      setIsOnline(readOnlineStatus());
    };

    updateOnlineStatus();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
