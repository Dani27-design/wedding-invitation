'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { generateQRDataURL } from '@/utils/qrGenerate';

interface GuestQRCardProps {
  guestName: string;
  coupleName: string;
  invitationUrl: string;
  className?: string;
}

export function GuestQRCard({ guestName, coupleName, invitationUrl, className = '' }: GuestQRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    setQrError(false);
    generateQRDataURL(invitationUrl).then((url) => {
      if (url) { setQrDataUrl(url); }
      else { setQrError(true); }
    });
  }, [invitationUrl]);

  return (
    <div className={`bg-ivory border-2 border-gold/20 rounded-2xl p-6 flex flex-col items-center text-center w-[300px] ${className}`}>
      {/* Couple name */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-px bg-gold/30" />
        <Heart className="w-3 h-3 text-gold/50 fill-gold/20" />
        <div className="w-6 h-px bg-gold/30" />
      </div>
      <p className="font-dayland text-2xl text-gold mb-4">{coupleName}</p>

      {/* QR Code */}
      <div className="bg-white p-3 rounded-xl border border-gold/10 shadow-sm mb-4">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR Code untuk ${guestName}`} className="w-[200px] h-[200px]" />
        ) : qrError ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center text-center px-4">
            <p className="text-[10px] text-red-400">QR tidak dapat dibuat. Nama terlalu panjang.</p>
          </div>
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Guest name */}
      <p className="font-serif italic text-lg text-ink mb-1 line-clamp-2 max-w-[260px]">{guestName}</p>

      {/* Separator */}
      <div className="flex items-center gap-2 my-2">
        <div className="w-8 h-px bg-gold/20" />
        <Heart className="w-2.5 h-2.5 text-gold/30 fill-gold/10" />
        <div className="w-8 h-px bg-gold/20" />
      </div>

      {/* Helper text */}
      <p className="text-[9px] text-ink/40 uppercase tracking-widest font-sans">
        Scan untuk membuka
      </p>
      <p className="text-[9px] text-ink/40 uppercase tracking-widest font-sans">
        undangan pernikahan
      </p>
    </div>
  );
}
