'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface CompressionModalProps {
  isOpen: boolean;
  current: number;
  total: number;
  currentFileName: string;
}

export function CompressionModal({ isOpen, current, total, currentFileName }: CompressionModalProps) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-gold/10 w-full max-w-xs text-center"
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-10 h-10 text-gold animate-spin" />

              <div className="space-y-1">
                <h3 className="text-lg text-ink">Mengompres Media</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink/80 font-black">
                  {current} / {total} file
                </p>
              </div>

              <div className="w-full space-y-2">
                <div className="w-full h-2 bg-gold/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-ink/80 truncate">{currentFileName}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
