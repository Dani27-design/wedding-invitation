import type { Metadata } from 'next';
import Link from 'next/link';
import NextImage from 'next/image';
import { Sparkles, Globe, Palette, Music, Share2, Users, Star, MessageCircle, ArrowRight, MapPin, Calendar, QrCode, Clock, Image, Film, Smartphone, Heart, Upload, Gift, MessageSquare, Printer } from 'lucide-react';
import { ConsultationForm } from '@/components/ui/ConsultationForm';
import { BackgroundLayers } from '@/components/ui/BackgroundLayers';
import { PetalEffect } from '@/components/ui/PetalEffect';
import { FloatingPetals } from '@/components/ui/FloatingPetals';
import { BASE_URL } from '@/constants/baseUrl';

const title = 'Marinikah Invitation | Undangan Pernikahan Digital Premium';
const description = 'Buat undangan pernikahan digital dengan desain elegan, RSVP online, twibbon interaktif, galeri sinematik, dan personalisasi tamu. Praktis dibagikan, indah dikenang.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title,
    description,
    url: BASE_URL,
    siteName: 'Marinikah Invitation',
    type: 'website',
    locale: 'id_ID',
    images: [{ url: '/images/logo-1.jpeg', width: 1200, height: 630, alt: 'Marinikah Invitation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/logo-1.jpeg'],
  },
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

const FAQ_ITEMS = [
  { q: 'Berapa biaya membuat undangan di Marinikah Invitation?', a: 'Anda dapat berkonsultasi terlebih dahulu tanpa biaya. Sampaikan kebutuhan Anda melalui WhatsApp dan tim kami akan membantu menemukan solusi terbaik untuk hari istimewa Anda.' },
  { q: 'Berapa lama waktu yang dibutuhkan untuk membuat undangan?', a: 'Undangan Anda dapat siap dalam hitungan menit. Cukup lengkapi data pasangan, unggah foto, dan undangan Anda siap dibagikan.' },
  { q: 'Apakah tamu perlu mengunduh aplikasi?', a: 'Tidak. Undangan dapat dibuka langsung melalui peramban di perangkat apa pun. Cukup bagikan tautan, dan tamu langsung merasakan pengalaman lengkapnya.' },
  { q: 'Bisakah undangan diedit setelah dibagikan?', a: 'Tentu. Setiap perubahan yang Anda simpan akan langsung terlihat oleh tamu tanpa perlu membagikan ulang tautan.' },
  { q: 'Bagaimana cara membagikan undangan ke tamu?', a: 'Setiap tamu memiliki tautan unik yang dapat dikirim langsung melalui WhatsApp. Anda juga dapat mencetak QR code untuk dibagikan secara fisik.' },
  { q: 'Apakah ada batasan jumlah tamu?', a: 'Tidak ada batasan. Anda dapat mengundang sebanyak mungkin tamu sesuai kebutuhan pernikahan Anda.' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Marinikah Invitation',
  url: BASE_URL,
  description,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR', description: 'Konsultasi gratis' },
  provider: {
    '@type': 'Organization',
    name: 'Marinikah Invitation',
    url: BASE_URL,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BackgroundLayers />

      {/* ── Hero ── */}
      <section className="relative min-h-screen-safe flex flex-col items-start sm:items-center justify-center px-6 py-12 sm:py-16 bg-ink text-ivory overflow-hidden overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <PetalEffect />

        <div className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[15%] right-[5%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(248,187,208,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-96 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.05) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg mx-auto text-center space-y-4 sm:space-y-6">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-ivory leading-tight font-bold italic">
            Satu Tautan untuk Hari yang Tak Terlupakan
          </h1>
          <p className="font-serif italic text-sm sm:text-lg text-ivory/45 max-w-md mx-auto leading-relaxed">
            Hadirkan momen pernikahan Anda dalam pengalaman digital yang elegan, personal, dan penuh cerita. Dirancang untuk terasa hangat, indah, dan berkesan bagi setiap tamu yang membuka.
          </p>

          {/* Phone mockup */}
          <div className="relative flex justify-center pt-2 sm:pt-4 pb-2">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] sm:w-[260px] aspect-square border border-gold/10 rounded-full animate-[spin_45s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] aspect-square border border-ivory/5 rounded-full animate-[spin_60s_linear_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-48 h-48 sm:h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.15) 0%, transparent 70%)' }} />

            <Link
              href="/dani-marini?to=Tamu+Spesial"
              className="relative block w-[120px] sm:w-[170px] rounded-[14px] sm:rounded-[20px] overflow-hidden border-2 border-ivory/15 shadow-2xl shadow-gold/20 hover:scale-[1.03] hover:border-gold/30 transition-all duration-500 aspect-[9/16]"
            >
              <iframe
                src="/dani-marini?to=Tamu+Spesial"
                title="Demo undangan"
                className="absolute top-0 left-0 w-[375px] h-[667px] origin-top-left pointer-events-none scale-[0.32] sm:scale-[0.453]"
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

      {/* ── About ── */}
      <section className="px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Tentang Kami</p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink mb-4">
            Berawal dari satu pertanyaan sederhana
          </h2>
          <p className="font-serif italic text-sm text-ink/45 leading-relaxed">
            Bagaimana jika undangan pernikahan bisa terasa seindah hari pernikahan itu sendiri? Dari pertanyaan itulah Marinikah Invitation hadir, dibangun dengan hati oleh pasangan yang percaya bahwa undangan bukan sekadar informasi, tetapi bagian dari cerita cinta itu sendiri. Dirancang untuk pasangan yang ingin menyampaikan kisah mereka dengan cara yang lebih bermakna.
          </p>
        </div>
      </section>

      {/* ── Strengths ── */}
      <section className="relative px-6 py-12 overflow-hidden">
        <FloatingPetals />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="text-center mb-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Mengapa Marinikah Invitation?</p>
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
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Dirancang untuk<br />Hari Istimewa Anda</p>
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

      {/* ── FAQ ── */}
      <section className="px-6 py-12">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Pertanyaan Umum</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Hal yang sering ditanyakan
            </h2>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="border border-gold/10 rounded-xl overflow-hidden group">
                <summary className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-ink cursor-pointer hover:bg-gold/5 transition-colors flex items-center justify-between">
                  <span>{q}</span>
                  <span className="text-gold/40 text-lg leading-none ml-3 flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-3 border-t border-gold/5">
                  <p className="font-serif italic text-xs text-ink/45 leading-relaxed pt-3">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultation ── */}
      <section className="relative px-6 py-14 overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.08) 0%, transparent 70%)' }} />

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
          <div className="flex justify-center mb-3">
            <NextImage src="/images/logo-1.jpeg" alt="Marinikah Invitation" width={180} height={90} className="opacity-80 w-[140px] sm:w-[180px] h-auto" />
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
          <p className="text-[9px] text-ink/25 text-center">&copy; {new Date().getFullYear()} Marinikah Invitation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
