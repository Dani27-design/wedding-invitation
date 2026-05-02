import { motion } from 'motion/react';
import { LightGlow } from '../ui/LightGlow';
import { FloatingPetals } from '../ui/FloatingPetals';
import { ForegroundOrnaments } from '../ui/ForegroundOrnaments';
import { WEDDING_DATE_DISPLAY } from '../../constants/wedding';

export const HeroSection = () => (
  <section className="relative h-[100dvh] flex flex-col items-center justify-between px-6 pb-[3vh] md:pb-6 overflow-hidden bg-ivory">
    <div className="absolute inset-0 z-0">
      <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="w-full h-full">
        <img src="/bride_and_groom_full_body_potrait.jpeg" className="w-full h-full object-cover object-top brightness-[0.85] contrast-[1.05]" alt="Hero Portrait" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ivory/20 to-ivory" />
        <LightGlow />
        <FloatingPetals />
        <ForegroundOrnaments />
      </motion.div>
    </div>

    <div className="relative z-10 text-center pt-[3vh] md:pt-6 w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }}>
        <h1 className="font-dayland text-5xl sm:text-7xl md:text-[8rem] leading-none text-ink drop-shadow-sm">
          <span className="block">Dani</span>
          <span className="block text-gold text-4xl md:text-5xl my-2 md:my-4">&</span>
          <span className="block">Marini</span>
        </h1>
      </motion.div>
    </div>

    <div className="relative z-10 text-center w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 1 }} className="space-y-4 md:space-y-6">
        <div className="w-12 h-px bg-gold/30 mx-auto" />
        <div className="space-y-3">
          <p className="font-display italic text-2xl sm:text-3xl md:text-5xl text-ink/80">{WEDDING_DATE_DISPLAY}</p>
          <p className="font-sans text-[8px] tracking-[0.6rem] uppercase text-gold font-medium">Surabaya . Indonesia</p>
        </div>
      </motion.div>
    </div>
  </section>
);
