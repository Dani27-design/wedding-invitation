import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Undangan Tidak Ditemukan',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
      <h1 className="font-dayland text-5xl text-ink mb-4">
        Undangan Tidak Ditemukan
      </h1>
      <p className="font-serif italic text-sm text-ink/60 mb-2">
        Halaman yang Anda cari tidak tersedia.
      </p>
      <p className="font-serif italic text-xs text-ink/40">
        Pastikan tautan undangan yang Anda terima sudah benar.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-serif italic text-xs text-gold underline underline-offset-4"
      >
        Kembali ke halaman utama
      </Link>
    </div>
  );
}
