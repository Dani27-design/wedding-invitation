'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PhotoZoomModalProps {
  selectedPhoto: string | null;
  onClose: () => void;
}

export const PhotoZoomModal = ({ selectedPhoto, onClose }: PhotoZoomModalProps) => {
  const trapRef = useFocusTrap(!!selectedPhoto);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
  <AnimatePresence onExitComplete={() => setIsLoaded(false)}>
    {selectedPhoto && (
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Lihat Foto"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden bg-ink/95 backdrop-blur-xl p-4 md:p-6 cursor-zoom-out"
      >
        <Image
          src={selectedPhoto}
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          priority
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="pointer-events-none absolute inset-0 z-0 object-cover opacity-25 blur-2xl scale-110 saturate-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 z-[1] bg-ink/70" aria-hidden="true" />
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-[88vw] h-[72vh] max-w-[760px] max-h-[820px] sm:h-[78vh] flex items-center justify-center rounded-[1.5rem] bg-black/25 border border-white/20 overflow-hidden shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <Image
            src={selectedPhoto}
            alt="Foto dalam tampilan penuh"
            width={1920}
            height={1080}
            sizes="100vw"
            priority
            onLoad={() => setIsLoaded(true)}
            onError={(e) => { e.currentTarget.style.display = 'none'; setIsLoaded(true); }}
            className={`h-full w-full object-contain rounded-[1.25rem] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.button
          aria-label="Tutup"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          className="fixed top-5 right-5 z-20 w-12 h-12 flex items-center justify-center bg-red-500/25 hover:bg-red-500/40 text-red-50 rounded-full backdrop-blur-md transition-all border border-red-200/40 shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95 group"
        >
          <X className="w-5 h-5 transition-transform" />
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
