import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { AnimatePresence } from 'motion/react';
import { GuestWishes } from './types';
import { SEED_WISHES } from './constants/wishes';
import { BackgroundLayers } from './components/ui/BackgroundLayers';
import { PhotoZoomModal } from './components/ui/PhotoZoomModal';
import { FloatingController } from './components/features/FloatingController';
import { RSVPModal } from './components/features/RSVPModal';
import { CinematicOpening } from './components/sections/CinematicOpening';
import { HeroSection } from './components/sections/HeroSection';
import { CoupleSection } from './components/sections/CoupleSection';
import { CinematicStory } from './components/sections/CinematicStory';
import { EventSection } from './components/sections/EventSection';
import { TwibbonSection } from './components/sections/TwibbonSection';
import { RSVPSection } from './components/sections/RSVPSection';
import { DigitalEnvelope } from './components/sections/DigitalEnvelope';
import { PhotoGallery } from './components/sections/PhotoGallery';
import { Footer } from './components/sections/Footer';

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

  const wishPages = useMemo(() => {
    const availableHeight = 630;
    const pages: GuestWishes[][] = [];
    let currentPageWishes: GuestWishes[] = [];
    let currentHeight = 0;

    wishes.forEach((wish) => {
      const lines = Math.max(1, Math.ceil(wish.message.length / 30));
      const estimatedHeight = 52 + lines * 17;

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
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) setGuestName(decodeURIComponent(to));
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRSVPSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWish: GuestWishes = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      message: formData.get('message') as string,
      attendance: formData.get('attendance') as 'yes' | 'no',
      createdAt: Date.now(),
    };
    setWishes([newWish, ...wishes]);
    setCurrentPage(1);
    setIsSubmitSuccess(true);
    e.currentTarget.reset();
    setTimeout(() => {
      setIsRSVPModalOpen(false);
      setIsSubmitSuccess(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans overflow-x-hidden">
      <BackgroundLayers />
      <audio ref={audioRef} loop src="/musics/adele-make-you-feel-my-love.mp3" />

      <AnimatePresence mode="wait">
        {!isOpen && <CinematicOpening guestName={guestName} onOpen={handleOpen} />}
      </AnimatePresence>

      {isOpen && (
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
      )}
    </div>
  );
}
