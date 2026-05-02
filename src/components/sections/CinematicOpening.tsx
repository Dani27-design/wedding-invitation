import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { LightGlow } from '../ui/LightGlow';
import { FloatingPetals } from '../ui/FloatingPetals';
import { ForegroundOrnaments } from '../ui/ForegroundOrnaments';
import { WEDDING_DATE_SHORT } from '../../constants/wedding';

interface CinematicOpeningProps {
  guestName: string;
  onOpen: () => void;
}

export const CinematicOpening = ({ guestName, onOpen }: CinematicOpeningProps) => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.05, transition: { duration: 2, ease: [0.76, 0, 0.24, 1] } }}
    className="fixed inset-0 z-[1000] flex flex-col bg-ink py-[5vh] overflow-hidden"
  >
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ scale: { duration: 20, repeat: Infinity, ease: 'easeInOut' } }}
      className="absolute inset-0 z-0"
    >
      <img src="/bride_and_groom_full_body_potrait.jpeg" className="w-full h-full object-cover" alt="Opening BG" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/90" />
      <LightGlow />
      <FloatingPetals />
      <ForegroundOrnaments />
    </motion.div>

    <div className="relative z-10 p-6 md:p-6 flex justify-between items-start w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-col gap-1">
        <span className="font-sans text-xs tracking-[0.4rem] uppercase text-gold font-bold">Surabaya</span>
        <span className="font-serif italic text-sm text-ivory">{WEDDING_DATE_SHORT}</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 1.5 }} className="relative w-12 h-12 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-gold/20 rounded-full border-dashed" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-[3px] border border-gold/10 rounded-full" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10">
          <Heart className="w-4 h-4 text-gold fill-gold/20 drop-shadow-[0_0_12px_rgba(180,141,62,0.6)]" />
        </motion.div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
          <div className="w-1 h-1 bg-gold/60 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2 blur-[0.5px]" />
        </motion.div>
      </motion.div>
    </div>

    <div className="relative z-10 px-8 md:px-24 flex-1 flex flex-col justify-between w-full h-full">
      <div className="pt-0 md:pt-2 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.8, delay: 0.5 }} className="space-y-4 text-center">
          <h1 className="font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">Dani</h1>
          <h2 className="font-dayland text-2xl sm:text-4xl md:text-6xl text-gold/70 drop-shadow-2xl">&</h2>
          <h1 className="font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">Marini</h1>
        </motion.div>
      </div>

      <div className="pb-6 md:pb-6 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col items-center text-center gap-6">
          <div className="space-y-2">
            <p className="font-sans text-xs tracking-[0.3rem] uppercase text-gold/70 font-medium">Turut Mengundang</p>
            <h2 className="font-display italic text-3xl md:text-4xl text-ivory font-light max-w-[85vw] break-words">{guestName}</h2>
          </div>
          <div className="pt-4">
            <motion.button
              whileHover={{ letterSpacing: '0.6rem' }}
              onClick={onOpen}
              className="font-sans text-xs tracking-[0.4rem] uppercase text-gold font-bold transition-all duration-500 py-4 border-b border-gold/20"
            >
              Buka Undangan
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);
