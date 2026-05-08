import { motion } from "motion/react";
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveDateDisplay } from '../../utils/weddingDerived';

export const HeroSection = () => {
  const wedding = useWeddingContext();

  return (
  <section className="relative h-screen-safe flex flex-col items-center justify-between px-6 py-[5vh] overflow-hidden bg-ivory">
    <div className="absolute inset-0 z-0">
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full transform-gpu"
      >
        <img
          src={wedding?.heroImage ?? ''}
          fetchPriority="high"
          sizes="100vw"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
          alt={`${wedding?.groomNickname ?? ''} & ${wedding?.brideNickname ?? ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ivory/20 to-ivory" />
      </motion.div>
    </div>

    <div className="flex flex-col items-center justify-center pt-[5vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, delay: 0.5 }}
        className="space-y-4 text-center"
      >
        <h1 className="font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">
          {wedding?.groomNickname}
        </h1>
        <h2 className="font-dayland text-2xl sm:text-4xl md:text-6xl text-gold/70 drop-shadow-2xl">
          &
        </h2>
        <h1 className="font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">
          {wedding?.brideNickname}
        </h1>
      </motion.div>
    </div>

    <div className="relative z-10 text-center w-full pb-[5vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="space-y-4 md:space-y-6"
      >
        <div className="w-12 h-px bg-gold/30 mx-auto" />
        <div className="space-y-3">
          <p className="font-display italic text-2xl sm:text-3xl md:text-5xl text-ink/70">
            {wedding ? deriveDateDisplay(wedding.eventDate) : ''}
          </p>
          <p className="font-display italic text-xs tracking-[0.6rem] uppercase text-gold font-medium">
            {wedding?.eventCity} . Indonesia
          </p>
        </div>
      </motion.div>
    </div>
  </section>
  );
};
