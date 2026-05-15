'use client';
import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { LightGlow } from "../ui/LightGlow";
import { FloatingPetals } from "../ui/FloatingPetals";
import { ForegroundOrnaments } from "../ui/ForegroundOrnaments";
import { useWeddingContext } from "../../context/WeddingContext";
import { deriveDateShort } from "../../utils/weddingDerived";

interface CinematicOpeningProps {
  guestName: string;
  onOpen: () => void;
}

export const CinematicOpening = ({
  guestName,
  onOpen,
}: CinematicOpeningProps) => {
  const wedding = useWeddingContext();
  const openedRef = useRef(false);

  // Store onOpen in a ref so the effect closure always has the latest reference
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    let touchStartY = 0;
    const THRESHOLD = 5;

    // Call onOpen directly from the gesture handler — NOT via .click()
    // This keeps audio.play() in the real user gesture call stack
    const triggerOpen = () => {
      if (!openedRef.current) {
        openedRef.current = true;
        onOpenRef.current();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > THRESHOLD) triggerOpen();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (deltaY > THRESHOLD) triggerOpen();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        triggerOpen();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleButtonClick = () => {
    if (!openedRef.current) {
      openedRef.current = true;
      onOpen();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.05,
        transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
      }}
      className="fixed inset-0 z-[10000] flex flex-col bg-ink py-[2vh] overflow-hidden"
      style={{
        boxShadow: '0 0 0 1.5px #FDFCF8',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden'
      }}
    >
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          scale: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute inset-0 z-0"
        style={{ willChange: 'transform' }}
      >
        {/* Layer 1: Image (Base) */}
        {wedding?.openingImage && (
          <Image
            src={wedding.openingImage}
            fill
            priority
            sizes="100vw"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="object-cover z-0"
            alt="Opening BG"
          />
        )}

        {/* Layer 2: Visual Effects */}
        <div className="absolute inset-0 z-10">
          <LightGlow />
          <FloatingPetals />
          <ForegroundOrnaments />
        </div>

        {/* Layer 3: Gradient Overlay (Top) */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-ink/60 via-transparent to-ink/90" />
      </motion.div>

      <div className="flex justify-between items-center relative z-10 p-6 md:p-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-1"
        >
          <span className="font-serif uppercase text-xs tracking-[0.4rem] text-gold">
            {wedding?.eventCity}
          </span>
          <span className="font-serif italic text-sm text-ivory">
            {wedding ? deriveDateShort(wedding.eventDate) : ""}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          className="relative w-12 h-12 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-gold/20 rounded-full border-dashed"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[3px] border border-gold/10 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Heart className="w-4 h-4 text-gold fill-gold/20 drop-shadow-[0_0_12px_color-mix(in_srgb,var(--color-gold)_60%,transparent)]" />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="w-1 h-1 bg-gold/60 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2 blur-[0.5px]" />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 px-8 md:px-24 flex-1 flex flex-col justify-between w-full h-full">
        <div className="pt-5 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.5 }}
            className="space-y-4 text-center"
          >
            <div aria-hidden="true" className="space-y-4">
              <span className="block font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">
                {wedding?.groomNickname}
              </span>
              <span className="block font-dayland text-2xl sm:text-4xl md:text-6xl text-gold/70 drop-shadow-2xl">
                &
              </span>
              <span className="block font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">
                {wedding?.brideNickname}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="pb-6 md:pb-6 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <div className="space-y-2">
              <p className="font-sans text-xs tracking-[0.3rem] uppercase text-gold/70 font-medium">
                Turut Mengundang
              </p>
              <p className="font-display italic text-3xl md:text-4xl text-ivory font-light max-w-[85vw] break-words">
                {guestName}
              </p>
            </div>
            <motion.button
              onClick={handleButtonClick}
              aria-label="Buka Undangan"
              className="flex flex-col items-center gap-3 pt-4 group cursor-pointer transition-all"
            >

              <motion.svg
                aria-hidden="true"
                width="44"
                height="36"
                viewBox="0 0 44 36"
                fill="none"
                className="text-gold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <rect
                  x="2"
                  y="10"
                  width="40"
                  height="24"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M2 12 L22 24 L42 12"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d="M2 34 L16 22"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.2"
                />
                <path
                  d="M42 34 L28 22"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.2"
                />
                <motion.path
                  d="M22 18 C22 14 18 12 16 14 C14 16 16 18 22 22 C28 18 30 16 28 14 C26 12 22 14 22 18Z"
                  fill="currentColor"
                  opacity="0.4"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
