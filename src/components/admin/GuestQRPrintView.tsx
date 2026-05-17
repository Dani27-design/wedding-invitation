'use client';
import { useState, useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { generateQRDataURL } from '@/utils/qrGenerate';
import { Guest } from '@/types/firestore';
import { BASE_URL } from '@/constants/baseUrl';

interface GuestQRPrintViewProps {
  isOpen: boolean;
  guests: Guest[];
  slug: string;
  coupleName: string;
  onClose: () => void;
}

interface QRItem {
  name: string;
  dataUrl: string;
}

const BATCH_SIZE = 20;

export function GuestQRPrintView({ isOpen, guests, slug, coupleName, onClose }: GuestQRPrintViewProps) {
  const [qrItems, setQrItems] = useState<QRItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || guests.length === 0) return;
    let cancelled = false;

    async function generateBatch(startIndex: number, items: QRItem[]) {
      const end = Math.min(startIndex + BATCH_SIZE, guests.length);

      for (let i = startIndex; i < end; i++) {
        if (cancelled) return;
        try {
          const url = `${BASE_URL}/${slug}?to=${encodeURIComponent(guests[i].name)}`;
          const dataUrl = await generateQRDataURL(url);
          items.push({ name: guests[i].name, dataUrl });
        } catch {
          items.push({ name: guests[i].name, dataUrl: '' });
        }
      }

      if (cancelled) return;

      setQrItems([...items]);
      setProgress(Math.round((end / guests.length) * 100));

      if (end < guests.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await generateBatch(end, items);
      }
    }

    setIsGenerating(true);
    setProgress(0);
    setQrItems([]);

    generateBatch(0, []).then(() => {
      if (!cancelled) setIsGenerating(false);
    });

    return () => { cancelled = true; };
  }, [isOpen, guests, slug]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const isReady = !isGenerating && qrItems.length > 0;

  return (
    <div className="fixed inset-0 z-[200] bg-ivory overflow-y-auto">
      {/* Header (hidden in print) */}
      <div className="sticky top-0 z-10 bg-ivory/90 backdrop-blur-md border-b border-gold/10 px-4 py-3 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif italic text-lg text-ink">Print QR Code</h1>
            <p className="text-[10px] text-ink/40">{guests.length} tamu — {coupleName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!isReady}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-ivory rounded-full text-[10px] uppercase tracking-[0.2em] font-black shadow-md hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button onClick={onClose} className="p-2 text-ink/40 hover:text-ink transition-colors" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Generating progress */}
      {isGenerating && (
        <div className="max-w-4xl mx-auto px-4 py-8 text-center print:hidden">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif italic text-sm text-ink/60 mb-2">Membuat QR Code...</p>
          <div className="w-48 h-1.5 bg-ink/5 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[9px] text-ink/30 mt-1">{progress}% — {qrItems.length} dari {guests.length}</p>
        </div>
      )}

      {/* QR Grid */}
      {qrItems.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6 print:max-w-none print:px-4 print:py-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:gap-2 print:grid-cols-3">
            {qrItems.map((item, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl p-4 flex flex-col items-center text-center print:rounded-lg print:p-3 break-inside-avoid"
                style={{ background: 'linear-gradient(170deg, #FAF7F2 0%, #F5F0E8 40%, #F2EBE0 100%)' }}
              >
                {/* Inner border */}
                <div className="absolute inset-[4px] rounded-[14px] border border-gold/15 pointer-events-none print:inset-[3px] print:rounded-[10px]" />

                {/* Top ornament */}
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-px bg-gold/25 print:w-3" />
                  <svg width="8" height="8" viewBox="0 0 14 14" fill="none" className="print:w-[6px] print:h-[6px]">
                    <path d="M7 2C5.5 0 3 0.5 2 2.5C1 4.5 2.5 7 7 11C11.5 7 13 4.5 12 2.5C11 0.5 8.5 0 7 2Z" fill="rgba(180,141,62,0.2)" stroke="rgba(180,141,62,0.3)" strokeWidth="0.5" />
                  </svg>
                  <div className="w-4 h-px bg-gold/25 print:w-3" />
                </div>

                {/* Couple name */}
                <p className="font-dayland text-base text-gold mb-2 print:text-sm print:mb-1">{coupleName}</p>

                {/* QR */}
                <div className="bg-white/90 p-2 rounded-xl border border-gold/10 shadow-[0_1px_8px_rgba(180,141,62,0.06)] mb-2 print:p-1.5 print:rounded-lg print:mb-1.5">
                  {item.dataUrl ? (
                    <img src={item.dataUrl} alt={`QR ${item.name}`} className="w-[120px] h-[120px] print:w-[100px] print:h-[100px]" />
                  ) : (
                    <div className="w-[120px] h-[120px] print:w-[100px] print:h-[100px] flex items-center justify-center text-[8px] text-ink/30">
                      Gagal
                    </div>
                  )}
                </div>

                {/* Guest name */}
                <p className="font-serif italic text-sm text-ink print:text-xs truncate max-w-[180px] print:max-w-[150px]">{item.name}</p>

                {/* Bottom ornament */}
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="w-4 h-px bg-gold/15 print:w-3" />
                  <svg width="6" height="6" viewBox="0 0 8 8" fill="rgba(180,141,62,0.12)"><path d="M4 0L5.2 2.8L8 4L5.2 5.2L4 8L2.8 5.2L0 4L2.8 2.8Z" /></svg>
                  <div className="w-4 h-px bg-gold/15 print:w-3" />
                </div>

                <p className="text-[6px] text-ink/25 uppercase tracking-[0.15em] mt-1 font-sans font-bold print:text-[5px]">
                  Scan untuk membuka undangan
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body > *:not(.fixed) { visibility: hidden; }
          .fixed { position: static !important; overflow: visible !important; }
          .fixed > * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          @page { margin: 8mm; }
        }
      `}</style>
    </div>
  );
}
