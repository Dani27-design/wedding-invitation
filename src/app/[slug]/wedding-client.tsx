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
import { AnimatePresence } from 'motion/react';
import { BackgroundLayers } from '@/components/ui/BackgroundLayers';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { CinematicOpening } from '@/components/sections/CinematicOpening';
import { InvitationProductTour } from '@/components/features/InvitationProductTour';
import { PersonalizedGuestName } from '@/components/features/PersonalizedGuestName';
import { HeroSection } from '@/components/sections/HeroSection';
import { CoupleSection } from '@/components/sections/CoupleSection';
import { useWishes } from '@/hooks/useWishes';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
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

function collectInvitationMediaUrls(wedding: SerializedWedding) {
  const urls = [
    wedding.openingImage,
    wedding.heroImage,
    wedding.groomPhoto,
    wedding.bridePhoto,
    wedding.twibbonOverlay,
    wedding.musicUrl,
    ...wedding.gallery,
    ...wedding.story.flatMap((slide) => [slide.bgImage, slide.bgVideo]),
  ];

  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

interface WeddingClientProps {
  wedding: SerializedWedding;
  slug: string;
}

export function WeddingClient({ wedding, slug }: WeddingClientProps) {
  const isOnline = useNetworkStatus();
  const [isOpen, setIsOpen] = useState(false);
  const { wishes, isLoading: isWishesLoading } = useWishes(slug, isOpen);
  const fallbackGuestName = wedding.defaultGuest ?? '';
  const [guestName, setGuestName] = useState(fallbackGuestName);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewportHeight, setViewportHeight] = useState(667);
  const invitationMediaUrls = useMemo(() => collectInvitationMediaUrls(wedding), [wedding]);

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
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker || invitationMediaUrls.length === 0) return;

    let cancelled = false;

    navigator.serviceWorker.ready
      .then((registration) => {
        if (cancelled) return;
        const activeWorker = navigator.serviceWorker.controller ?? registration.active;
        activeWorker?.postMessage({
          type: 'CACHE_INVITATION_MEDIA',
          urls: invitationMediaUrls,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [invitationMediaUrls]);

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

  const handleOpenRSVP = useCallback(() => {
    setRsvpError('');
    setIsRSVPModalOpen(true);
  }, []);
  const handleCloseRSVP = useCallback(() => {
    setRsvpError('');
    setIsRSVPModalOpen(false);
  }, []);
  const handleClosePhoto = useCallback(() => setSelectedPhoto(null), []);

  const handleOpen = useCallback(() => {
    // Play audio SYNCHRONOUSLY in the user gesture call stack
    if (audioRef.current) {
      const retryPlay = (attempts: number) => {
        if (attempts <= 0 || !audioRef.current) {
          setIsPlaying(false);
          return;
        }
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            retryTimerRef.current = setTimeout(() => retryPlay(attempts - 1), 500);
          });
      };
      retryPlay(3);
    }
    window.scrollTo(0, 0);
    setIsOpen(true);
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
      if (!isOnline) {
        setRsvpError('Koneksi internet diperlukan untuk mengirim RSVP.');
        return;
      }
      try {
        setRsvpError('');
        const { addWish } = await import('@/lib/wishes');
        await addWish(slug, {
          name,
          message,
          attendance: formData.get('attendance') === 'no' ? 'no' : 'yes',
        });
      } catch {
        setRsvpError('RSVP belum terkirim. Periksa koneksi Anda lalu coba lagi.');
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
    [isOnline, slug],
  );

  return (
    <WeddingContext.Provider value={wedding}>
      <div className="min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans overflow-x-hidden">
        <Suspense fallback={null}>
          <PersonalizedGuestName
            fallbackGuestName={fallbackGuestName}
            onGuestNameChange={setGuestName}
          />
        </Suspense>
        <BackgroundLayers />
        {wedding.musicUrl && (
          <audio
            ref={audioRef}
            loop
            preload="none"
            src={wedding.musicUrl}
          />
        )}
        {!isOnline && (
          <div role="status" aria-live="polite" className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-[11000] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-gold/20 bg-ink/90 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-ivory shadow-xl shadow-ink/20">
            Sedang offline. Beberapa fitur mungkin memerlukan koneksi internet.
          </div>
        )}
        <InvitationProductTour
          slug={slug}
          isOpen={isOpen}
          onOpenInvitation={handleOpen}
          setIsToolsOpen={setIsToolsOpen}
        >
          <AnimatePresence mode="wait">
            {!isOpen && (
              <CinematicOpening guestName={guestName} onOpen={handleOpen} />
            )}
          </AnimatePresence>

          <main className="relative z-10">
            {isOpen && (
              <SectionErrorBoundary>
                <Suspense fallback={null}>
                  <FloatingController
                    isToolsOpen={isToolsOpen}
                    setIsToolsOpen={setIsToolsOpen}
                    isPlaying={isPlaying}
                    toggleMusic={toggleMusic}
                    enableProductTour
                  />
                </Suspense>
              </SectionErrorBoundary>
            )}

            <HeroSection />
            <CoupleSection />

            <SectionErrorBoundary>
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
                  submitError={rsvpError}
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
            </SectionErrorBoundary>
          </main>
        </InvitationProductTour>
      </div>
    </WeddingContext.Provider>
  );
}
