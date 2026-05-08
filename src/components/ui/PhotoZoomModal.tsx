import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PhotoZoomModalProps {
  selectedPhoto: string | null;
  onClose: () => void;
}

export const PhotoZoomModal = ({ selectedPhoto, onClose }: PhotoZoomModalProps) => {
  const trapRef = useFocusTrap(!!selectedPhoto);

  return (
  <AnimatePresence>
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
          className="relative max-w-5xl w-full max-h-full flex items-center justify-center p-2 rounded-[2rem] bg-white/10 border border-white/20 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={selectedPhoto}
            alt="Zoomed Moment"
            sizes="100vw"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="max-w-full max-h-[85vh] object-contain rounded-[1.5rem]"
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
