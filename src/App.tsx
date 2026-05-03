import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, FormEvent } from 'react';
import { AnimatePresence } from 'motion/react';
import { GuestWishes } from './types';
import { SEED_WISHES } from './constants/wishes';
import { BackgroundLayers } from './components/ui/BackgroundLayers';
import { CinematicOpening } from './components/sections/CinematicOpening';

const HeroSection = lazy(() => import('./components/sections/HeroSection').then(m => ({ default: m.HeroSection })));
const CoupleSection = lazy(() => import('./components/sections/CoupleSection').then(m => ({ default: m.CoupleSection })));
const CinematicStory = lazy(() => import('./components/sections/CinematicStory').then(m => ({ default: m.CinematicStory })));
const EventSection = lazy(() => import('./components/sections/EventSection').then(m => ({ default: m.EventSection })));
const TwibbonSection = lazy(() => import('./components/sections/TwibbonSection').then(m => ({ default: m.TwibbonSection })));
const RSVPSection = lazy(() => import('./components/sections/RSVPSection').then(m => ({ default: m.RSVPSection })));
const DigitalEnvelope = lazy(() => import('./components/sections/DigitalEnvelope').then(m => ({ default: m.DigitalEnvelope })));
const PhotoGallery = lazy(() => import('./components/sections/PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const Footer = lazy(() => import('./components/sections/Footer').then(m => ({ default: m.Footer })));
const FloatingController = lazy(() => import('./components/features/FloatingController').then(m => ({ default: m.FloatingController })));
const RSVPModal = lazy(() => import('./components/features/RSVPModal').then(m => ({ default: m.RSVPModal })));
const PhotoZoomModal = lazy(() => import('./components/ui/PhotoZoomModal').then(m => ({ default: m.PhotoZoomModal })));

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [wishes, setWishes] = useState<GuestWishes[]>(SEED_WISHES);
  const [guestName, setGuestName] = useState('Tamu Terkasih Kami');
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
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
      try {
        setGuestName(decodeURIComponent(to).replace(/-/g, ' ').slice(0, 100));
      } catch { /* malformed URI — keep default guest name */ }
    }
  }, []);

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

  const handleRSVPSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const message = (formData.get('message') as string).trim();
    if (!name || !message) return;
    const newWish: GuestWishes = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      message,
      attendance: formData.get('attendance') as 'yes' | 'no',
      createdAt: Date.now(),
    };
    setWishes(prev => [newWish, ...prev]);
    setCurrentPage(1);
    setIsSubmitSuccess(true);
    e.currentTarget.reset();
    submitTimerRef.current = setTimeout(() => {
      setIsRSVPModalOpen(false);
      setIsSubmitSuccess(false);
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans overflow-x-hidden">
      <BackgroundLayers />
      <audio ref={audioRef} loop preload="none" src="/musics/adele-make-you-feel-my-love.mp3" />

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
          <CinematicStory />
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
  );
}
