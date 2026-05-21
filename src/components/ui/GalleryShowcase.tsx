'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryGroup {
  label: string;
  items: { src: string; alt: string }[];
}

export function GalleryShowcase({ groups }: { groups: GalleryGroup[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {groups.map(({ label, items }) => (
        <div key={label} className="mb-8 last:mb-0">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">{label}</p>
          <div className={`flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:overflow-visible ${items.length <= 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-7'}`}>
            {items.map(({ src, alt }) => (
              <button
                key={src}
                onClick={() => setSelected(src)}
                className="w-[120px] sm:w-[150px] lg:w-auto flex-shrink-0 lg:flex-shrink rounded-xl overflow-hidden border border-gold/10 shadow-sm leading-none hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1 transition-all duration-300 cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="w-full block" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Zoom modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 px-4 py-8"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-ivory hover:bg-white/20 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selected}
              alt="Preview"
              className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
