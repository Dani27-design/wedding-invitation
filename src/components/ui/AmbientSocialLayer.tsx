'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';


interface AmbientSocialLayerProps {
  customComments?: { name: string; text: string }[];
  triggerHeartTap?: number;
  triggerCommentTap?: { name: string; text: string; id: number } | null;
}

interface SocialElement {
  id: number;
  type: 'heart' | 'comment';
  text?: string;
  x: number;
  delay: number;
  isBurst?: boolean;
  isInstant?: boolean;
}

export const AmbientSocialLayer = ({
  customComments = [],
  triggerHeartTap,
  triggerCommentTap,
}: AmbientSocialLayerProps) => {
  const [elements, setElements] = useState<SocialElement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pool = [...customComments.map((c) => `${c.name}: ${c.text}`)];
  const poolRef = useRef(pool);
  poolRef.current = pool;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (triggerHeartTap) {
      const burstEl: SocialElement = {
        id: Date.now() + Math.random(),
        type: 'heart',
        x: 70 + Math.random() * 20,
        delay: 0,
        isBurst: true,
      };
      setElements((prev) => [...prev.slice(-20), burstEl]);
    }
  }, [triggerHeartTap]);

  useEffect(() => {
    if (triggerCommentTap) {
      const instantEl: SocialElement = {
        id: triggerCommentTap.id,
        type: 'comment',
        text: `${triggerCommentTap.name}: ${triggerCommentTap.text}`,
        x: 40 + Math.random() * 20,
        delay: 0,
        isInstant: true,
      };
      setElements((prev) => [...prev.slice(-20), instantEl]);
    }
  }, [triggerCommentTap]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setElements((prev) => {
        const currentPool = poolRef.current;
        const isComment = Math.random() > 0.6;
        const newEl: SocialElement = {
          id: Date.now() + Math.random(),
          type: isComment ? 'comment' : 'heart',
          text: isComment ? currentPool[Math.floor(Math.random() * currentPool.length)] : undefined,
          x: isComment ? 20 + Math.random() * 60 : 5 + Math.random() * 90,
          delay: Math.random() * 1.5,
        };
        return [...prev.slice(-20), newEl];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={rootRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {elements.map((el) => (
          <motion.div
            key={el.id}
            initial={{
              opacity: 0,
              y: el.isBurst || el.isInstant ? '70vh' : '100vh',
              x: `${el.x}vw`,
              scale: el.isBurst || el.isInstant ? 0.7 : 1,
              translateX: '-50%',
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: '-15vh',
              x: [`${el.x}vw`, `${el.x + (Math.random() * 15 - 7.5)}vw`],
              scale: el.isBurst || el.isInstant ? [0.7, 1.2, 1] : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: el.isBurst || el.isInstant ? 4 + Math.random() * 2 : 14 + Math.random() * 6,
              ease: el.isInstant ? 'easeOut' : 'linear',
              delay: el.delay,
            }}
            className={`absolute will-change-transform ${el.isInstant ? 'z-50' : 'z-20'}`}
          >
            {el.type === 'heart' ? (
              <Heart className={`${el.isBurst ? 'w-6 h-6' : 'w-3 h-3'} text-rose-pastel fill-rose-pastel/40 drop-shadow-sm`} />
            ) : (
              <span
                className={`text-[10px] font-sans tracking-[0.1em] uppercase text-white/95 whitespace-nowrap bg-black/40 border ${el.isInstant ? 'border-rose-pastel/60 scale-110' : 'border-white/10'} px-4 py-2 rounded-full backdrop-blur-md shadow-2xl`}
              >
                {el.text}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
