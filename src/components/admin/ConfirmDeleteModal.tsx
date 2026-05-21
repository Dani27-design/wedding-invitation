'use client';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDeleteModal({ isOpen, message, onConfirm, onCancel, title, confirmLabel, variant = 'danger' }: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-gold/10 w-full max-w-xs text-center"
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <AlertCircle className={`w-12 h-12 ${variant === 'danger' ? 'text-red-400' : 'text-gold'}`} />
              <div className="space-y-1">
                <h3 className="font-serif italic text-lg text-ink">{title ?? 'Konfirmasi Hapus'}</h3>
                <p className="text-xs text-ink/60 leading-relaxed">{message}</p>
              </div>
              <div className="flex gap-3 mt-4 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 border border-gold/20 text-ink/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-transform ${variant === 'danger' ? 'bg-red-500 text-white' : 'bg-gold text-ivory'}`}
                >
                  {confirmLabel ?? 'Hapus'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
