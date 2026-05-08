import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Gift, MapPin, X, Play, Pause } from 'lucide-react';

interface FloatingControllerProps {
  isToolsOpen: boolean;
  setIsToolsOpen: (open: boolean) => void;
  isPlaying: boolean;
  toggleMusic: () => void;
}

export const FloatingController = ({ isToolsOpen, setIsToolsOpen, isPlaying, toggleMusic }: FloatingControllerProps) => (
  <motion.div
    drag
    dragMomentum={false}
    dragElastic={0.1}
    dragConstraints={{ left: -(window.innerWidth - 80), right: 0, top: -(window.innerHeight - 100), bottom: 0 }}
    className="fixed bottom-8 right-5 z-[100] flex flex-col items-center gap-4 touch-none cursor-grab active:cursor-grabbing"
  >
    <AnimatePresence>
      {isToolsOpen && (
        <div className="flex flex-col items-center gap-3 mb-2">
          {[
            { id: 'event-section', label: 'Info Acara', icon: MapPin },
            { id: 'twibbon-section', label: 'Twibbon', icon: Sparkles },
            { id: 'rsvp-section', label: 'Ucapan & Doa', icon: Heart },
            { id: 'gift-section', label: 'Tanda Kasih', icon: Gift },
          ].map((tool, idx) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                document.getElementById(tool.id)?.scrollIntoView({ behavior: 'smooth' });
                setIsToolsOpen(false);
              }}
              className="group flex items-center gap-3 pr-4 pl-3 py-2 bg-ivory/90 backdrop-blur-xl border border-rose-pastel/30 rounded-full shadow-xl hover:bg-white transition-all"
            >
              <tool.icon className="w-3.5 h-3.5 text-rose-pastel group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink font-bold">{tool.label}</span>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ delay: 0.2 }}
            onClick={toggleMusic}
            className="group flex items-center gap-3 pr-4 pl-3 py-2 bg-ivory/90 backdrop-blur-xl border border-rose-pastel/20 rounded-full shadow-xl hover:bg-white transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-rose-pastel" /> : <Play className="w-3.5 h-3.5 text-rose-pastel" />}
            <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink font-bold">{isPlaying ? 'Senyapkan Musik' : 'Putar Musik'}</span>
          </motion.button>
        </div>
      )}
    </AnimatePresence>

    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 bg-rose-pastel/20 rounded-full"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className={`absolute -inset-1.5 border border-dashed border-rose-pastel/30 rounded-full pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}
      />

      <motion.button
        onPointerDown={(e) => e.stopPropagation()}
        whileTap={{ scale: 0.9 }}
        aria-label={isToolsOpen ? 'Tutup menu' : 'Buka menu'}
        onClick={() => setIsToolsOpen(!isToolsOpen)}
        className={`relative w-14 h-14 flex items-center justify-center backdrop-blur-xl border border-rose-pastel/40 rounded-full transition-all duration-700 shadow-2xl group overflow-hidden ${isToolsOpen ? 'bg-ink border-rose-pastel' : 'bg-ivory/60'}`}
      >
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-20 bg-gradient-to-tr from-rose-pastel via-transparent to-rose-pastel"
        />
        <motion.div animate={isToolsOpen ? { rotate: 180 } : { rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          {isToolsOpen ? (
            <X className="w-6 h-6 text-rose-pastel" />
          ) : (
            <motion.div
              animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className={`w-6 h-6 text-rose-pastel ${isPlaying ? 'fill-rose-pastel' : ''} transition-colors duration-500`} />
            </motion.div>
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  </motion.div>
);
