import type { Metadata } from 'next';
import Link from 'next/link';
import NextImage from 'next/image';
import { Sparkles, Globe, Palette, Music, Share2, Users, Star, MessageCircle, ArrowRight, MapPin, Calendar, QrCode, Clock, Image, Film, Smartphone, Heart, Upload, Gift, MessageSquare, Printer } from 'lucide-react';
import { ConsultationForm } from '@/components/ui/ConsultationForm';
import { GalleryShowcase } from '@/components/ui/GalleryShowcase';
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
    images: [{ url: '/images/logo-1.png', width: 1200, height: 630, alt: 'Marinikah Invitation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/logo-1.png'],
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
      <section className="relative min-h-screen-safe flex flex-col items-start sm:items-center justify-center px-6 py-3 bg-ink text-ivory overflow-hidden overflow-y-auto rounded-b-3xl">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <PetalEffect />

        <div className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[15%] right-[5%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(248,187,208,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-96 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.05) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg lg:max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Text content — left on desktop, full-width on mobile */}
          <div className="text-center lg:text-left space-y-4 sm:space-y-6 lg:flex-1">
            <NextImage src="/images/logo-1.png" alt="Marinikah Invitation" width={120} height={30} className="mx-auto lg:mx-0 my-0 p-0" />
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-ivory leading-tight font-bold italic">
              Sebuah Cerita untuk Hari yang Tak Terlupakan
            </h1>
            <p className="font-serif italic text-lg text-ivory/60 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Hadirkan momen pernikahan Anda dalam pengalaman digital yang elegan, personal, dan penuh cerita. Dirancang untuk terasa hangat, indah, dan berkesan bagi setiap tamu yang membuka.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
              >
                Mulai Membuat
              </Link>
              <a
                href="#gallery"
                className="group px-8 py-3 border border-ivory/30 text-ivory/80 rounded-full text-xs uppercase tracking-[0.2em] font-black hover:border-gold hover:text-gold transition-colors flex items-center gap-2"
              >
                Lihat Contoh
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Phone mockup — right on desktop, below text on mobile */}
          <div className="relative flex justify-center pt-4 sm:pt-6 lg:pt-0 pb-2 lg:flex-shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[340px] aspect-square border border-gold/10 rounded-full animate-[spin_45s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[290px] sm:w-[380px] aspect-square border border-ivory/5 rounded-full animate-[spin_60s_linear_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 h-60 sm:h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.15) 0%, transparent 70%)' }} />

            <div className="relative block w-[200px] sm:w-[240px] lg:w-[220px] rounded-[22px] sm:rounded-[26px] overflow-hidden border-2 border-ivory/15 shadow-2xl shadow-gold/20 aspect-[9/16]">
              <iframe
                src="/dani-marini?to=Tamu+Spesial"
                title="Demo undangan"
                className="absolute top-0 left-0 w-[375px] h-[667px] origin-top-left pointer-events-none scale-[0.533] sm:scale-[0.64] lg:scale-[0.587]"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
              <div className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-br from-ivory/10 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="px-6 py-12">
        <div className="max-w-md lg:max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Tentang Kami</p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink mb-4">
            Berawal dari satu pertanyaan sederhana
          </h2>
          <p className="font-serif italic text-lg text-ink/60 leading-relaxed">
            "Bagaimana jika undangan pernikahan bisa terasa seindah hari pernikahan itu sendiri?"<br></br>Dari pertanyaan itulah Marinikah Wedding Invitation hadir, dibangun dengan hati oleh pasangan yang percaya bahwa undangan bukan sekadar informasi, tetapi bagian dari cerita cinta itu sendiri.<br></br>Dirancang untuk pasangan yang ingin menyampaikan kisah mereka dengan cara yang lebih bermakna.
          </p>
        </div>
      </section>

      {/* ── Strengths ── */}
      <section className="relative px-6 py-12 overflow-hidden">
        <FloatingPetals />

        <div className="relative z-10 max-w-lg lg:max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Mengapa Marinikah Invitation?</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Bukan sekadar undangan, tetapi pengalaman yang hidup
            </h2>
          </div>

          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
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
                  <p className="text-md font-serif font-semibold text-gold-contrast mb-0.5">{title}</p>
                  <p className="text-md text-ink/60 leading-relaxed font-serif italic">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-12 bg-paper border-y border-gold/10">
        <div className="max-w-2xl lg:max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">Dirancang untuk Hari Istimewa Anda</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Hadirkan suasana dan kebahagiaan dalam satu pengalaman digital
            </h2>
          </div>

          <div className="space-y-8">
            {FEATURE_GROUPS.map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-4">{label}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {items.map(({ icon: Icon, title }) => (
                    <div key={title} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/70 hover:bg-white hover:shadow-md hover:shadow-gold/5 hover:-translate-y-0.5 transition-all duration-300 text-center">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <span className="text-[10px] text-ink/70 leading-tight">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Showcase ── */}
      <section id="gallery" className="px-6 py-12 scroll-mt-4">
        <div className="max-w-2xl lg:max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">pratinjau</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Sekilas pengalaman yang akan dirasakan tamu Anda
            </h2>
          </div>

          <GalleryShowcase groups={[
            {
              label: 'Undangan Digital',
              items: [
                { src: '/images/admin-landing/invitation-hero-preview.png', alt: 'Halaman utama undangan' },
                { src: '/images/admin-landing/invitation-couple-preview.png', alt: 'Profil pasangan' },
                { src: '/images/admin-landing/invitation-story-preview.png', alt: 'Cerita cinta' },
                { src: '/images/admin-landing/invitation-event-preview.png', alt: 'Detail acara' },
                { src: '/images/admin-landing/invitation-twibbon-preview.png', alt: 'Twibbon tamu' },
                { src: '/images/admin-landing/invitation-rsvp-preview.png', alt: 'RSVP dan ucapan' },
              ],
            },
            {
              label: 'Panel Admin',
              items: [
                { src: '/images/admin-landing/admin-form-event.png', alt: 'Kelola acara' },
                { src: '/images/admin-landing/admin-form-story.png', alt: 'Kelola cerita' },
                { src: '/images/admin-landing/admin-form-theme.png', alt: 'Pilih tema' },
                { src: '/images/admin-landing/admin-guest.png', alt: 'Daftar tamu' },
                { src: '/images/admin-landing/admin-guest-qrcode.png', alt: 'QR code tamu' },
                { src: '/images/admin-landing/admin-form-guest.png', alt: 'Kelola tamu' },
                { src: '/images/admin-landing/admin-login.png', alt: 'Halaman masuk' },
              ],
            },
          ]} />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-8">
        <div className="max-w-lg lg:max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">FaQ</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Hal yang sering ditanyakan
            </h2>
          </div>

          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="border border-gold/10 rounded-xl overflow-hidden group">
                <summary className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-ink cursor-pointer hover:bg-gold/5 transition-colors flex items-center justify-between">
                  <span>{q}</span>
                  <span className="text-gold/40 text-lg leading-none ml-3 flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-3 border-t border-gold/5">
                  <p className="font-serif text-sm text-ink/80 leading-relaxed pt-3">{a}</p>
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

        <div className="relative z-10 max-w-lg lg:max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Text — left on desktop */}
          <div className="text-center lg:text-left space-y-4 lg:flex-1 mb-6 lg:mb-0">
            <p className="text-xs uppercase tracking-[0.4em] text-gold font-black">Konsultasi Gratis</p>
            <h2 className="font-display italic text-2xl sm:text-3xl text-ivory font-bold">
              Wujudkan undangan digital anda yang benar-benar berkesan
            </h2>
            <p className="font-serif italic text-lg text-ivory/80 leading-relaxed max-w-sm mx-auto lg:mx-0">
              Ada pertanyaan atau ingin berdiskusi? Sampaikan melalui WhatsApp dan tim kami akan segera membantu.
            </p>
          </div>

          {/* Form — right on desktop */}
          <div className="lg:w-[400px] lg:flex-shrink-0 space-y-4">
            <ConsultationForm />
            <div className="flex items-center gap-3 justify-center lg:justify-start pt-1">
              <span className="text-xs text-ivory/50">atau langsung</span>
              <Link
                href="/register"
                className="text-xs text-gold font-black uppercase tracking-widest hover:underline underline-offset-4"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-6 border-t border-gold/5">
        <div className="max-w-lg lg:max-w-5xl mx-auto">
          {/* Mobile: stacked centered / Desktop: horizontal row */}
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            {/* Logo */}
            <NextImage src="/images/logo-1.png" alt="Marinikah Invitation" width={180} height={90} className="opacity-80 w-[120px] sm:w-[140px] h-auto" />

            {/* Nav */}
            <div className="flex items-center gap-2">
              <Link href="/register" className="px-4 py-1.5 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-ink/60 font-bold hover:border-gold hover:text-gold transition-colors">Daftar</Link>
              <Link href="/login" className="px-4 py-1.5 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-ink/60 font-bold hover:border-gold hover:text-gold transition-colors">Masuk</Link>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-[12px] text-ink/70">&copy; {new Date().getFullYear()} Marinikah Wedding Invitation</p>
              <p className="text-[12px] text-ink/50 font-serif italic">Build with Love by Marini & Dani</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
