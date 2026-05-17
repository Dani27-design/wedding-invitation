'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { getGuests } from '@/lib/guests';
import { Guest, WeddingDocument } from '@/types/firestore';

interface GuestTabProps {
  data: WeddingDocument | null;
  slug: string;
  onSave: (fields: Partial<WeddingDocument>) => void;
  isSaving?: boolean;
  onDirty?: () => void;
}

export function GuestTab({ data, slug, onSave, isSaving, onDirty }: GuestTabProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greetingTemplate, setGreetingTemplate] = useState(
    data?.greetingTemplate ?? 'Assalamualaikum Wr. Wb.\n\nKepada Yth.\n{nama}\n\nDengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\n{pengantin}\n\nBuka undangan:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\n\nWassalamualaikum Wr. Wb.',
  );

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    getGuests(slug)
      .then(setGuests)
      .catch((err) => console.error('[GuestTab] Load error:', err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const totalGuests = guests.length;
  const totalHadir = guests.filter((g) => g.attendance).length;
  const totalPria = guests.filter((g) => g.category === 'pria').length;
  const totalWanita = guests.filter((g) => g.category === 'wanita').length;

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ greetingTemplate: greetingTemplate.trim() });
  };

  const insertVariable = (variable: string) => {
    setGreetingTemplate((prev) => prev + variable);
    onDirty?.();
  };

  // Preview with sample data
  const previewText = greetingTemplate
    .replace(/\{nama\}/g, 'Budi Santoso')
    .replace(/\{pengantin\}/g, `${data?.groomNickname ?? 'Pria'} & ${data?.brideNickname ?? 'Wanita'}`)
    .replace(/\{link\}/g, `https://.../${slug}?to=${encodeURIComponent('Budi Santoso')}`);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
          <p className="text-2xl font-serif text-ink">{isLoading ? '—' : totalGuests}</p>
          <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Total Tamu</p>
        </div>
        <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
          <p className="text-2xl font-serif text-green-600">{isLoading ? '—' : totalHadir}</p>
          <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Hadir</p>
        </div>
        <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
          <p className="text-2xl font-serif text-ink">{isLoading ? '—' : totalPria}</p>
          <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Pihak Pria</p>
        </div>
        <div className="p-3 bg-white/60 border border-gold/10 rounded-2xl text-center">
          <p className="text-2xl font-serif text-ink">{isLoading ? '—' : totalWanita}</p>
          <p className="text-[9px] uppercase tracking-widest text-ink/40 font-bold">Pihak Wanita</p>
        </div>
      </div>

      {/* Link to full page */}
      <Link
        href={`/admin/${slug}/guests`}
        className="flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-2xl hover:bg-gold/10 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ink">Kelola Semua Tamu</p>
            <p className="text-[10px] text-ink/40">Tambah, edit, import, QR code, dan kirim undangan</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Greeting Template */}
      <form onSubmit={handleSaveTemplate} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Template Pesan Undangan</label>
        </div>
        <p className="text-[10px] text-ink/40">Pesan ini akan digunakan saat mengirim undangan via WhatsApp. Gunakan variabel di bawah:</p>
        <div className="flex flex-wrap gap-1.5">
          {['{nama}', '{pengantin}', '{link}'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="px-2.5 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded-full hover:bg-gold/20 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        <textarea
          value={greetingTemplate}
          onChange={(e) => { setGreetingTemplate(e.target.value); onDirty?.(); }}
          rows={10}
          maxLength={1000}
          aria-label="Template pesan undangan"
          className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 resize-none font-mono text-xs leading-relaxed"
        />
        {greetingTemplate.length > 700 && (
          <p className={`text-[9px] text-right ${greetingTemplate.length >= 1000 ? 'text-red-500' : 'text-gold'}`}>{greetingTemplate.length}/1000</p>
        )}

        {/* Preview */}
        <details className="border border-gold/10 rounded-xl overflow-hidden">
          <summary className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-gold font-black cursor-pointer hover:bg-gold/5 transition-colors">
            Preview Pesan
          </summary>
          <div className="px-4 py-3 bg-paper/50 border-t border-gold/5">
            <p className="text-xs text-ink/70 whitespace-pre-line leading-relaxed">{previewText}</p>
          </div>
        </details>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Template'}
        </button>
      </form>
    </div>
  );
}
