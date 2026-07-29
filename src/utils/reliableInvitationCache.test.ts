import { describe, expect, it } from 'vitest';
import {
  classifyReliableCacheRequest,
  getNextImageSourceUrl,
  isPublicInvitationNavigation,
  normalizeInvitationCacheUrl,
  normalizeMediaCacheUrl,
} from './reliableInvitationCache';

const ORIGIN = 'https://marinikah.test';

function req(pathOrUrl: string, init: { method?: string; mode?: string } = {}) {
  return {
    url: pathOrUrl.startsWith('http') ? pathOrUrl : `${ORIGIN}${pathOrUrl}`,
    method: init.method ?? 'GET',
    mode: init.mode ?? 'navigate',
  };
}

describe('reliable invitation cache routing', () => {
  it('treats a one-segment wedding URL as public invitation navigation', () => {
    expect(isPublicInvitationNavigation(req('/dani-marini'), ORIGIN)).toBe(true);
  });

  it('allows personalized invitation URLs to use the navigation strategy', () => {
    expect(classifyReliableCacheRequest(req('/dani-marini?to=Budi'), ORIGIN)).toBe('network-first-page');
  });

  it('normalizes personalized invitation URLs for pathname fallback cache lookup', () => {
    expect(normalizeInvitationCacheUrl(`${ORIGIN}/dani-marini?to=Budi#opening`)).toBe(`${ORIGIN}/dani-marini`);
  });

  it('does not cache admin navigation', () => {
    expect(classifyReliableCacheRequest(req('/admin'), ORIGIN)).toBe('network-only');
    expect(classifyReliableCacheRequest(req('/admin/dani-marini'), ORIGIN)).toBe('network-only');
  });

  it('does not cache auth navigation', () => {
    expect(classifyReliableCacheRequest(req('/login'), ORIGIN)).toBe('network-only');
    expect(classifyReliableCacheRequest(req('/register'), ORIGIN)).toBe('network-only');
  });

  it('does not cache non-GET requests', () => {
    expect(classifyReliableCacheRequest(req('/dani-marini', { method: 'POST' }), ORIGIN)).toBe('network-only');
  });

  it('uses cache-first strategy for local static assets', () => {
    expect(classifyReliableCacheRequest(req('/_next/static/chunks/app.js', { mode: 'no-cors' }), ORIGIN)).toBe('cache-first-static');
    expect(classifyReliableCacheRequest(req('/_next/image?url=%2Fimages%2Flogo-1.png&w=256&q=75', { mode: 'no-cors' }), ORIGIN)).toBe('cache-first-static');
    expect(classifyReliableCacheRequest(req('/images/logo-1.png', { mode: 'no-cors' }), ORIGIN)).toBe('cache-first-static');
    expect(classifyReliableCacheRequest(req('/fonts/Dayland.woff2', { mode: 'no-cors' }), ORIGIN)).toBe('cache-first-static');
  });

  it('uses media cache for Next optimized Firebase Storage images', () => {
    const sourceUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/story.jpg?alt=media&token=abc';
    const optimizedUrl = `/_next/image?url=${encodeURIComponent(sourceUrl)}&w=1080&q=75`;

    expect(getNextImageSourceUrl(`${ORIGIN}${optimizedUrl}`, ORIGIN)).toBe(sourceUrl);
    expect(classifyReliableCacheRequest(req(optimizedUrl, { mode: 'no-cors' }), ORIGIN)).toBe('cache-first-media');
  });

  it('uses media cache for local audio files', () => {
    expect(classifyReliableCacheRequest(req('/musics/adele-make-you-feel-my-love.mp3', { mode: 'no-cors' }), ORIGIN)).toBe('cache-first-media');
  });

  it('normalizes cache-busted media URLs without dropping Firebase download parameters', () => {
    expect(normalizeMediaCacheUrl('https://firebasestorage.googleapis.com/v0/b/bucket/o/twibbon.png?alt=media&token=abc&v=123#preview')).toBe(
      'https://firebasestorage.googleapis.com/v0/b/bucket/o/twibbon.png?alt=media&token=abc',
    );
  });

  it('keeps Firebase data and auth endpoints network-only', () => {
    expect(classifyReliableCacheRequest(req('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen', { mode: 'cors' }), ORIGIN)).toBe('network-only');
    expect(classifyReliableCacheRequest(req('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword', { mode: 'cors' }), ORIGIN)).toBe('network-only');
    expect(classifyReliableCacheRequest(req('https://project.cloudfunctions.net/sendRegistrationEmail', { mode: 'cors' }), ORIGIN)).toBe('network-only');
  });

  it('uses media cache for Firebase Storage assets only', () => {
    expect(classifyReliableCacheRequest(req('https://firebasestorage.googleapis.com/v0/b/bucket/o/photo.jpg?alt=media', { mode: 'cors' }), ORIGIN)).toBe('cache-first-media');
  });
});
