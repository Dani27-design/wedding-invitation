'use client';
import { useState, useEffect, useCallback, useRef, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Gift, MapPin, X, Play, Pause } from 'lucide-react';
import { dispatchFloatingNavigationStart } from '../../utils/floatingNavigationEvents';

interface FloatingControllerProps {
  isToolsOpen: boolean;
  setIsToolsOpen: (open: boolean) => void;
  isPlaying: boolean;
  toggleMusic: () => void;
}

const NAVIGATION_RETRY_DELAY_MS = 120;
const NAVIGATION_MAX_WAIT_MS = 6000;
const NAVIGATION_SCROLL_OFFSET_PX = 8;
const NAVIGATION_SMOOTH_RETRY_DELAY_MS = 500;
const NAVIGATION_INSTANT_FALLBACK_DELAY_MS = 1600;
const DRAG_CLICK_CANCEL_THRESHOLD_PX = 6;

function getDocumentScrollTop() {
  return document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
}

function isDriverScrollLocked() {
  return document.body.classList.contains('driver-no-scroll');
}

export const FloatingController = ({
  isToolsOpen,
  setIsToolsOpen,
  isPlaying,
  toggleMusic,
}: FloatingControllerProps) => {
  const navigationCleanupRef = useRef<(() => void) | null>(null);
  const scrollFallbackTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    didDrag: boolean;
  } | null>(null);
  const ignoreNextClickRef = useRef(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [constraints, setConstraints] = useState({
    left: -700,
    right: 0,
    top: -600,
    bottom: 0,
  });

  useEffect(() => {
    const update = () => {
      const nextConstraints = {
        left: -(window.innerWidth - 80),
        right: 0,
        top: -(window.innerHeight - 100),
        bottom: 0,
      };

      setConstraints(nextConstraints);
      setPosition((current) => ({
        x: Math.min(nextConstraints.right, Math.max(nextConstraints.left, current.x)),
        y: Math.min(nextConstraints.bottom, Math.max(nextConstraints.top, current.y)),
      }));
    };
    update();
    let timer: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 200);
    };
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, []);

  const clearPendingNavigation = useCallback(() => {
    navigationCleanupRef.current?.();
    navigationCleanupRef.current = null;
    scrollFallbackTimersRef.current.forEach((timer) => clearTimeout(timer));
    scrollFallbackTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearPendingNavigation();
  }, [clearPendingNavigation]);

  const scrollToMountedSection = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return false;

    const initialScrollTop = getDocumentScrollTop();
    const targetTop = Math.max(
      0,
      target.getBoundingClientRect().top + initialScrollTop - NAVIGATION_SCROLL_OFFSET_PX,
    );

    try {
      window.scrollTo({ top: targetTop, left: 0, behavior: 'smooth' });
    } catch {
      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      } else {
        window.scrollTo(0, targetTop);
      }
    }

    const hasMovedOrReachedTarget = () => {
      const scrollChanged = Math.abs(getDocumentScrollTop() - initialScrollTop) > 1;
      const targetReached = Math.abs(target.getBoundingClientRect().top - NAVIGATION_SCROLL_OFFSET_PX) <= 24;

      return scrollChanged || targetReached;
    };

    const scheduleScrollFallback = (delay: number, callback: () => void) => {
      const timer = setTimeout(() => {
        scrollFallbackTimersRef.current = scrollFallbackTimersRef.current.filter((item) => item !== timer);
        callback();
      }, delay);
      scrollFallbackTimersRef.current.push(timer);
    };

    scheduleScrollFallback(NAVIGATION_SMOOTH_RETRY_DELAY_MS, () => {
      if (!hasMovedOrReachedTarget() && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
    });

    scheduleScrollFallback(NAVIGATION_INSTANT_FALLBACK_DELAY_MS, () => {
      const scrollChanged = Math.abs(getDocumentScrollTop() - initialScrollTop) > 1;
      const targetReached = Math.abs(target.getBoundingClientRect().top - NAVIGATION_SCROLL_OFFSET_PX) <= 24;

      if (!scrollChanged && !targetReached) {
        window.scrollTo(0, targetTop);
      }
    });

    setIsToolsOpen(false);
    return true;
  }, [setIsToolsOpen]);

  const scrollToSection = useCallback((sectionId: string) => {
    clearPendingNavigation();
    dispatchFloatingNavigationStart(sectionId);

    const startedAt = Date.now();
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      observer?.disconnect();
      observer = null;
    };

    const tryScroll = () => {
      if (cancelled) return true;
      if (isDriverScrollLocked()) {
        if (Date.now() - startedAt >= NAVIGATION_MAX_WAIT_MS) {
          cleanup();
          return true;
        }
        return false;
      }
      if (scrollToMountedSection(sectionId)) {
        cleanup();
        return true;
      }
      if (Date.now() - startedAt >= NAVIGATION_MAX_WAIT_MS) {
        cleanup();
        return true;
      }
      return false;
    };

    const scheduleRetry = () => {
      if (cancelled) return;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        if (!tryScroll()) scheduleRetry();
      }, NAVIGATION_RETRY_DELAY_MS);
    };

    navigationCleanupRef.current = cleanup;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (tryScroll()) return;
        observer = new MutationObserver(() => {
          tryScroll();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        scheduleRetry();
      });
    });
  }, [clearPendingNavigation, scrollToMountedSection]);

  const handleMainPointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      didDrag: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [position.x, position.y]);

  const handleMainPointerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.hypot(deltaX, deltaY) > DRAG_CLICK_CANCEL_THRESHOLD_PX) {
      dragState.didDrag = true;
    }

    const nextX = Math.min(constraints.right, Math.max(constraints.left, dragState.originX + deltaX));
    const nextY = Math.min(constraints.bottom, Math.max(constraints.top, dragState.originY + deltaY));
    setPosition({ x: nextX, y: nextY });
  }, [constraints.bottom, constraints.left, constraints.right, constraints.top]);

  const finishMainPointerInteraction = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    ignoreNextClickRef.current = dragState.didDrag;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleMainButtonClick = useCallback(() => {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    setIsToolsOpen(!isToolsOpen);
  }, [isToolsOpen, setIsToolsOpen]);

  return (
  <motion.div
    style={{ x: position.x, y: position.y }}
    data-floating-controller
    className="fixed bottom-8 right-5 z-[100] flex flex-col items-center gap-4"
  >
    <AnimatePresence>
      {isToolsOpen && (
        <div className="flex flex-col items-center gap-3 mb-2">
          {[
            { id: 'event-section', label: 'Rangkaian Acara', icon: MapPin },
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
              onClick={() => scrollToSection(tool.id)}
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
            <span className="font-sans text-[8px] tracking-[0.1em] sm:tracking-[0.2em] uppercase text-ink font-bold">{isPlaying ? 'Senyapkan Musik' : 'Putar Musik'}</span>
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
        onPointerDown={handleMainPointerDown}
        onPointerMove={handleMainPointerMove}
        onPointerUp={finishMainPointerInteraction}
        onPointerCancel={finishMainPointerInteraction}
        whileTap={{ scale: 0.9 }}
        aria-label={isToolsOpen ? 'Tutup menu' : 'Buka menu'}
        data-tour="floating-menu-button"
        onClick={handleMainButtonClick}
        className={`relative w-14 h-14 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing backdrop-blur-xl border border-rose-pastel/40 rounded-full transition-all duration-700 shadow-2xl group overflow-hidden ${isToolsOpen ? 'bg-ink border-rose-pastel' : 'bg-ivory/60'}`}
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
};
