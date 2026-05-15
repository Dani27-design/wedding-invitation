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
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/90 backdrop-blur-xl p-4 md:p-6 cursor-zoom-out"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative max-w-5xl w-full min-h-[50vh] max-h-full flex items-center justify-center p-2 rounded-[2rem] bg-white/10 border border-white/20 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
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
            className={`object-contain rounded-[1.5rem] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ maxWidth: '100%', maxHeight: '85vh', width: 'auto', height: 'auto' }}
          />
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all border border-white/20 group"
          >
            <X className="w-5 h-5 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
