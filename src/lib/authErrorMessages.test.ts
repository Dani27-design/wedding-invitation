import { describe, expect, it } from 'vitest';
import { getGoogleAuthErrorMessage } from './authErrorMessages';

describe('authErrorMessages', () => {
  it('explains blocked Google popups', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/popup-blocked' })).toBe(
      'Browser memblokir jendela Google. Izinkan popup untuk situs ini, lalu coba lagi.',
    );
  });

  it('explains user-cancelled Google popups', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/popup-closed-by-user' })).toBe(
      'Login Google dibatalkan sebelum selesai.',
    );
  });

  it('uses register wording for cancelled register popups', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/cancelled-popup-request' }, 'register')).toBe(
      'Pendaftaran Google dibatalkan sebelum selesai.',
    );
  });

  it('explains network failures', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/network-request-failed' })).toBe(
      'Koneksi tidak stabil. Periksa internet lalu coba lagi.',
    );
  });

  it('explains unauthorized domains', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/unauthorized-domain' })).toBe(
      'Domain login belum diizinkan di Firebase. Hubungi admin teknis.',
    );
  });

  it('explains missing redirect state codes', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/missing-initial-state' })).toBe(
      'Login Google redirect gagal karena storage browser tidak tersedia. Refresh halaman lalu coba lagi, atau gunakan email dan password.',
    );
  });

  it('explains missing redirect state messages', () => {
    expect(getGoogleAuthErrorMessage(new Error('Unable to process request due to missing initial state.'))).toBe(
      'Login Google redirect gagal karena storage browser tidak tersedia. Refresh halaman lalu coba lagi, atau gunakan email dan password.',
    );
  });

  it('uses a generic Google login fallback', () => {
    expect(getGoogleAuthErrorMessage({ code: 'auth/internal-error' })).toBe(
      'Gagal memproses login Google. Silakan coba lagi atau gunakan email dan password.',
    );
  });
});
