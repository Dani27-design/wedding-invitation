'use client';
import { memo } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveDateDisplay } from '../../utils/weddingDerived';
import { SHIMMER_IVORY } from '../../utils/shimmer';

export const HeroSection = memo(() => {
  const wedding = useWeddingContext();

  return (
  <section className="relative h-screen-safe overflow-hidden bg-ivory">
    <div className="h-full flex flex-col lg:flex-row">
      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center lg:items-start justify-between flex-1 px-6 py-[5vh] lg:py-[8vh] lg:px-12 xl:px-20">
        {/* Names */}
        <div className="flex flex-col items-center lg:items-start justify-start lg:justify-center flex-1 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.5 }}
            className="space-y-4 text-center lg:text-left"
          >
            <h1 className="space-y-4">
              <span className="block font-dayland text-5xl sm:text-7xl md:text-9xl lg:text-8xl xl:text-9xl text-ivory lg:text-ink break-words max-w-[95vw] lg:max-w-full [text-shadow:0_1px_4px_color-mix(in_srgb,var(--color-gold)_80%,transparent),0_0_15px_color-mix(in_srgb,var(--color-gold)_60%,transparent),0_0_50px_color-mix(in_srgb,var(--color-gold)_40%,transparent)]">
                {wedding?.groomNickname}
              </span>
              <span className="block font-dayland text-2xl sm:text-4xl md:text-6xl lg:text-5xl xl:text-6xl text-gold/70 [text-shadow:0_1px_4px_color-mix(in_srgb,var(--color-ink)_40%,transparent),0_0_12px_color-mix(in_srgb,var(--color-ink)_25%,transparent),0_0_40px_color-mix(in_srgb,var(--color-ink)_15%,transparent)] lg:text-center">
                &
              </span>
              <span className="block font-dayland text-5xl sm:text-7xl md:text-9xl lg:text-8xl xl:text-9xl text-ivory lg:text-ink break-words max-w-[95vw] lg:max-w-full [text-shadow:0_1px_4px_color-mix(in_srgb,var(--color-gold)_80%,transparent),0_0_15px_color-mix(in_srgb,var(--color-gold)_60%,transparent),0_0_50px_color-mix(in_srgb,var(--color-gold)_40%,transparent)]">
                {wedding?.brideNickname}
              </span>
            </h1>
          </motion.div>
        </div>

        {/* Date + city */}
        <div className="text-center lg:text-left w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="space-y-4"
          >
            <div className="w-12 h-px bg-gold/30 mx-auto lg:mx-0" />
            <div className="space-y-3">
              <p className="font-display italic text-2xl sm:text-3xl md:text-5xl lg:text-2xl xl:text-3xl text-ink/70">
                {wedding ? deriveDateDisplay(wedding.eventDate) : ''}
              </p>
              <p className="font-display italic text-xs tracking-[0.3rem] sm:tracking-[0.6rem] uppercase text-gold font-medium">
                {wedding?.eventCity} . Indonesia
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Photo — behind text on mobile, right column on desktop */}
      <div className="absolute inset-0 lg:relative lg:w-[55%] xl:w-[60%] lg:flex-shrink-0 lg:overflow-hidden">
        {/* Desktop: blurred photo fills the column background */}
        {wedding?.heroImage && (
          <div className="hidden lg:block absolute inset-0 z-0">
            <Image
              src={wedding.heroImage}
              fill
              sizes="60vw"
              priority
              placeholder="blur"
              blurDataURL={SHIMMER_IVORY}
              className="object-cover object-top scale-110 blur-sm brightness-105"
              alt=""
              aria-hidden="true"
            />
            {/* Left edge fade into ivory */}
            <div className="absolute inset-0 bg-gradient-to-r from-ivory via-transparent to-transparent w-1/3" />
          </div>
        )}
        <div className="w-full h-full transform-gpu relative animate-hero-zoom lg:flex lg:items-center lg:justify-center lg:py-8">
          {wedding?.heroImage && (
            <>
              {/* Mobile: fill cover */}
              <Image
                src={wedding.heroImage}
                fill
                priority
                sizes="100vw"
                placeholder="blur"
                blurDataURL={SHIMMER_IVORY}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="object-cover object-top brightness-[0.85] contrast-[1.05] lg:hidden"
                alt={`${wedding?.groomNickname ?? ''} & ${wedding?.brideNickname ?? ''}`}
              />
              {/* Desktop: contained photo, full visible */}
              <div className="hidden lg:block relative z-10 w-full h-full">
                <Image
                  src={wedding.heroImage}
                  fill
                  priority
                  sizes="(max-width: 1280px) 55vw, 60vw"
                  placeholder="blur"
                  blurDataURL={SHIMMER_IVORY}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="object-contain rounded-xl"
                  alt={`${wedding?.groomNickname ?? ''} & ${wedding?.brideNickname ?? ''}`}
                />
              </div>
            </>
          )}
          {/* Mobile: bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ivory/20 to-ivory lg:hidden" />
        </div>
      </div>
    </div>
  </section>
  );
});
