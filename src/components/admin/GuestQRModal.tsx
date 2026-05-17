'use client';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, MessageCircle } from 'lucide-react';
import { GuestQRCard } from './GuestQRCard';

interface GuestQRModalProps {
  isOpen: boolean;
  guestName: string;
  coupleName: string;
  invitationUrl: string;
  whatsappUrl: string | null;
  onClose: () => void;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
}

export function GuestQRModal({ isOpen, guestName, coupleName, invitationUrl, whatsappUrl, onClose }: GuestQRModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR - ${escapeHtml(guestName)}</title>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: serif; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;
    const img = content.querySelector('img');
    if (!img) return;
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `qr-${sanitizeFilename(guestName)}.png`;
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
            className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-sm"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-ink/20 hover:text-ink/40">
              <X className="w-5 h-5" />
            </button>

            {/* QR Card (used for print) */}
            <div ref={printRef} className="flex justify-center mb-6">
              <GuestQRCard
                guestName={guestName}
                coupleName={coupleName}
                invitationUrl={invitationUrl}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gold/20 text-ink/70 rounded-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-gold/5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gold/20 text-ink/70 rounded-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-gold/5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh
              </button>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WA
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
