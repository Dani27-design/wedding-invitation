'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NextImage from 'next/image';

interface GalleryGroup {
  label: string;
  items: { src: string; alt: string }[];
  phoneFrame?: boolean;
}

const PHONE_FRAME_SIZES = '(max-width: 640px) 128px, (max-width: 1024px) 155px, 14vw';
const PLAIN_SIZES = '(max-width: 640px) 120px, (max-width: 1024px) 150px, 14vw';

export function GalleryShowcase({ groups }: { groups: GalleryGroup[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {groups.map(({ label, items, phoneFrame }) => (
        <div key={label} className="mb-8 last:mb-0">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">{label}</p>
          <div className={`flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:overflow-visible ${items.length <= 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-7'}`}>
            {items.map(({ src, alt }) => (
              <button
                key={src}
                onClick={() => setSelected(src)}
                className={`flex-shrink-0 lg:flex-shrink leading-none hover:-translate-y-1 transition-all duration-300 cursor-zoom-in ${phoneFrame ? 'w-[140px] sm:w-[170px] lg:w-auto' : 'w-[120px] sm:w-[150px] lg:w-auto rounded-xl overflow-hidden border border-gold/10 shadow-sm hover:shadow-lg hover:shadow-gold/10'}`}
              >
                {phoneFrame ? (
                  <div className="relative w-full" style={{ aspectRatio: '320/660' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/iphone-frame.svg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
                    <div className="absolute overflow-hidden bg-white" style={{ top: '2.1%', left: '4.4%', width: '91.2%', height: '95.8%', borderRadius: '13.1% / 6.4%' }}>
                      <NextImage
                        src={src}
                        alt={alt}
                        fill
                        sizes={PHONE_FRAME_SIZES}
                        loading="lazy"
                        className="object-contain object-top"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                    <NextImage
                      src={src}
                      alt={alt}
                      fill
                      sizes={PLAIN_SIZES}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Zoom modal — keeps motion.img for animation compatibility */}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selected}
              alt="Preview"
              className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain cursor-pointer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
