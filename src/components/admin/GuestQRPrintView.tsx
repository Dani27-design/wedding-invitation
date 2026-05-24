'use client';
import { useState, useEffect, useCallback } from 'react';
import { Printer, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const isReady = readyCount >= guests.length;
  const progress = guests.length > 0 ? Math.round((readyCount / guests.length) * 100) : 0;
  const visibleGuests = batches.flat();

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Confirmation modal */}
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 print:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-xs text-center"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-ink/80 hover:text-ink" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-3 py-4">
              {!isReady ? (
                <>
                  <Loader2 className="w-10 h-10 text-gold animate-spin" />
                  <h3 className="text-lg text-ink">Menyiapkan QR Code</h3>
                  <div className="w-full space-y-1">
                    <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-ink/80">{Math.min(readyCount, guests.length)} dari {guests.length} tamu</p>
                  </div>
                </>
              ) : (
                <>
                  <Printer className="w-10 h-10 text-gold" />
                  <h3 className="text-lg text-ink">Print QR Code</h3>
                  <p className="text-xs text-ink/80">
                    {guests.length} kartu QR siap dicetak
                  </p>
                  <p className="text-[10px] text-ink/80">{coupleName}</p>
                  <button
                    onClick={handlePrint}
                    className="mt-2 px-8 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
                  >
                    Print Sekarang
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Hidden print-only content */}
      <div className="hidden print:block" id="qr-print-view">
        <div className="flex flex-wrap justify-center" id="qr-card-grid">
          {visibleGuests.map((guest) => (
            <div key={guest.id}>
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

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #qr-print-view,
          #qr-print-view * {
            visibility: visible !important;
          }
          #qr-print-view {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            z-index: 99999 !important;
            background: white !important;
          }
          #qr-print-view * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          #qr-card-grid {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            align-content: flex-start !important;
            gap: 1.5mm !important;
            padding: 0 !important;
          }
          #qr-card-grid > div {
            width: 65mm !important;
            height: 71mm !important;
            flex-shrink: 0 !important;
          }
          #qr-card-grid > div > div {
            width: 100% !important;
            height: 100% !important;
            padding: 3mm !important;
            border-radius: 3mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          @page {
            margin: 3mm;
            size: A4;
          }
        }
      `}</style>
    </>
  );
}
