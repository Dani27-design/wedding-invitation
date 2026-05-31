import type { Metadata } from "next";
import Link from "next/link";
import NextImage from "next/image";
import {
  Sparkles,
  Globe,
  Palette,
  Music,
  Share2,
  Users,
  Star,
  MessageCircle,
  ArrowRight,
  MapPin,
  Calendar,
  QrCode,
  Clock,
  Image,
  Film,
  Smartphone,
  Heart,
  Upload,
  Gift,
  MessageSquare,
  Printer,
} from "lucide-react";
import { ConsultationForm } from "@/components/ui/ConsultationForm";
import { GalleryShowcase } from "@/components/ui/GalleryShowcase";
import { BackgroundLayers } from "@/components/ui/BackgroundLayers";
import { PetalEffect } from "@/components/ui/PetalEffect";
import { FloatingPetals } from "@/components/ui/FloatingPetals";
import { TestimonialSection } from "@/components/ui/TestimonialSection";
import { BASE_URL } from "@/constants/baseUrl";

const title = "Marinikah Invitation | Undangan Pernikahan Digital Premium";
const description =
  "Buat undangan pernikahan digital dengan desain elegan, RSVP online, twibbon interaktif, galeri sinematik, dan personalisasi tamu. Praktis dibagikan, indah dikenang.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title,
    description,
    url: BASE_URL,
    siteName: "Marinikah Invitation",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/images/logo-1.png",
        width: 1200,
        height: 630,
        alt: "Marinikah Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/logo-1.png"],
  },
};

