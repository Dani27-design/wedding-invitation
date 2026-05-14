'use client';
import { useState, useRef, useCallback, useEffect, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { AmbientSocialLayer } from '../ui/AmbientSocialLayer';
import { PetalEffect } from '../ui/PetalEffect';
import { useWeddingContext } from '../../context/WeddingContext';
import { useStoryLikes } from '../../hooks/useStoryLikes';
import { useStoryComments } from '../../hooks/useStoryComments';

interface CinematicStoryProps {
  weddingSlug: string;
}

export const CinematicStory = memo(({ weddingSlug }: CinematicStoryProps) => {
  const wedding = useWeddingContext();
  const slides = wedding?.story ?? [];

  const [commentInput, setCommentInput] = useState<{ index: number; name: string; text: string } | null>(null);
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [commentTrigger, setCommentTrigger] = useState<{ name: string; text: string; id: number } | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRafRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { likes, incrementLike } = useStoryLikes(weddingSlug, isVisible);
  const { comments, addComment } = useStoryComments(weddingSlug, activeSlide, isVisible);

  if (slides.length === 0) return null;

  const handleStoryScroll = useCallback(() => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = true;
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el && el.clientWidth) {
        setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
      }
      scrollRafRef.current = false;
    });
  }, []);

  const handleLike = (idx: number) => {
    setHeartTrigger(Date.now());
    incrementLike(idx);
  };

  const handleAddComment = () => {
    if (!commentInput?.text.trim() || !commentInput?.name.trim()) return;
    const newComment = { name: commentInput.name, text: commentInput.text.trim() };
    addComment(newComment);
    setCommentTrigger({ ...newComment, id: Date.now() });
    setCommentInput(null);
  };

  return (
    <section ref={sectionRef} id="story-section" className="relative h-screen-safe w-full bg-ink overflow-hidden scroll-snap-container">
      <div ref={scrollContainerRef} onScroll={handleStoryScroll} className="h-full w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth overscroll-x-contain">
        {slides.map((slide, idx) => (
          <div key={idx} className="relative h-full w-full min-w-full snap-center flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              {slide.bgImage && (
                <Image src={slide.bgImage} fill sizes="100vw" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="object-cover opacity-40 md:opacity-50 grayscale hover:grayscale-0 transition-all duration-[3000ms]" alt="Memory" referrerPolicy="no-referrer" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" />
            </div>

            {idx === activeSlide && (
              <>
                <AmbientSocialLayer customComments={comments} triggerHeartTap={heartTrigger} triggerCommentTap={commentTrigger} />
                <PetalEffect />
              </>
            )}

            {commentInput?.index !== idx && (
              <div className="absolute bottom-32 right-6 flex flex-col gap-5 z-[60]">
                <motion.button whileTap={{ scale: 0.8 }} aria-label="Suka" onClick={() => handleLike(idx)} className="relative flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-rose-pastel/20 transition-all">
                    <Heart className="w-5 h-5 text-rose-pastel transition-transform group-active:scale-125" fill={(likes[idx] ?? 0) > 120 ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-xs font-sans text-white/60 tracking-widest">{likes[idx] ?? 0}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.8 }} aria-label="Komentar" onClick={() => setCommentInput({ index: idx, name: '', text: '' })} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                    <MessageCircle className="w-5 h-5 text-ivory" />
                  </div>
                  <span className="text-xs font-sans text-white/60 tracking-widest">{idx === activeSlide ? comments.length : 0}</span>
                </motion.button>
              </div>
            )}

            <AnimatePresence>
              {commentInput?.index === idx && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute inset-x-6 bottom-48 z-[70] max-w-sm mx-auto">
                  <div className="bg-ink/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="w-4 h-4 text-rose-pastel" />
                      <span className="text-xs uppercase tracking-[0.2em] text-ivory font-bold">Bagikan Kebahagiaan</span>
                    </div>
                    <input type="text" maxLength={30} value={commentInput.name} onChange={(e) => setCommentInput({ ...commentInput, name: e.target.value })} placeholder="Nama Anda" aria-label="Nama Anda" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-white/20 focus:outline-none focus:border-gold/50 mb-3 font-sans" />
                    <textarea autoFocus maxLength={100} value={commentInput.text} onChange={(e) => setCommentInput({ ...commentInput, text: e.target.value })} placeholder="Tulis pesan..." aria-label="Tulis pesan" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-white/20 focus:outline-none focus:border-rose-pastel/50 min-h-[80px] resize-none font-sans" />
                    <div className="flex justify-end gap-2 mt-4 font-sans">
                      <button onClick={() => setCommentInput(null)} className="px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors">Batal</button>
                      <button disabled={!commentInput.text.trim() || !commentInput.name.trim()} onClick={() => handleAddComment()} className="px-6 py-2 bg-rose-pastel rounded-full text-ink text-xs uppercase font-black tracking-widest hover:brightness-110 disabled:opacity-30 transition-all">Kirim</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-30 px-8 pb-32 sm:pb-40 md:pb-48 pt-12 sm:pt-16 md:pt-20 w-full h-full flex flex-col items-start justify-end text-left">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: 'easeOut' }} className="max-w-[75%] md:max-w-md w-full">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 2 }} className="font-sans text-xs uppercase tracking-[0.6em] text-gold/70 mb-6 flex items-center gap-3">
                  <span className="h-[1px] w-6 bg-gold/30" />
                  <span>{slide.year}</span>
                </motion.div>
                <h2 className="font-serif italic text-sm md:text-base text-ivory leading-relaxed whitespace-pre-line tracking-tight">{slide.text}</h2>
              </motion.div>
            </div>

            {idx === 0 && (
              <>
                <motion.div animate={{ x: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-30 invisible md:visible">
                  <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gold to-transparent" />
                  <span className="text-xs tracking-[0.6em] uppercase text-gold rotate-90 origin-right translate-x-3 whitespace-nowrap mt-4">Geser untuk melihat</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: [0, 0.8, 0.8, 0], x: [0, 10, 10, 0] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity, repeatDelay: 5 }} className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 md:hidden">
                  <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Geser</span>
                  <ArrowRight className="w-3 h-3 text-gold" />
                </motion.div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-40">
        {slides.map((_, i) => (
          <motion.div key={i} animate={{ scale: i === activeSlide ? 1.2 : 0.8, width: i === activeSlide ? 20 : 6, opacity: i === activeSlide ? 1 : 0.3 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="h-1.5 bg-gold rounded-full transition-colors duration-500" />
        ))}
      </div>
    </section>
  );
});
