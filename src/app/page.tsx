import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Globe, Palette, Music, Share2, Users, Star, MessageCircle, ArrowRight, MapPin, Calendar, QrCode, Clock, Image, Film, Smartphone, Heart, Upload, Gift, MessageSquare, Printer } from 'lucide-react';
import { ConsultationForm } from '@/components/ui/ConsultationForm';
import { BackgroundLayers } from '@/components/ui/BackgroundLayers';
import { PetalEffect } from '@/components/ui/PetalEffect';
import { FloatingPetals } from '@/components/ui/FloatingPetals';
import { LightGlow } from '@/components/ui/LightGlow';

export const metadata: Metadata = {
  title: 'Wedding DM | Undangan Pernikahan Digital Premium',
  description: 'Buat undangan pernikahan digital dengan desain elegan, RSVP online, twibbon interaktif, galeri sinematik, dan personalisasi tamu. Praktis dibagikan, indah dikenang.',
  robots: { index: true, follow: true },
};

const FEATURE_GROUPS = [
  {
    label: 'Pengalaman Tamu',
    items: [
      { icon: Music, title: 'Musik latar yang menyatu dengan suasana' },
      { icon: Share2, title: 'Sambutan nama tamu secara personal' },
      { icon: Film, title: 'Cerita cinta dengan tampilan multi-slide' },
      { icon: Heart, title: 'Like dan komentar real-time ala media sosial' },
      { icon: Sparkles, title: 'Twibbon interaktif untuk dibagikan tamu' },
      { icon: Clock, title: 'Hitung mundur menuju hari pernikahan' },
      { icon: MessageSquare, title: 'Ucapan dan konfirmasi kehadiran online' },
      { icon: Image, title: 'Galeri foto mosaik yang dinamis' },
      { icon: MapPin, title: 'Peta lokasi dan integrasi kalender' },
      { icon: Gift, title: 'Amplop digital sekali ketuk' },
      { icon: Globe, title: 'Responsif di semua perangkat' },
      { icon: Smartphone, title: 'Navigasi mengambang yang nyaman digunakan' },
    ],
  },
  {
    label: 'Pengelolaan Undangan',
    items: [
      { icon: Users, title: 'Kelola data pasangan dan galeri foto' },
      { icon: Calendar, title: 'Atur detail acara dan susunan acara' },
      { icon: Upload, title: 'Upload musik, foto, dan video dengan mudah' },
      { icon: Palette, title: 'Pilihan tema warna siap pakai' },
      { icon: Users, title: 'Manajemen daftar tamu dan RSVP' },
      { icon: Printer, title: 'QR code check-in tamu dengan desain elegan' },
      { icon: Share2, title: 'Bagikan undangan langsung ke WhatsApp' },
      { icon: MessageCircle, title: 'Moderasi komentar dan ucapan tamu' },
      { icon: Gift, title: 'Kelola rekening hadiah digital' },
      { icon: Globe, title: 'Pratinjau undangan secara real-time' },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink overflow-x-hidden">
      <BackgroundLayers />

      {/* ── Hero ── */}
      <section className="relative min-h-screen-safe flex flex-col items-center justify-center px-6 py-16 bg-ink text-ivory overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <PetalEffect />
        <LightGlow />

        <div className="absolute top-[10%] left-[10%] w-[40vw] max-w-60 aspect-square bg-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] right-[5%] w-[50vw] max-w-72 aspect-square bg-rose-pastel/8 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-[60vw] max-w-96 h-auto aspect-[2.4/1] bg-gold/5 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory leading-tight font-bold italic">
            Satu Tautan untuk Hari yang Tak Terlupakan
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ivory/45 max-w-md mx-auto leading-relaxed">
            Hadirkan momen pernikahan Anda dalam pengalaman digital yang elegan, personal, dan penuh cerita. Dirancang untuk terasa hangat, indah, dan berkesan bagi setiap tamu yang membuka.
          </p>

          {/* Phone mockup */}
          <div className="relative flex justify-center pt-4 pb-2">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[260px] aspect-square border border-gold/10 rounded-full animate-[spin_45s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[300px] aspect-square border border-ivory/5 rounded-full animate-[spin_60s_linear_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-48 aspect-[3/4] bg-gold/15 rounded-full blur-[60px]" />

            <Link
              href="/dani-marini?to=Tamu+Spesial"
              className="relative block w-[150px] sm:w-[170px] rounded-[16px] sm:rounded-[20px] overflow-hidden border-2 border-ivory/15 shadow-2xl shadow-gold/20 hover:scale-[1.03] hover:border-gold/30 transition-all duration-500 aspect-[9/16]"
            >
              <iframe
                src="/dani-marini?to=Tamu+Spesial"
                title="Demo undangan"
                className="absolute top-0 left-0 w-[375px] h-[667px] origin-top-left pointer-events-none"
                style={{ transform: 'scale(0.4)' }}
                loading="lazy"
              />
              <div className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-br from-ivory/10 via-transparent to-transparent" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
            >
              Mulai Membuat
            </Link>
            <Link
              href="/dani-marini?to=Tamu+Spesial"
              className="group px-8 py-3 border border-ivory/20 text-ivory/60 rounded-full text-xs uppercase tracking-[0.2em] font-black hover:border-gold hover:text-gold transition-colors flex items-center gap-2"
            >
              Lihat Contoh
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Strengths ── */}
      <section className="relative px-6 py-12 overflow-hidden">
        <FloatingPetals />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="text-center mb-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Mengapa Wedding DM?</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Bukan sekadar undangan, tetapi pengalaman yang hidup
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { color: 'from-gold/30 to-gold/5', title: 'Kisah cinta yang terasa lebih hangat', desc: 'Cerita perjalanan Anda hadir dalam tampilan sinematik lengkap dengan foto, video, komentar, dan interaksi yang membuat setiap momen terasa lebih personal.' },
              { color: 'from-rose-pastel/40 to-rose-pastel/5', title: 'Twibbon aesthetic untuk setiap tamu', desc: 'Biarkan tamu membuat dan membagikan twibbon mereka sendiri secara langsung. Geser, atur, lalu bagikan ke media sosial dalam hitungan detik.' },
              { color: 'from-gold/30 to-gold/5', title: 'Galeri dengan layout aesthetic secara otomatis', desc: 'Setiap foto ditampilkan dalam komposisi mosaik yang artistik dan responsif, menciptakan kesan galeri modern tanpa perlu pengaturan manual.' },
              { color: 'from-rose-pastel/40 to-rose-pastel/5', title: 'Ucapan dan RSVP yang praktis dan elegan', desc: 'Tamu dapat mengirimkan ucapan dan konfirmasi kehadiran mereka secara langsung melalui platform yang mudah digunakan. Cepat, nyaman, dan tetap terasa premium.' },
              { color: 'from-gold/30 to-gold/5', title: 'Panel admin yang lengkap dan mudah digunakan', desc: 'Kelola data pasangan, cerita cinta, galeri, RSVP, QR tamu, komentar, hingga tema undangan dalam satu dashboard yang praktis.' },
            ].map(({ color, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className={`w-1 rounded-full bg-gradient-to-b ${color} flex-shrink-0`} />
                <div className="py-1">
                  <p className="font-serif italic text-sm text-ink mb-0.5">{title}</p>
                  <p className="text-[11px] text-ink/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-12 bg-paper/30 border-y border-gold/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Dirancang untuk<br></br>Hari Istimewa Anda</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Hadirkan cerita, suasana, dan kebahagiaan dalam satu pengalaman digital
            </h2>
          </div>

          <div className="space-y-5">
            {FEATURE_GROUPS.map(({ label, items }) => (
              <div key={label}>
                <p className="text-[10px] text-center uppercase tracking-[0.3em] text-gold font-black mb-3">{label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map(({ icon: Icon, title }) => (
                    <div key={title} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-gold/5">
                      <Icon className="w-3.5 h-3.5 text-gold/60 flex-shrink-0" />
                      <span className="text-[11px] text-ink/60 leading-tight">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultation ── */}
      <section className="relative px-6 py-14 overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-80 aspect-square bg-gold/8 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto text-center space-y-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-black">Konsultasi Gratis</p>
          <h2 className="font-display italic text-2xl sm:text-3xl text-ivory font-bold">
            Wujudkan undangan digital anda yang benar-benar berkesan
          </h2>
          <p className="font-serif italic text-sm text-ivory/40 leading-relaxed max-w-sm mx-auto">
            Ada pertanyaan atau ingin berdiskusi? Sampaikan melalui WhatsApp dan tim kami akan segera membantu.
          </p>
          <ConsultationForm />
          <div className="flex items-center gap-3 justify-center pt-2">
            <span className="text-[10px] text-ivory/25">atau langsung</span>
            <Link
              href="/register"
              className="text-[10px] text-gold font-black uppercase tracking-widest hover:underline underline-offset-4"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 border-t border-gold/5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-3">
            <p className="font-display italic text-xl text-ink font-bold mb-1">Wedding DM</p>
            <p className="font-serif italic text-[13px] text-ink/35">Undangan pernikahan digital yang elegan dan berkesan</p>
          </div>
          <div className="flex items-center justify-center gap-6 mb-3">
            <Link href="/dani-marini?to=Tamu+Spesial" className="text-[10px] text-ink/70 uppercase tracking-wider hover:text-gold transition-colors">Coba</Link>
            <div className="w-1 h-1 rounded-full bg-gold/20" />
            <Link href="/register" className="text-[10px] text-ink/70 uppercase tracking-wider hover:text-gold transition-colors">Daftar</Link>
            <div className="w-1 h-1 rounded-full bg-gold/20" />
            <Link href="/login" className="text-[10px] text-ink/70 uppercase tracking-wider hover:text-gold transition-colors">Masuk</Link>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-px bg-gold/10" />
            <Heart className="w-3 h-3 text-gold/20" />
            <div className="w-12 h-px bg-gold/10" />
          </div>
          <p className="text-[9px] text-ink/25 text-center">&copy; {new Date().getFullYear()} Wedding DM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
