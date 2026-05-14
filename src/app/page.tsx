import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Undangan Pernikahan',
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
      <h1 className="font-dayland text-5xl text-ink mb-4">Undangan Pernikahan</h1>
      <p className="font-serif italic text-sm text-ink/60">Halaman ini sedang dalam pengembangan.</p>
    </div>
  );
}
