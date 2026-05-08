import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { BackgroundLayers } from '../components/ui/BackgroundLayers';
import { CinematicOpening } from '../components/sections/CinematicOpening';
import { HeroSection } from '../components/sections/HeroSection';
import { useWishes } from '../hooks/useWishes';
import { useWedding } from '../hooks/useWedding';
import { WeddingContext } from '../context/WeddingContext';
import { addWish } from '../lib/wishes';
import { deriveMetaTitle, deriveDateShort, deriveDateDisplay } from '../utils/weddingDerived';
import { THEME_DEFAULTS } from '../constants/themeDefaults';

// ... (keep the rest of the imports for lazy components)

const CoupleSection = lazy(() => import('../components/sections/CoupleSection').then(m => ({ default: m.CoupleSection })));
const CinematicStory = lazy(() => import('../components/sections/CinematicStory').then(m => ({ default: m.CinematicStory })));
const EventSection = lazy(() => import('../components/sections/EventSection').then(m => ({ default: m.EventSection })));
const TwibbonSection = lazy(() => import('../components/sections/TwibbonSection').then(m => ({ default: m.TwibbonSection })));
const RSVPSection = lazy(() => import('../components/sections/RSVPSection').then(m => ({ default: m.RSVPSection })));
const DigitalEnvelope = lazy(() => import('../components/sections/DigitalEnvelope').then(m => ({ default: m.DigitalEnvelope })));
const PhotoGallery = lazy(() => import('../components/sections/PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const Footer = lazy(() => import('../components/sections/Footer').then(m => ({ default: m.Footer })));
const FloatingController = lazy(() => import('../components/features/FloatingController').then(m => ({ default: m.FloatingController })));
const RSVPModal = lazy(() => import('../components/features/RSVPModal').then(m => ({ default: m.RSVPModal })));
const PhotoZoomModal = lazy(() => import('../components/ui/PhotoZoomModal').then(m => ({ default: m.PhotoZoomModal })));

export default function Wedding() {
  const { slug } = useParams<{ slug: string }>();
  const weddingSlug = slug ?? '';
  const { wedding, isLoading: isWeddingLoading } = useWedding(weddingSlug);
  const [isOpen, setIsOpen] = useState(false);
  const { wishes } = useWishes(weddingSlug);
  const [guestName, setGuestName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewportHeight = useRef(typeof window !== 'undefined' ? window.innerHeight : 667);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  const wishPages = useMemo(() => {
    const availableHeight = Math.floor(viewportHeight.current * 0.9);
    const pages: GuestWishes[][] = [];
    let currentPageWishes: GuestWishes[] = [];
    let currentHeight = 0;

    wishes.forEach((wish) => {
      const lines = Math.min(2, Math.max(1, Math.ceil(wish.message.length / 30)));
      const estimatedHeight = 58 + lines * 18;

      if (currentHeight + estimatedHeight > availableHeight && currentPageWishes.length > 0) {
        pages.push(currentPageWishes);
        currentPageWishes = [wish];
        currentHeight = estimatedHeight;
      } else {
        currentPageWishes.push(wish);
        currentHeight += estimatedHeight + 6;
      }
    });

    if (currentPageWishes.length > 0) pages.push(currentPageWishes);
    return pages;
  }, [wishes]);

  const currentWishes = wishPages[currentPage - 1] || [];
  const totalPages = wishPages.length;

  useEffect(() => {
    setCurrentPage(p => Math.min(p, Math.max(1, totalPages)));
  }, [totalPages]);

  useEffect(() => {
    if (!wedding?.heroImage) return;
    const img = new Image();
    img.src = wedding.heroImage;
  }, [wedding?.heroImage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
      try {
        setGuestName(decodeURIComponent(to).replace(/-/g, ' ').slice(0, 100));
      } catch { /* malformed URI — keep default guest name */ }
    } else {
      setGuestName(wedding?.defaultGuest ?? '');
    }
  }, [wedding?.defaultGuest]);

  useEffect(() => {
    if (!wedding) return;
    const dateShort = deriveDateShort(wedding.eventDate);
    const dateDisplay = deriveDateDisplay(wedding.eventDate);
    const title = deriveMetaTitle(wedding.groomNickname, wedding.brideNickname, dateShort);
    const description = `Turut mengundang Anda di hari bahagia kami — ${dateDisplay}, ${wedding.eventCity}`;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/${weddingSlug}`;
  }, [wedding, weddingSlug]);

  useEffect(() => {
    if (!wedding?.theme) return;
    const root = document.documentElement;
    const { colors, fonts } = wedding.theme;
    root.style.setProperty('--color-gold', colors.accent);
    root.style.setProperty('--color-ivory', colors.background);
    root.style.setProperty('--color-ink', colors.text);
    root.style.setProperty('--color-paper', colors.surface);
    root.style.setProperty('--color-sepia', colors.surface);
    root.style.setProperty('--color-rose-pastel', colors.button);
    root.style.setProperty('--font-serif', `"${fonts.heading}", serif`);
    root.style.setProperty('--font-sans', `"${fonts.body}", ui-sans-serif, system-ui, sans-serif`);
    root.style.setProperty('--font-display', `"${fonts.decorative}", serif`);
    root.style.setProperty('--font-dayland', `"${fonts.script}", cursive`);
  }, [wedding]);

  useEffect(() => {
    if (!wedding?.theme?.fonts) return;
    const { heading, body, decorative } = wedding.theme.fonts;
    const defaults = THEME_DEFAULTS.cinematic.fonts;
    if (heading === defaults.heading && body === defaults.body && decorative === defaults.decorative) return;
    const weights = 'ital,wght@0,400;0,500;0,700;0,900;1,400';
    const families = [heading, body, decorative]
      .filter(Boolean)
      .map(f => `family=${f.replace(/ /g, '+')}:${weights}`)
      .join('&');
    if (!families) return;
    const id = 'dynamic-google-fonts';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, [wedding]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, []);

  const handleCopy = useCallback(async (text: string, index: number) => {
    let success = false;
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch { /* both methods failed */ }
    }
    if (success) {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedIndex(index);
      copyTimerRef.current = setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  const handleRSVPSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const message = (formData.get('message') as string).trim();
    if (!name || !message) return;
    await addWish(weddingSlug, { name, message, attendance: formData.get('attendance') as 'yes' | 'no' });
    setCurrentPage(1);
    setIsSubmitSuccess(true);
    e.currentTarget.reset();
    submitTimerRef.current = setTimeout(() => {
      setIsRSVPModalOpen(false);
      setIsSubmitSuccess(false);
    }, 1500);
  }, [weddingSlug]);

  if (isWeddingLoading) {
    return <div className="min-h-screen bg-ivory" />;
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-dayland text-5xl text-ink mb-4">Undangan Tidak Ditemukan</h1>
        <p className="font-serif italic text-sm text-ink/60 mb-2">Halaman yang Anda cari tidak tersedia.</p>
        <p className="font-serif italic text-xs text-ink/40">Pastikan tautan undangan yang Anda terima sudah benar.</p>
      </div>
    );
  }

  return (
    <WeddingContext.Provider value={wedding}>
    <div className="min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans overflow-x-hidden">
      <BackgroundLayers />
      <audio ref={audioRef} loop preload="none" src={wedding?.musicUrl ?? ''} />

      <AnimatePresence mode="wait">
        {!isOpen && <CinematicOpening guestName={guestName} onOpen={handleOpen} />}
      </AnimatePresence>

      {isOpen && (
        <Suspense fallback={null}>
        <main className="relative z-10">
          <FloatingController
            isToolsOpen={isToolsOpen}
            setIsToolsOpen={setIsToolsOpen}
            isPlaying={isPlaying}
            toggleMusic={toggleMusic}
          />

          <HeroSection />
          <CoupleSection />
          <CinematicStory weddingSlug={weddingSlug} />
          <EventSection />
          <TwibbonSection />

          <RSVPSection
            wishes={wishes}
            currentWishes={currentWishes}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            onOpenRSVP={() => setIsRSVPModalOpen(true)}
          />

          <RSVPModal
            isOpen={isRSVPModalOpen}
            isSubmitSuccess={isSubmitSuccess}
            guestName={guestName}
            onClose={() => setIsRSVPModalOpen(false)}
            onSubmit={handleRSVPSubmit}
          />

          <DigitalEnvelope copiedIndex={copiedIndex} onCopy={handleCopy} />
          <PhotoGallery onSelectPhoto={setSelectedPhoto} />
          <Footer />
          <PhotoZoomModal selectedPhoto={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </main>
        </Suspense>
      )}
    </div>
    </WeddingContext.Provider>
  );
}
