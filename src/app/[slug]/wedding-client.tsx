'use client';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  FormEvent,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { BackgroundLayers } from '@/components/ui/BackgroundLayers';
import { CinematicOpening } from '@/components/sections/CinematicOpening';
import { HeroSection } from '@/components/sections/HeroSection';
import { CoupleSection } from '@/components/sections/CoupleSection';
import { useWishes } from '@/hooks/useWishes';
import { WeddingContext } from '@/context/WeddingContext';
import type { SerializedWedding } from '@/lib/serialize-wedding';
import type { GuestWishes } from '@/types';
const CinematicStory = lazy(() =>
  import('@/components/sections/CinematicStory').then((m) => ({
    default: m.CinematicStory,
  })),
);
const EventSection = lazy(() =>
  import('@/components/sections/EventSection').then((m) => ({
    default: m.EventSection,
  })),
);
const TwibbonSection = lazy(() =>
  import('@/components/sections/TwibbonSection').then((m) => ({
    default: m.TwibbonSection,
  })),
);
const RSVPSection = lazy(() =>
  import('@/components/sections/RSVPSection').then((m) => ({
    default: m.RSVPSection,
  })),
);
const DigitalEnvelope = lazy(() =>
  import('@/components/sections/DigitalEnvelope').then((m) => ({
    default: m.DigitalEnvelope,
  })),
);
const PhotoGallery = lazy(() =>
  import('@/components/sections/PhotoGallery').then((m) => ({
    default: m.PhotoGallery,
  })),
);
const Footer = lazy(() =>
  import('@/components/sections/Footer').then((m) => ({ default: m.Footer })),
);
const FloatingController = lazy(() =>
  import('@/components/features/FloatingController').then((m) => ({
    default: m.FloatingController,
  })),
);
const RSVPModal = lazy(() =>
  import('@/components/features/RSVPModal').then((m) => ({
    default: m.RSVPModal,
  })),
);
const PhotoZoomModal = lazy(() =>
  import('@/components/ui/PhotoZoomModal').then((m) => ({
    default: m.PhotoZoomModal,
  })),
);

interface WeddingClientProps {
  wedding: SerializedWedding;
  slug: string;
}

export function WeddingClient({ wedding, slug }: WeddingClientProps) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const { wishes, isLoading: isWishesLoading } = useWishes(slug, isOpen);
  const [guestName] = useState(() => {
    const to = searchParams.get('to');
    if (to) {
      try { return decodeURIComponent(to).replace(/-/g, ' ').slice(0, 100); } catch { /* malformed URI */ }
    }
    return wedding.defaultGuest ?? '';
  });
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
  const [viewportHeight, setViewportHeight] = useState(667);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setViewportHeight(window.innerHeight), 200);
    };
    setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  const wishPages = useMemo(() => {
    const availableHeight = Math.floor(viewportHeight * 0.9);
    const pages: GuestWishes[][] = [];
    let currentPageWishes: GuestWishes[] = [];
    let currentHeight = 0;

    wishes.forEach((wish) => {
      const lines = Math.min(
        2,
        Math.max(1, Math.ceil(wish.message.length / 30)),
      );
      const estimatedHeight = 58 + lines * 18;

      if (
        currentHeight + estimatedHeight > availableHeight &&
        currentPageWishes.length > 0
      ) {
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
  }, [wishes, viewportHeight]);

  const currentWishes = wishPages[currentPage - 1] || [];
  const totalPages = wishPages.length;

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, Math.max(1, totalPages)));
  }, [totalPages]);

  const handleOpenRSVP = useCallback(() => setIsRSVPModalOpen(true), []);
  const handleCloseRSVP = useCallback(() => setIsRSVPModalOpen(false), []);
  const handleClosePhoto = useCallback(() => setSelectedPhoto(null), []);

  const handleOpen = useCallback(() => {
    window.scrollTo(0, 0);
    setIsOpen(true);
    if (audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
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
      } catch {
        /* both methods failed */
      }
    }
    if (success) {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedIndex(index);
      copyTimerRef.current = setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  const handleRSVPSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const name = (formData.get('name') as string).trim();
      const message = (formData.get('message') as string).trim();
      if (!name || !message) return;
      try {
        const { addWish } = await import('@/lib/wishes');
        await addWish(slug, {
          name,
          message,
          attendance: formData.get('attendance') === 'no' ? 'no' : 'yes',
        });
      } catch {
        return; // Keep form open with data intact, user can retry
      }
      setCurrentPage(1);
      setIsSubmitSuccess(true);
      form.reset();
      submitTimerRef.current = setTimeout(() => {
        setIsRSVPModalOpen(false);
        setIsSubmitSuccess(false);
      }, 1500);
    },
    [slug],
  );

  return (
    <WeddingContext.Provider value={wedding}>
      <div className={`min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans overflow-x-hidden ${!isOpen ? 'overflow-y-hidden h-screen' : ''}`}>
        <BackgroundLayers />
        {wedding.musicUrl && (
          <audio
            ref={audioRef}
            loop
            preload="auto"
            src={wedding.musicUrl}
          />
        )}

        <AnimatePresence mode="wait">
          {!isOpen && (
            <CinematicOpening guestName={guestName} onOpen={handleOpen} />
          )}
        </AnimatePresence>

        <main className="relative z-10">
          {isOpen && (
            <Suspense fallback={null}>
              <FloatingController
                isToolsOpen={isToolsOpen}
                setIsToolsOpen={setIsToolsOpen}
                isPlaying={isPlaying}
                toggleMusic={toggleMusic}
              />
            </Suspense>
          )}

          <HeroSection />
          <CoupleSection />

          <Suspense fallback={null}>
            <CinematicStory weddingSlug={slug} />
            <EventSection />
            <TwibbonSection />

            <RSVPSection
              wishes={wishes}
              currentWishes={currentWishes}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onOpenRSVP={handleOpenRSVP}
              isWishesLoading={isWishesLoading}
            />

            <RSVPModal
              isOpen={isRSVPModalOpen}
              isSubmitSuccess={isSubmitSuccess}
              guestName={guestName}
              onClose={handleCloseRSVP}
              onSubmit={handleRSVPSubmit}
            />

            <DigitalEnvelope copiedIndex={copiedIndex} onCopy={handleCopy} />
            <PhotoGallery onSelectPhoto={setSelectedPhoto} />
            <Footer />
            <PhotoZoomModal
              selectedPhoto={selectedPhoto}
              onClose={handleClosePhoto}
            />
          </Suspense>
        </main>
      </div>
    </WeddingContext.Provider>
  );
}
