'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';

const WA_NUMBER = '6288883816403';

export function ConsultationForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const text = `Halo, saya ${name.trim() || 'calon pengantin'}.\n\n${message.trim() || 'Saya ingin bertanya tentang undangan digital Marinikah Invitation.'}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3 max-w-sm mx-auto">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Anda"
        maxLength={50}
        aria-label="Nama"
        className="w-full px-4 py-3 bg-ivory/10 border border-ivory/10 rounded-xl text-sm text-ivory placeholder:text-ivory/25 focus:outline-none focus:border-gold/40 transition-colors"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tulis pertanyaan atau pesan Anda..."
        rows={3}
        maxLength={500}
        aria-label="Pesan konsultasi"
        className="w-full px-4 py-3 bg-ivory/10 border border-ivory/10 rounded-xl text-sm text-ivory placeholder:text-ivory/25 focus:outline-none focus:border-gold/40 transition-colors resize-none"
      />
      <button
        onClick={handleSend}
        className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
      >
        <Send className="w-3.5 h-3.5" />
        Kirim via WhatsApp
      </button>
    </div>
  );
}
