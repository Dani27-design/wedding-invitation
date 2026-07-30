export type GoogleAuthAction = 'login' | 'register';

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '';
}

export function getGoogleAuthErrorMessage(error: unknown, action: GoogleAuthAction = 'login') {
  const code = getErrorCode(error);
  const message = getErrorMessage(error).toLowerCase();
  const actionLabel = action === 'register' ? 'pendaftaran' : 'login';

  if (code === 'auth/popup-blocked') {
    return 'Browser memblokir jendela Google. Izinkan popup untuk situs ini, lalu coba lagi.';
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return `${actionLabel[0].toUpperCase()}${actionLabel.slice(1)} Google dibatalkan sebelum selesai.`;
  }

  if (code === 'auth/network-request-failed') {
    return 'Koneksi tidak stabil. Periksa internet lalu coba lagi.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Domain login belum diizinkan di Firebase. Hubungi admin teknis.';
  }

  if (
    code === 'auth/missing-initial-state'
    || message.includes('missing initial state')
    || message.includes('storage-partitioned')
  ) {
    return 'Login Google redirect gagal karena storage browser tidak tersedia. Refresh halaman lalu coba lagi, atau gunakan email dan password.';
  }

  return `Gagal memproses ${actionLabel} Google. Silakan coba lagi atau gunakan email dan password.`;
}
