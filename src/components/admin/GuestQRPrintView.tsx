'use client';
import { useState, useEffect, useCallback } from 'react';
import { Heart, Printer, X } from 'lucide-react';
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
          // Skip failed QR (name too long or encoding error)
          items.push({ name: guests[i].name, dataUrl: '' });
        }
      }

      if (cancelled) return;

      // Progressive render: update state with current items
      setQrItems([...items]);
      setProgress(Math.round((end / guests.length) * 100));

      // If more to process, yield to browser then continue
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
            <button onClick={onClose} className="p-2 text-ink/40 hover:text-ink transition-colors">
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

      {/* QR Grid (print area) — renders progressively as items are generated */}
      {qrItems.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6 print:max-w-none print:px-4 print:py-2">
          <div className="grid grid-cols-2 gap-4 print:gap-2 print:grid-cols-2">
            {qrItems.map((item, i) => (
              <div
                key={i}
                className="bg-ivory border border-gold/20 rounded-2xl p-5 flex flex-col items-center text-center print:rounded-lg print:p-3 print:border-gold/30 break-inside-avoid"
              >
                {/* Couple name */}
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-px bg-gold/30 print:w-3" />
                  <Heart className="w-2.5 h-2.5 text-gold/40 fill-gold/15" />
                  <div className="w-4 h-px bg-gold/30 print:w-3" />
                </div>
                <p className="font-dayland text-lg text-gold mb-3 print:text-base print:mb-2">{coupleName}</p>

                {/* QR */}
                <div className="bg-white p-2 rounded-lg border border-gold/10 mb-3 print:mb-2">
                  {item.dataUrl ? (
                    <img src={item.dataUrl} alt={`QR ${item.name}`} className="w-[140px] h-[140px] print:w-[120px] print:h-[120px]" />
                  ) : (
                    <div className="w-[140px] h-[140px] print:w-[120px] print:h-[120px] flex items-center justify-center text-[8px] text-ink/30">
                      Gagal
                    </div>
                  )}
                </div>

                {/* Guest name */}
                <p className="font-serif italic text-sm text-ink print:text-xs truncate max-w-[250px]">{item.name}</p>

                {/* Separator */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-5 h-px bg-gold/15" />
                  <Heart className="w-2 h-2 text-gold/25 fill-gold/10" />
                  <div className="w-5 h-px bg-gold/15" />
                </div>

                <p className="text-[7px] text-ink/30 uppercase tracking-widest mt-1 font-sans print:text-[6px]">
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
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  );
}
