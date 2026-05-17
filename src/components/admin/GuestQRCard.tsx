'use client';
import { useState, useEffect } from 'react';
import { generateQRDataURL } from '@/utils/qrGenerate';

interface GuestQRCardProps {
  guestName: string;
  coupleName: string;
  invitationUrl: string;
  className?: string;
  compact?: boolean;
}

export function GuestQRCard({ guestName, coupleName, invitationUrl, className = '', compact = false }: GuestQRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    setQrError(false);
    generateQRDataURL(invitationUrl).then((url) => {
      if (url) { setQrDataUrl(url); }
      else { setQrError(true); }
    });
  }, [invitationUrl]);

  const qrSize = compact ? 'w-[120px] h-[120px]' : 'w-[180px] h-[180px]';

  return (
    <div className={`relative overflow-hidden rounded-3xl ${compact ? 'w-[220px] p-4' : 'w-[300px] p-6'} flex flex-col items-center text-center ${className}`}
      style={{ background: 'linear-gradient(170deg, #FAF7F2 0%, #F5F0E8 40%, #F2EBE0 100%)' }}
    >
      {/* Inner decorative border */}
      <div className="absolute inset-[6px] rounded-[20px] border border-gold/15 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(180,141,62,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(219,170,185,0.08) 0%, transparent 70%)' }} />

      {/* Top ornament */}
      <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-2'}`}>
        <svg width={compact ? 20 : 28} height="2" viewBox="0 0 28 2"><line x1="0" y1="1" x2="28" y2="1" stroke="rgba(180,141,62,0.3)" strokeWidth="1" /></svg>
        <svg width={compact ? 10 : 14} height={compact ? 10 : 14} viewBox="0 0 14 14" fill="none">
          <path d="M7 2C5.5 0 3 0.5 2 2.5C1 4.5 2.5 7 7 11C11.5 7 13 4.5 12 2.5C11 0.5 8.5 0 7 2Z" fill="rgba(180,141,62,0.2)" stroke="rgba(180,141,62,0.35)" strokeWidth="0.5" />
        </svg>
        <svg width={compact ? 20 : 28} height="2" viewBox="0 0 28 2"><line x1="0" y1="1" x2="28" y2="1" stroke="rgba(180,141,62,0.3)" strokeWidth="1" /></svg>
      </div>

      {/* Couple name */}
      <p className={`font-dayland text-gold relative z-10 ${compact ? 'text-lg mb-2' : 'text-2xl mb-4'}`}>{coupleName}</p>

      {/* QR Code container */}
      <div className={`relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gold/10 shadow-[0_2px_12px_rgba(180,141,62,0.08)] ${compact ? 'p-2 mb-2' : 'p-3 mb-4'}`}>
        {/* Corner accents */}
        <svg className="absolute -top-1 -left-1 w-4 h-4 text-gold/20" viewBox="0 0 16 16"><path d="M0 8C0 3.6 3.6 0 8 0" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="8" cy="0" r="1" fill="currentColor" /></svg>
        <svg className="absolute -top-1 -right-1 w-4 h-4 text-gold/20" viewBox="0 0 16 16"><path d="M16 8C16 3.6 12.4 0 8 0" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="8" cy="0" r="1" fill="currentColor" /></svg>
        <svg className="absolute -bottom-1 -left-1 w-4 h-4 text-gold/20" viewBox="0 0 16 16"><path d="M0 8C0 12.4 3.6 16 8 16" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="8" cy="16" r="1" fill="currentColor" /></svg>
        <svg className="absolute -bottom-1 -right-1 w-4 h-4 text-gold/20" viewBox="0 0 16 16"><path d="M16 8C16 12.4 12.4 16 8 16" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="8" cy="16" r="1" fill="currentColor" /></svg>

        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR Code untuk ${guestName}`} className={qrSize} />
        ) : qrError ? (
          <div className={`${qrSize} flex items-center justify-center text-center px-4`}>
            <p className="text-[10px] text-red-400">QR tidak dapat dibuat. Nama terlalu panjang.</p>
          </div>
        ) : (
          <div className={`${qrSize} flex items-center justify-center`}>
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Guest name */}
      <p className={`font-serif italic text-ink relative z-10 line-clamp-2 ${compact ? 'text-sm max-w-[190px] mb-1' : 'text-lg max-w-[260px] mb-2'}`}>{guestName}</p>

      {/* Bottom ornament */}
      <div className="flex items-center gap-1.5 mb-2">
        <svg width={compact ? 16 : 24} height="2" viewBox="0 0 24 2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(180,141,62,0.2)" strokeWidth="1" /></svg>
        <svg width={compact ? 6 : 8} height={compact ? 6 : 8} viewBox="0 0 8 8" fill="rgba(180,141,62,0.15)">
          <path d="M4 0L5.2 2.8L8 4L5.2 5.2L4 8L2.8 5.2L0 4L2.8 2.8Z" />
        </svg>
        <svg width={compact ? 16 : 24} height="2" viewBox="0 0 24 2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(180,141,62,0.2)" strokeWidth="1" /></svg>
      </div>

      {/* Footer */}
      <p className={`text-ink/30 uppercase tracking-[0.2em] font-sans font-bold ${compact ? 'text-[6px]' : 'text-[8px]'}`}>
        Scan untuk membuka
      </p>
      <p className={`text-ink/30 uppercase tracking-[0.2em] font-sans font-bold ${compact ? 'text-[6px]' : 'text-[8px]'}`}>
        undangan pernikahan
      </p>
    </div>
  );
}
