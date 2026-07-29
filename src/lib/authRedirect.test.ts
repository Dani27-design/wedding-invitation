import { afterEach, describe, expect, it } from 'vitest';
import {
  GOOGLE_AUTH_REDIRECT_INTENT_KEY,
  consumeGoogleAuthRedirectIntent,
  setGoogleAuthRedirectIntent,
  shouldUseRedirectAuth,
} from './authRedirect';

describe('authRedirect', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('uses redirect auth for iOS Safari user agents', () => {
    expect(shouldUseRedirectAuth(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
      5,
    )).toBe(true);
  });

  it('uses redirect auth for iOS Chrome because it still runs on WebKit', () => {
    expect(shouldUseRedirectAuth(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
      5,
    )).toBe(true);
  });

  it('does not force redirect auth for desktop Chrome', () => {
    expect(shouldUseRedirectAuth(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      0,
    )).toBe(false);
  });

  it('stores and consumes redirect intent once', () => {
    setGoogleAuthRedirectIntent('register');

    expect(window.sessionStorage.getItem(GOOGLE_AUTH_REDIRECT_INTENT_KEY)).toBe('register');
    expect(consumeGoogleAuthRedirectIntent()).toBe('register');
    expect(consumeGoogleAuthRedirectIntent()).toBeNull();
  });
});
