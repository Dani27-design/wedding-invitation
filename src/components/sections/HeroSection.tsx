import { motion } from "motion/react";
import { WEDDING_DATE_DISPLAY } from "../../constants/wedding";

export const HeroSection = () => (
  <section className="relative h-[100dvh] flex flex-col items-center justify-between px-6 py-[5vh] overflow-hidden bg-ivory">
    <div className="absolute inset-0 z-0">
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full transform-gpu"
      >
        <img
          src="/images/bride_and_groom_full_body_potrait.jpeg"
          fetchPriority="high"
          className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
          alt="Hero Portrait"
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
          Dani
        </h1>
        <h2 className="font-dayland text-2xl sm:text-4xl md:text-6xl text-gold/70 drop-shadow-2xl">
          &
        </h2>
        <h1 className="font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">
          Marini
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
            {WEDDING_DATE_DISPLAY}
          </p>
          <p className="font-display italic text-xs tracking-[0.6rem] uppercase text-gold font-medium">
            Surabaya . Indonesia
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);
