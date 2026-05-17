'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getGuests } from '@/lib/guests';
import { WeddingDocument } from '@/types/firestore';

interface GuestTabProps {
  data: WeddingDocument | null;
  slug: string;
  onSave: (fields: Partial<WeddingDocument>) => void;
  isSaving?: boolean;
  onDirty?: () => void;
}

export function GuestTab({ data, slug, onSave, isSaving, onDirty }: GuestTabProps) {
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [defaultGuest, setDefaultGuest] = useState(data?.defaultGuest ?? '');

  useEffect(() => {
    if (!slug) return;
    getGuests(slug).then((g) => setGuestCount(g.length)).catch(() => {});
  }, [slug]);

  const [greetingTemplate, setGreetingTemplate] = useState(
    data?.greetingTemplate ?? 'Assalamualaikum Wr. Wb.\n\nKepada Yth.\n{nama}\n\nDengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\n{pengantin}\n\nBuka undangan:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\n\nWassalamualaikum Wr. Wb.',
  );

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ greetingTemplate: greetingTemplate.trim(), defaultGuest: defaultGuest.trim() });
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
      <Link
        href={`/admin/${slug}/guests`}
        className="w-full flex items-center justify-center gap-2 py-3 border border-gold/20 rounded-full text-xs tracking-[0.3em] font-black uppercase text-gold hover:bg-gold/5 transition-colors"
      >
        Kelola Tamu{guestCount !== null && ` (${guestCount})`}
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>

      {/* Default guest name */}
      <div className="space-y-1">
        <label className="text-[10px] text-ink/50 font-bold uppercase tracking-wider">Nama Tamu Default</label>
        <input
          value={defaultGuest}
          onChange={(e) => { setDefaultGuest(e.target.value); onDirty?.(); }}
          placeholder="Nama jika tautan tidak menyertakan nama (cth: Tamu Undangan)"
          maxLength={50}
          aria-label="Nama Tamu Default"
          className="w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50"
        />
      </div>

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
