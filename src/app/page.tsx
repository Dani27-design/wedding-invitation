import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Sparkles, Globe, Palette, Music, Share2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Undangan Digital Premium — Buat Undangan Pernikahan Online',
  description: 'Platform undangan pernikahan digital premium untuk pasangan modern Indonesia. Desain sinematik, RSVP online, dan mudah dibagikan via WhatsApp.',
  robots: { index: true, follow: true },
};

const FEATURES = [
  { icon: Palette, title: 'Desain Sinematik', desc: 'Template premium dengan animasi halus yang terasa personal dan elegan' },
  { icon: Globe, title: 'Online & Praktis', desc: 'Bagikan langsung via WhatsApp. Tamu buka di HP tanpa install apapun' },
  { icon: Heart, title: 'RSVP & Ucapan', desc: 'Terima konfirmasi kehadiran dan ucapan dari tamu secara real-time' },
  { icon: Music, title: 'Musik & Media', desc: 'Tambahkan musik latar, galeri foto, dan kisah cinta kalian' },
  { icon: Sparkles, title: 'Twibbon & Interaksi', desc: 'Tamu bisa buat foto twibbon dan kirim komentar di kisah cinta' },
  { icon: Share2, title: 'Personalisasi Tamu', desc: 'Setiap tamu mendapat tautan khusus dengan nama mereka' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen-safe flex flex-col items-center justify-center px-6 py-20 bg-ink text-ivory text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <div className="relative z-10 max-w-lg mx-auto space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-black">Undangan Digital Premium</p>
            <h1 className="font-dayland text-5xl sm:text-6xl md:text-7xl text-ivory leading-tight">
              Cerita Cinta, Satu Tautan
            </h1>
            <p className="font-serif italic text-base sm:text-lg text-ivory/60 max-w-md mx-auto leading-relaxed">
              Undangan pernikahan digital yang terasa personal, elegan, dan mudah dibagikan ke semua tamu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              Buat Undangan
            </Link>
            <Link
              href="/dani-marini"
              className="px-8 py-3 border border-ivory/20 text-ivory/80 rounded-full text-xs uppercase tracking-[0.2em] font-black hover:border-gold hover:text-gold transition-colors"
            >
              Lihat Demo
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </section>

      {/* Features */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-3">Fitur Lengkap</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-ink">
              Semua yang kalian butuhkan, dalam satu undangan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-3xl bg-paper/50 border border-gold/5 space-y-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <h3 className="font-serif text-lg text-ink">{title}</h3>
                <p className="text-xs text-ink/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / Demo CTA */}
      <section className="px-6 py-20 bg-paper/50">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black">Lihat Langsung</p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
            Coba buka undangan demo kami
          </h2>
          <p className="font-serif italic text-sm text-ink/60 leading-relaxed">
            Rasakan pengalaman tamu membuka undangan digital — lengkap dengan musik, animasi, dan interaksi.
          </p>
          <Link
            href="/dani-marini?to=Tamu+Spesial"
            className="inline-block px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
          >
            Buka Demo Undangan
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <h2 className="font-dayland text-4xl sm:text-5xl text-ink">Mulai Sekarang</h2>
          <p className="font-serif italic text-sm text-ink/60 leading-relaxed max-w-sm mx-auto">
            Buat undangan pernikahan digital kalian dalam hitungan menit. Tanpa ribet, tanpa coding.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Link
              href="/register"
              className="px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              Daftar Gratis
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-ink/10 text-ink/60 rounded-full text-xs uppercase tracking-[0.2em] font-black hover:border-gold hover:text-gold transition-colors"
            >
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gold/5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-dayland text-xl text-ink">Wedding DM</p>
          <p className="text-[10px] text-ink/40 tracking-wider">Platform undangan digital premium Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
