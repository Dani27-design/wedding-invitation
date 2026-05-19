'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <title>Terjadi Kesalahan | Marinikah Invitation</title>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="font-serif italic text-2xl text-ink">Terjadi Kesalahan</h1>
          <p className="font-serif italic text-sm text-ink/50 leading-relaxed">
            Mohon maaf, terjadi kendala saat memuat halaman ini. Silakan coba lagi atau kembali ke halaman utama.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <button
              onClick={reset}
              className="px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="px-8 py-3 border border-ink/10 text-ink/50 rounded-full text-xs uppercase tracking-[0.2em] font-black hover:border-gold hover:text-gold transition-colors"
            >
              Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