const FEATURE_GROUPS = [
  {
    label: "Pengalaman Tamu",
    items: [
      { icon: Music, title: "Musik latar yang menyatu dengan suasana" },
      { icon: Share2, title: "Sambutan nama tamu secara personal" },
      { icon: Film, title: "Cerita cinta dengan tampilan multi-slide" },
      { icon: Heart, title: "Like dan komentar real-time ala media sosial" },
      { icon: Sparkles, title: "Twibbon interaktif untuk dibagikan tamu" },
      { icon: Clock, title: "Hitung mundur menuju hari pernikahan" },
      { icon: MessageSquare, title: "Ucapan dan konfirmasi kehadiran online" },
      { icon: Image, title: "Galeri foto mosaik yang dinamis" },
      { icon: MapPin, title: "Peta lokasi dan integrasi kalender" },
      { icon: Gift, title: "Amplop digital sekali ketuk" },
      { icon: Globe, title: "Responsif di semua perangkat" },
      { icon: Smartphone, title: "Navigasi mengambang yang nyaman digunakan" },
    ],
  },
  {
    label: "Pengelolaan Undangan",
    items: [
      { icon: Users, title: "Kelola data pasangan dan galeri foto" },
      { icon: Calendar, title: "Atur detail acara dan susunan acara" },
      { icon: Upload, title: "Upload musik, foto, dan video dengan mudah" },
      { icon: Palette, title: "Pilihan tema warna siap pakai" },
      { icon: Users, title: "Manajemen daftar tamu dan RSVP" },
      { icon: Printer, title: "QR code check-in tamu dengan desain elegan" },
      { icon: Share2, title: "Bagikan undangan langsung ke WhatsApp" },
      { icon: MessageCircle, title: "Moderasi komentar dan ucapan tamu" },
      { icon: Globe, title: "Pratinjau undangan secara real-time" },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Berapa biaya membuat undangan di Marinikah Invitation?",
    a: "Anda dapat berkonsultasi terlebih dahulu tanpa biaya. Sampaikan kebutuhan Anda melalui WhatsApp dan tim kami akan membantu menemukan solusi terbaik untuk hari istimewa Anda.",
  },
  {
    q: "Berapa lama waktu yang dibutuhkan untuk membuat undangan?",
    a: "Undangan Anda dapat siap dalam hitungan menit. Cukup lengkapi data pasangan, unggah foto, dan undangan Anda siap dibagikan.",
  },
  {
    q: "Apakah tamu perlu mengunduh aplikasi?",
    a: "Tidak. Undangan dapat dibuka langsung melalui peramban di perangkat apa pun. Cukup bagikan tautan, dan tamu langsung merasakan pengalaman lengkapnya.",
  },
  {
    q: "Bisakah undangan diedit setelah dibagikan?",
    a: "Tentu. Setiap perubahan yang Anda simpan akan langsung terlihat oleh tamu tanpa perlu membagikan ulang tautan.",
  },
  {
    q: "Bagaimana cara membagikan undangan ke tamu?",
    a: "Setiap tamu memiliki tautan unik yang dapat dikirim langsung melalui WhatsApp. Anda juga dapat mencetak QR code untuk dibagikan secara fisik.",
  },
  {
    q: "Apakah ada batasan jumlah tamu?",
    a: "Tidak ada batasan. Anda dapat mengundang sebanyak mungkin tamu sesuai kebutuhan pernikahan Anda.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Marinikah Invitation",
  url: BASE_URL,
  description,
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IDR",
    description: "Konsultasi gratis",
  },
  provider: {
    "@type": "Organization",
    name: "Marinikah Invitation",
    url: BASE_URL,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BackgroundLayers />

      {/* ── Hero ── */}
      <section className="relative min-h-screen-safe flex flex-col items-start sm:items-center justify-center px-6 py-3 bg-ink text-ivory overflow-hidden overflow-y-auto rounded-b-3xl">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <PetalEffect />

        <div
          className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(180,141,62,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[15%] right-[5%] w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(248,187,208,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[60%] left-1/2 -translate-x-1/2 w-96 h-40 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(180,141,62,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-lg lg:max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Text content — left on desktop, full-width on mobile */}
          <div className="text-center lg:text-left space-y-5 sm:space-y-6 lg:flex-1">
            <NextImage
              src="/images/logo-1.png"
              alt="Marinikah Invitation"
              width={120}
              height={30}
              priority
              className="mx-auto lg:mx-0 my-0 p-0"
            />
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-ivory leading-tight font-bold italic">
              Sebuah Cerita untuk Hari yang Tak Terlupakan
            </h1>
            <p className="italic text-sm text-ivory/60 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Hadirkan momen pernikahan dalam pengalaman digital yang aesthetic.
              <br></br>Dirancang untuk terasa hangat, indah, dan berkesan bagi
              setiap tamu yang membuka.
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
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 h-60 sm:h-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(180,141,62,0.15) 0%, transparent 70%)",
              }}
            />

            <div
              className="relative w-[210px] sm:w-[240px] lg:w-[280px] [--iframe-scale:0.51] sm:[--iframe-scale:0.585] lg:[--iframe-scale:0.683]"
              style={{ aspectRatio: "320/660" }}
            >
              {/* SVG frame overlay */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/iphone-frame.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-2xl"
              />
              {/* Screen content area — positioned inside the SVG screen cutout */}
              <div
                className="absolute flex flex-col overflow-hidden"
                style={{
                  top: "2.1%",
                  left: "4.4%",
                  width: "91.2%",
                  height: "95.8%",
                  borderRadius: "13.1% / 6.4%",
                }}
              >
                {/* Status bar */}
                <div className="shrink-0 bg-[#1C1C1E] flex items-end justify-between px-3 py-2 relative z-10 lg:py-2.5 px-5">
                  <span className="text-[7px] text-white font-bold leading-none">
                    9:41
                  </span>
                  <div className="w-14" />
                  <div className="flex items-center gap-[2px]">
                    <svg
                      className="w-[11px] h-[7px]"
                      viewBox="0 0 17 10"
                      fill="white"
                    >
                      <rect
                        x="0"
                        y="6"
                        width="3"
                        height="4"
                        rx="0.5"
                        opacity="0.4"
                      />
                      <rect
                        x="4.5"
                        y="4"
                        width="3"
                        height="6"
                        rx="0.5"
                        opacity="0.4"
                      />
                      <rect x="9" y="2" width="3" height="8" rx="0.5" />
                      <rect x="13.5" y="0" width="3" height="10" rx="0.5" />
                    </svg>
                    <svg
                      className="w-[9px] h-[7px]"
                      viewBox="0 0 16 12"
                      fill="white"
                    >
                      <path
                        d="M8 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
                        transform="translate(0,-2)"
                      />
                      <path
                        d="M4.5 8.5a5 5 0 0 1 7 0"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M2 5.5a8.5 8.5 0 0 1 12 0"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex items-center gap-[1px]">
                      <div className="w-[14px] h-[7px] border border-white/60 rounded-[2px] p-[0.5px]">
                        <div className="w-[75%] h-full bg-white rounded-[1px]" />
                      </div>
                      <div className="w-[1px] h-[2.5px] bg-white/60 rounded-full" />
                    </div>
                  </div>
                </div>
                {/* Iframe */}
                <div className="relative flex-1 overflow-hidden">
                  <iframe
                    src="/putra-putri?to=Tamu+Spesial"
                    title="Demo undangan"
                    className="absolute top-0 left-0 border-0"
                    style={{ width: 378, height: 700, transform: 'scale(var(--iframe-scale))', transformOrigin: '0 0' }}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
                {/* Safari bottom bar */}
                <div className="shrink-0 bg-[#1C1C1E] relative z-10 pt-1 pb-0.5">
                  <div className="flex items-center gap-1 px-2 pb-1">
                    <div className="flex-1 flex items-center justify-between bg-[#3A3A3C] rounded-md px-1.5 py-[3px]">
                      <span className="text-[7px] text-white/70 font-bold shrink-0">
                        A<span className="text-[5px]">A</span>
                      </span>
                      <div className="w-fit flex flex-row items-center justify-center">
                        <svg
                          className="w-[5px] h-[5px] text-[#8E8E93] shrink-0 mr-0.5"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 2a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1V6a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2H6V6z" />
                        </svg>
                        <span className="text-[6px] text-white/80 truncate font-medium">
                          {BASE_URL.replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                      <svg
                        className="w-[7px] h-[7px] text-white/50 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M21 12a9 9 0 11-3-6.7" />
                        <polyline points="21 3 21 9 15 9" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-around px-3 pt-0.5 pb-2">
                    {/* Back */}
                    <svg className="w-[9px] h-[9px] text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    {/* Forward */}
                    <svg className="w-[9px] h-[9px] text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    {/* Share */}
                    <svg className="w-[9px] h-[9px] text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v6a2 2 0 002 2h12a2 2 0 002-2v-6" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="16" /></svg>
                    {/* Bookmarks (open book) */}
                    <svg className="w-[9px] h-[9px] text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z" /><path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z" /></svg>
                    {/* Tabs (two overlapping squares) */}
                    <svg className="w-[9px] h-[9px] text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="15" height="15" rx="2" /><path d="M7 2h13a2 2 0 012 2v13" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="p-6">
        <div className="max-w-md lg:max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
            Tentang Kami
          </p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink mb-4">
            Berawal dari satu pertanyaan sederhana
          </h2>
          <p className="font-base text-sm text-ink/80 leading-relaxed">
            "Bagaimana jika undangan pernikahan bisa terasa seindah hari
            pernikahan itu sendiri?"<br></br>Dari pertanyaan itulah Marinikah
            Wedding Invitation hadir, dibangun dengan hati oleh pasangan yang
            percaya bahwa undangan bukan sekadar informasi, tetapi bagian dari
            cerita cinta itu sendiri.<br></br>Dirancang untuk pasangan yang
            ingin menyampaikan kisah mereka dengan cara yang lebih bermakna.
          </p>
        </div>
      </section>

      {/* ── Strengths ── */}
      <section className="relative p-6 overflow-hidden">
        <FloatingPetals />

        <div className="relative z-10 max-w-lg lg:max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
              Mengapa Marinikah Invitation?
            </p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Bukan sekadar undangan, tetapi pengalaman yang hidup
            </h2>
          </div>

          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            {[
              {
                color: "from-gold/30 to-gold/5",
                title: "Kisah cinta yang terasa lebih hangat",
                desc: "Cerita perjalanan Anda hadir dalam tampilan sinematik lengkap dengan foto, video, komentar, dan interaksi yang membuat setiap momen terasa lebih personal.",
              },
              {
                color: "from-rose-pastel/40 to-rose-pastel/5",
                title: "Twibbon aesthetic untuk setiap tamu",
                desc: "Biarkan tamu membuat dan membagikan twibbon mereka sendiri secara langsung. Geser, atur, lalu bagikan ke media sosial dalam hitungan detik.",
              },
              {
                color: "from-gold/30 to-gold/5",
                title: "Galeri dengan layout aesthetic secara otomatis",
                desc: "Setiap foto ditampilkan dalam komposisi mosaik yang artistik dan responsif, menciptakan kesan galeri modern tanpa perlu pengaturan manual.",
              },
              {
                color: "from-rose-pastel/40 to-rose-pastel/5",
                title: "Ucapan dan RSVP yang praktis dan elegan",
                desc: "Tamu dapat mengirimkan ucapan dan konfirmasi kehadiran mereka secara langsung melalui platform yang mudah digunakan. Cepat, nyaman, dan tetap terasa premium.",
              },
              {
                color: "from-gold/30 to-gold/5",
                title: "Panel admin yang lengkap dan mudah digunakan",
                desc: "Kelola data pasangan, cerita cinta, galeri, RSVP, QR tamu, komentar, hingga tema undangan dalam satu dashboard yang praktis.",
              },
            ].map(({ color, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div
                  className={`w-1 rounded-full bg-gradient-to-b ${color} flex-shrink-0`}
                />
                <div className="py-1">
                  <p className="text-md font-serif font-semibold text-gold-contrast mb-0.5">
                    {title}
                  </p>
                  <p className="text-sm text-ink/70 leading-relaxed font-base">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="p-6 bg-paper border-y border-gold/10">
        <div className="max-w-2xl lg:max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
              Dirancang untuk Hari Istimewa Anda
            </p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Hadirkan suasana dan kebahagiaan dalam satu pengalaman digital
            </h2>
          </div>

          <div className="space-y-8">
            {FEATURE_GROUPS.map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-4">
                  {label}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {items.map(({ icon: Icon, title }) => (
                    <div
                      key={title}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/70 hover:bg-white hover:shadow-md hover:shadow-gold/5 hover:-translate-y-0.5 transition-all duration-300 text-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <span className="text-[10px] text-ink/70 leading-tight">
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Showcase ── */}
      <section id="gallery" className="p-6 scroll-mt-4">
        <div className="max-w-2xl lg:max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
              pratinjau
            </p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Sekilas pengalaman yang akan dirasakan tamu Anda
            </h2>
          </div>

          <GalleryShowcase
            groups={[
              {
                label: "Undangan Digital",
                phoneFrame: true,
                items: [
                  {
                    src: "/images/admin-landing/invitation-hero-preview.png",
                    alt: "Halaman utama undangan",
                  },
                  {
                    src: "/images/admin-landing/invitation-couple-preview.png",
                    alt: "Profil pasangan",
                  },
                  {
                    src: "/images/admin-landing/invitation-story-preview.png",
                    alt: "Cerita cinta",
                  },
                  {
                    src: "/images/admin-landing/invitation-event-preview.png",
                    alt: "Detail acara",
                  },
                  {
                    src: "/images/admin-landing/invitation-twibbon-preview.png",
                    alt: "Twibbon tamu",
                  },
                  {
                    src: "/images/admin-landing/invitation-ucapan-preview.png",
                    alt: "Ucapan tamu",
                  },
                  {
                    src: "/images/admin-landing/invitation-rsvp-preview.png",
                    alt: "RSVP dan ucapan",
                  },
                  {
                    src: "/images/admin-landing/invitation-gallery-preview.png",
                    alt: "Galeri foto",
                  },
                ],
              },
              {
                label: "Panel Admin",
                phoneFrame: true,
                items: [
                  {
                    src: "/images/admin-landing/admin-form-event.png",
                    alt: "Kelola acara",
                  },
                  {
                    src: "/images/admin-landing/admin-form-story.png",
                    alt: "Kelola cerita",
                  },
                  {
                    src: "/images/admin-landing/admin-form-theme.png",
                    alt: "Pilih tema",
                  },
                  {
                    src: "/images/admin-landing/admin-guest.png",
                    alt: "Daftar tamu",
                  },
                  {
                    src: "/images/admin-landing/admin-guest-qrcode.png",
                    alt: "QR code tamu",
                  },
                  {
                    src: "/images/admin-landing/admin-form-guest.png",
                    alt: "Kelola tamu",
                  },
                  {
                    src: "/images/admin-landing/admin-login.png",
                    alt: "Halaman masuk",
                  },
                ],
              },
            ]}
          />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialSection />

      {/* ── FAQ ── */}
      <section className="p-6">
        <div className="max-w-lg lg:max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold-contrast font-black mb-2">
              FaQ
            </p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
              Hal yang sering ditanyakan
            </h2>
          </div>

          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="border border-gold/10 rounded-xl overflow-hidden group"
              >
                <summary className="px-3 sm:px-4 py-3 text-sm italic text-ink cursor-pointer hover:bg-gold/5 transition-colors flex items-center justify-between">
                  <span>{q}</span>
                  <span className="text-gold/40 text-lg leading-none ml-3 flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-4 pb-3 border-t border-gold/5">
                  <p className="font-base text-sm text-gold-contrast leading-relaxed pt-3">
                    {a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultation ── */}
      <section className="relative p-6 overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(180,141,62,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-lg lg:max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Text — left on desktop */}
          <div className="text-center lg:text-left space-y-4 lg:flex-1 mb-6 lg:mb-0">
            <p className="text-xs uppercase tracking-[0.4em] text-gold font-black">
              Konsultasi Gratis
            </p>
            <h2 className="font-display italic text-2xl sm:text-3xl text-ivory font-bold">
              Wujudkan undangan digital anda yang benar-benar berkesan
            </h2>
            <p className="font-base italic text-md text-ivory/80 leading-relaxed max-w-sm mx-auto lg:mx-0">
              Ada pertanyaan atau ingin berdiskusi? Sampaikan melalui WhatsApp
              dan tim kami akan segera membantu.
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
      <footer className="p-6 border-t border-gold/5">
        <div className="max-w-lg lg:max-w-5xl mx-auto">
          {/* Mobile: stacked centered / Desktop: horizontal row */}
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            {/* Logo */}
            <NextImage
              src="/images/logo-1.png"
              alt="Marinikah Invitation"
              width={180}
              height={90}
              className="opacity-80 w-[120px] sm:w-[140px] h-auto"
            />

            {/* Nav */}
            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="px-4 py-1.5 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-ink/60 font-bold hover:border-gold hover:text-gold transition-colors"
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="px-4 py-1.5 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-ink/60 font-bold hover:border-gold hover:text-gold transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/putra-putri"
                className="px-4 py-1.5 border border-gold/20 rounded-full text-[10px] uppercase tracking-widest text-ink/60 font-bold hover:border-gold hover:text-gold transition-colors"
              >
                Coba
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-[12px] text-ink/70">
                &copy; {new Date().getFullYear()} Marinikah Wedding Invitation
              </p>
              <p className="text-[12px] text-ink/50 font-serif italic">
                Build with Love by Marini & Dani
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
