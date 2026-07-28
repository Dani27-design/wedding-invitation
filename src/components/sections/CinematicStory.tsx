'use client';
import { useState, useRef, useCallback, useEffect, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { driver, type Driver, type DriverHook } from 'driver.js';
import { Heart, MessageCircle } from 'lucide-react';
import { AmbientSocialLayer } from '../ui/AmbientSocialLayer';
import { PetalEffect } from '../ui/PetalEffect';
import { useWeddingContext } from '../../context/WeddingContext';
import { useOptionalTour } from '../features/InvitationProductTour';
import { useStoryLikes } from '../../hooks/useStoryLikes';
import { useStoryComments } from '../../hooks/useStoryComments';
import { addFloatingNavigationStartListener } from '../../utils/floatingNavigationEvents';
import { SHIMMER_DARK } from '../../utils/shimmer';

interface CinematicStoryProps {
  weddingSlug: string;
}

const OVERFLOW_TOLERANCE_PX = 1;
const STORY_TOUR_MIN_SLIDES = 2;
const STORY_TOUR_FULL_VISIBILITY_RATIO = 0.85;
const STORY_TOUR_READY_DELAY_MS = 150;
const STORY_TOUR_TARGET_WAIT_MS = 1000;
const STORY_LIKE_BUTTON_SELECTOR = '[data-tour="story-like-button"]';
const STORY_COMMENT_BUTTON_SELECTOR = '[data-tour="story-comment-button"]';

function sameSet(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function isClampedOverflowing(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement;
  const width = el.getBoundingClientRect().width || el.offsetWidth || el.clientWidth;

  clone.classList.add('line-clamp-3');
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.pointerEvents = 'none';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = width > 0 ? `${width}px` : 'auto';
  clone.style.display = '-webkit-box';
  clone.style.setProperty('-webkit-box-orient', 'vertical');
  clone.style.setProperty('-webkit-line-clamp', '3');
  clone.style.overflow = 'hidden';

  document.body.appendChild(clone);
  const overflowing = clone.scrollHeight > clone.clientHeight + OVERFLOW_TOLERANCE_PX;
  clone.remove();

  return overflowing;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export const CinematicStory = memo(({ weddingSlug }: CinematicStoryProps) => {
  const wedding = useWeddingContext();
  const invitationTour = useOptionalTour();
  const slides = wedding?.story ?? [];
  const storySignature = slides
    .map((slide) => `${slide.year}\n${slide.text}\n${slide.bgImage}\n${slide.bgVideo ?? ''}`)
    .join('\n---\n');

  const [commentInput, setCommentInput] = useState<{ index: number; name: string; text: string } | null>(null);
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [commentTrigger, setCommentTrigger] = useState<{ name: string; text: string; id: number } | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedSlides, setExpandedSlides] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [isStoryTourReady, setIsStoryTourReady] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRafRef = useRef(false);
  const scrollLockRef = useRef(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const textRefs = useRef<Map<number, HTMLParagraphElement>>(new Map());
  const storyTourRef = useRef<Driver | null>(null);
  const hasStartedStoryTourRef = useRef(false);
  const hasInteractedWithStorySwipeRef = useRef(false);
  const [overflowingSlides, setOverflowingSlides] = useState<Set<number>>(new Set());

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

  useEffect(() => addFloatingNavigationStartListener(() => {
    const activeTour = storyTourRef.current;
    storyTourRef.current = null;
    if (activeTour?.isActive()) {
      activeTour.destroy();
    }
  }), []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let cancelled = false;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;

    const clearReadyTimer = () => {
      if (readyTimer !== null) {
        clearTimeout(readyTimer);
        readyTimer = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio ?? 0;
        const isFullySeen = entry.isIntersecting && ratio >= STORY_TOUR_FULL_VISIBILITY_RATIO;

        clearReadyTimer();
        if (!isFullySeen) return;

        readyTimer = setTimeout(() => {
          if (!cancelled) setIsStoryTourReady(true);
        }, STORY_TOUR_READY_DELAY_MS);
      },
      { threshold: [STORY_TOUR_FULL_VISIBILITY_RATIO] }
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      clearReadyTimer();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      !isStoryTourReady ||
      invitationTour?.isTourRunning ||
      commentInput !== null ||
      hasStartedStoryTourRef.current ||
      hasInteractedWithStorySwipeRef.current ||
      slides.length < STORY_TOUR_MIN_SLIDES
    ) {
      return undefined;
    }

    hasStartedStoryTourRef.current = true;

    const clearStoryTour: DriverHook = (_element, _step, { driver: activeDriver }) => {
      activeDriver.destroy();
    };
    const markStoryTourDestroyed: DriverHook = (_element, _step, { driver: activeDriver }) => {
      if (storyTourRef.current === activeDriver) {
        storyTourRef.current = null;
      }
    };

    const storyTour = driver({
      animate: !prefersReducedMotion(),
      overlayColor: '#1A1A1A',
      overlayOpacity: 0.72,
      smoothScroll: false,
      allowClose: true,
      allowScroll: false,
      disableActiveInteraction: false,
      stagePadding: 10,
      stageRadius: 18,
      popoverOffset: 16,
      popoverClass: 'wedding-driver-popover',
      showButtons: ['next'],
      showProgress: false,
      nextBtnText: 'Lanjut',
      doneBtnText: 'Mengerti',
      overlayClickBehavior: 'close',
      onDoneClick: clearStoryTour,
      onCloseClick: clearStoryTour,
      onDestroyed: markStoryTourDestroyed,
      steps: [
        {
          disableActiveInteraction: false,
          popover: {
            title: 'Kisah Kami',
            description: 'Geser ke samping untuk mengikuti setiap bagian cerita. Setelah panduan ditutup, Anda dapat menggulir halaman seperti biasa.',
            showButtons: ['next'],
            nextBtnText: 'Lanjut',
            doneBtnText: 'Mengerti',
          },
        },
        {
          element: STORY_LIKE_BUTTON_SELECTOR,
          waitForElement: STORY_TOUR_TARGET_WAIT_MS,
          disableActiveInteraction: false,
          advanceOnClick: true,
          popover: {
            title: 'Tanda Suka',
            description: 'Ketuk ikon hati untuk mengirim tanda suka pada bagian cerita yang sedang dibaca.',
            side: 'left',
            align: 'center',
            showButtons: ['next'],
            nextBtnText: 'Lanjut',
          },
        },
        {
          element: STORY_COMMENT_BUTTON_SELECTOR,
          waitForElement: STORY_TOUR_TARGET_WAIT_MS,
          disableActiveInteraction: false,
          advanceOnClick: true,
          popover: {
            title: 'Ucapan Cerita',
            description: 'Ketuk ikon komentar untuk menulis ucapan singkat pada bagian cerita ini.',
            side: 'left',
            align: 'center',
            showButtons: ['next'],
            doneBtnText: 'Mengerti',
          },
        },
      ],
    });

    storyTourRef.current = storyTour;
    storyTour.drive();

    return () => {
      if (storyTourRef.current === storyTour) {
        storyTourRef.current = null;
      }
      if (storyTour.isActive()) {
        storyTour.destroy();
      }
    };
  }, [commentInput, invitationTour?.isTourRunning, isStoryTourReady, slides.length]);

  const measureOverflowingSlides = useCallback(() => {
    const next = new Set<number>();
    textRefs.current.forEach((el, idx) => {
      if (idx < slides.length && isClampedOverflowing(el)) next.add(idx);
    });
    setOverflowingSlides((prev) => (sameSet(prev, next) ? prev : next));
  }, [slides.length]);

  useEffect(() => {
    let cancelled = false;
    let raf = requestAnimationFrame(() => {
      if (!cancelled) measureOverflowingSlides();
    });

    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!cancelled) measureOverflowingSlides();
      });
    };

    window.addEventListener('resize', handleResize);
    document.fonts?.ready.then(() => {
      if (!cancelled) handleResize();
    }).catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [measureOverflowingSlides, storySignature]);

  // Manage video play/pause based on active slide
  useEffect(() => {
    videoRefs.current.forEach((el, idx) => {
      if (idx === activeSlide) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [activeSlide]);

  // Close comment form when slide changes to prevent misattachment
  useEffect(() => {
    setCommentInput(null);
  }, [activeSlide]);

  if (slides.length === 0) return null;

  const goToSlide = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(index, slides.length - 1));
    // Lock scroll handler to prevent activeSlide flicker during animation
    scrollLockRef.current = true;
    setActiveSlide(target);
    el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' });
    setTimeout(() => { scrollLockRef.current = false; }, 500);
  };

  const handleStoryScroll = useCallback(() => {
    // Skip if programmatic scroll is in progress
    if (scrollLockRef.current) return;
    if (scrollRafRef.current) return;
    scrollRafRef.current = true;
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el && el.clientWidth) {
        if (!hasStartedStoryTourRef.current && Math.abs(el.scrollLeft) > 1) {
          hasInteractedWithStorySwipeRef.current = true;
        }
        setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
      }
      scrollRafRef.current = false;
    });
  }, []);

  const handleLike = (idx: number) => {
    setHeartTrigger(Date.now());
    incrementLike(idx);
  };

  // Limit swipe to one slide at a time
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const THRESHOLD = 30;
    let startX = 0;
    let startY = 0;
    let decided = false;
    let isHorizontal = false;
    let triggered = false;

    const onTouchStart = (e: globalThis.TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      decided = false;
      isHorizontal = false;
      triggered = false;
    };

    const onTouchMove = (e: globalThis.TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // Decide direction once per gesture
      if (!decided && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        decided = true;
        isHorizontal = Math.abs(dx) > Math.abs(dy);
      }

      // Only intercept horizontal swipes — let vertical scroll through
      if (isHorizontal) {
        e.preventDefault();
        if (!hasStartedStoryTourRef.current) {
          hasInteractedWithStorySwipeRef.current = true;
        }
        if (!triggered && Math.abs(dx) > THRESHOLD) {
          triggered = true;
          goToSlide(activeSlide + (dx < 0 ? 1 : -1));
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [activeSlide, slides.length]);

  const handleAddComment = () => {
    if (!commentInput?.text.trim() || !commentInput?.name.trim()) return;
    const newComment = { name: commentInput.name, text: commentInput.text.trim() };
    addComment(newComment);
    setCommentTrigger({ ...newComment, id: Date.now() });
    setCommentInput(null);
  };

  return (
    <section ref={sectionRef} id="story-section" className="relative h-screen-safe w-full bg-ink overflow-hidden scroll-snap-container">
      <div ref={scrollContainerRef} data-tour="cinematic-story" onScroll={handleStoryScroll} className="h-full w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlide;
          const isNear = Math.abs(idx - activeSlide) <= 1;
          const canExpand = overflowingSlides.has(idx);

          return (
          <div key={idx} className="relative h-full w-full min-w-full snap-center flex items-center justify-center overflow-hidden">
            {/* Background media */}
            <div className="absolute inset-0 bg-ink">
              {/* Layer 1: Subtle ambient glow behind main media */}
              <div className="absolute inset-0" style={{ zIndex: 1, background: 'radial-gradient(ellipse at center, rgba(180,141,62,0.06) 0%, transparent 70%)' }} />
              {/* Layer 2: Main media */}
              {slide.bgVideo ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(idx, el);
                    else videoRefs.current.delete(idx);
                  }}
                  src={isActive ? slide.bgVideo : undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-contain opacity-85"
                  style={{ zIndex: 2 }}
                />
              ) : slide.bgImage ? (
                <Image
                  src={slide.bgImage}
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL={SHIMMER_DARK}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="object-contain opacity-85"
                  style={{ zIndex: 2 }}
                  alt={`${wedding?.groomNickname ?? ''} & ${wedding?.brideNickname ?? ''} - ${slide.year || `kisah ${idx + 1}`}`}
                  referrerPolicy="no-referrer"
                />
              ) : null}
              {/* Layer 3: Edge vignette — soft gradient edges blend media into black bg */}
              <div className="absolute inset-0" style={{ zIndex: 3, pointerEvents: 'none', boxShadow: 'inset 0 0 80px 30px rgba(0,0,0,0.6)' }} />
            </div>

            {/* Effects — conditional render (have timers/observers) */}
            {isActive && (
              <>
                <AmbientSocialLayer customComments={comments} triggerHeartTap={heartTrigger} triggerCommentTap={commentTrigger} />
                {!slide.bgVideo && <PetalEffect />}
              </>
            )}

            {/* Action buttons — always mounted, hidden via CSS */}
            <div className={`absolute bottom-36 right-4 lg:right-[calc(50%-320px)] flex flex-col gap-5 z-[60] transition-opacity duration-200 ${isActive && commentInput?.index !== idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <motion.button
                whileTap={{ scale: 0.8 }}
                aria-label="Suka"
                data-tour={isActive ? 'story-like-button' : undefined}
                onClick={() => handleLike(idx)}
                className="relative flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:bg-rose-pastel/20 transition-all">
                  <Heart className="w-5 h-5 text-rose-pastel transition-transform group-active:scale-125" fill={(likes[idx] ?? 0) > 120 ? 'currentColor' : 'none'} />
                </div>
                <span aria-hidden="true" className="text-[10px] font-sans text-white/70 tracking-widest">{likes[idx] ?? 0}</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.8 }}
                aria-label="Komentar"
                data-tour={isActive ? 'story-comment-button' : undefined}
                onClick={() => setCommentInput({ index: idx, name: '', text: '' })}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <MessageCircle className="w-5 h-5 text-ivory" />
                </div>
                <span aria-hidden="true" className="text-[10px] font-sans text-white/70 tracking-widest">{isActive ? comments.length : 0}</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {commentInput?.index === idx && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute inset-x-6 bottom-48 z-[70] max-w-sm mx-auto lg:left-1/2 lg:-translate-x-1/2 lg:inset-x-auto lg:w-[380px]">
                  <div className="bg-ink/95 border border-white/10 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="w-4 h-4 text-rose-pastel" />
                      <span className="text-xs uppercase tracking-[0.2em] text-ivory font-bold">Bagikan Kebahagiaan</span>
                    </div>
                    <input type="text" maxLength={30} value={commentInput.name} onChange={(e) => setCommentInput({ ...commentInput, name: e.target.value })} placeholder="Nama Anda" aria-label="Nama Anda" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-white/20 focus:outline-none focus:border-gold/50 mb-3 font-sans" />
                    <textarea maxLength={100} value={commentInput.text} onChange={(e) => setCommentInput({ ...commentInput, text: e.target.value })} placeholder="Tulis pesan..." aria-label="Tulis pesan" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-white/20 focus:outline-none focus:border-rose-pastel/50 min-h-[80px] resize-none font-sans" />
                    <div className="flex justify-end gap-2 mt-4 font-sans">
                      <button onClick={() => setCommentInput(null)} className="px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors">Batal</button>
                      <button disabled={!commentInput.text.trim() || !commentInput.name.trim()} onClick={() => handleAddComment()} className="px-6 py-2 bg-rose-pastel rounded-full text-ink text-xs uppercase font-black tracking-widest hover:brightness-110 disabled:opacity-30 transition-all">Kirim</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text content — always mounted, CSS fade */}
            <div className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-ink from-30% via-ink/70 via-60% to-transparent transition-opacity duration-300 ${isNear ? 'opacity-100' : 'opacity-0'}`}>
              <div
                className={`px-5 lg:px-0 pt-24 pb-20 sm:pb-24 md:pb-32 max-w-[85%] md:max-w-md lg:max-w-lg lg:mx-auto ${canExpand ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/30 focus-visible:rounded' : ''}`}
                {...(canExpand ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': expandedSlides.has(idx) ? 'Sembunyikan teks' : 'Baca selengkapnya',
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedSlides(prev => {
                        const next = new Set(prev);
                        if (next.has(idx)) next.delete(idx); else next.add(idx);
                        return next;
                      });
                    }
                  },
                } : {})}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canExpand) return;
                  setExpandedSlides(prev => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx); else next.add(idx);
                    return next;
                  });
                }}
              >
                <h2 className="font-serif italic text-xs md:text-sm text-ivory/90 leading-relaxed whitespace-pre-line font-bold mb-1">{slide.year}</h2>
                <p
                  ref={(el) => {
                    if (el) textRefs.current.set(idx, el);
                    else textRefs.current.delete(idx);
                  }}
                  className={`font-serif italic text-xs md:text-sm text-ivory/70 leading-relaxed whitespace-pre-line break-words ${expandedSlides.has(idx) && canExpand ? '' : 'line-clamp-3'}`}
                >
                  {slide.text}
                </p>
                {canExpand && (
                  <span className="font-serif italic text-xs text-gold mt-1 block">
                    {expandedSlides.has(idx) ? 'sembunyikan...' : 'baca selengkapnya...'}
                  </span>
                )}
              </div>
            </div>

          </div>
          );
        })}
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-40">
        {slides.map((_, i) => (
          <motion.div key={i} animate={{ scale: i === activeSlide ? 1.2 : 0.8, width: i === activeSlide ? 20 : 6, opacity: i === activeSlide ? 1 : 0.3 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="h-1.5 bg-ivory rounded-full transition-colors duration-500" />
        ))}
      </div>
    </section>
  );
});
