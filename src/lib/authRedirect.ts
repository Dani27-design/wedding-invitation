export type GoogleAuthRedirectIntent = 'login' | 'register';

export const GOOGLE_AUTH_REDIRECT_INTENT_KEY = 'wedding:google-auth-redirect-intent';

function getSessionStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function shouldUseRedirectAuth(
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent,
  maxTouchPoints = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints,
) {
  const normalized = userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(normalized) || (normalized.includes('macintosh') && maxTouchPoints > 1);
  const isMobileBrowser = /android|mobile|crios|fxios|edgios/.test(normalized);

  return isIOS || isMobileBrowser;
}

export function setGoogleAuthRedirectIntent(intent: GoogleAuthRedirectIntent) {
  getSessionStorage()?.setItem(GOOGLE_AUTH_REDIRECT_INTENT_KEY, intent);
}

export function consumeGoogleAuthRedirectIntent() {
  const storage = getSessionStorage();
  const value = storage?.getItem(GOOGLE_AUTH_REDIRECT_INTENT_KEY);
  storage?.removeItem(GOOGLE_AUTH_REDIRECT_INTENT_KEY);

  return value === 'login' || value === 'register' ? value : null;
}
