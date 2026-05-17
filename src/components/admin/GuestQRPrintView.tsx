'use client';
import { useState, useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { Guest } from '@/types/firestore';
import { BASE_URL } from '@/constants/baseUrl';
import { GuestQRCard } from './GuestQRCard';

interface GuestQRPrintViewProps {
  isOpen: boolean;
  guests: Guest[];
  slug: string;
  coupleName: string;
  onClose: () => void;
}

const BATCH_SIZE = 20;

export function GuestQRPrintView({ isOpen, guests, slug, coupleName, onClose }: GuestQRPrintViewProps) {
  const [readyCount, setReadyCount] = useState(0);
  const [batches, setBatches] = useState<Guest[][]>([]);

  useEffect(() => {
    if (!isOpen || guests.length === 0) return;
    let cancelled = false;

    // Release guests in batches so the browser can render progressively
    const allBatches: Guest[][] = [];
    for (let i = 0; i < guests.length; i += BATCH_SIZE) {
      allBatches.push(guests.slice(i, i + BATCH_SIZE));
    }

    async function releaseBatches() {
      for (let i = 0; i < allBatches.length; i++) {
        if (cancelled) return;
        setBatches(allBatches.slice(0, i + 1));
        setReadyCount((i + 1) * BATCH_SIZE);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (!cancelled) setReadyCount(guests.length);
    }

    setBatches([]);
    setReadyCount(0);
    releaseBatches();

    return () => { cancelled = true; };
  }, [isOpen, guests]);

  if (!isOpen) return null;

  const isReady = readyCount >= guests.length;
  const progress = guests.length > 0 ? Math.round((readyCount / guests.length) * 100) : 0;
  const visibleGuests = batches.flat();

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
              onClick={() => window.print()}
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
      {!isReady && (
        <div className="max-w-4xl mx-auto px-4 py-8 text-center print:hidden">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif italic text-sm text-ink/60 mb-2">Menyiapkan kartu...</p>
          <div className="w-48 h-1.5 bg-ink/5 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[9px] text-ink/30 mt-1">{progress}% — {Math.min(readyCount, guests.length)} dari {guests.length}</p>
        </div>
      )}

      {/* QR Card Grid */}
      {visibleGuests.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6 print:max-w-none print:px-2 print:py-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:gap-2 print:grid-cols-3 justify-items-center">
            {visibleGuests.map((guest) => (
              <div key={guest.id} className="break-inside-avoid">
                <GuestQRCard
                  guestName={guest.name}
                  coupleName={coupleName}
                  invitationUrl={`${BASE_URL}/${slug}?to=${encodeURIComponent(guest.name)}`}
                  compact
                />
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
