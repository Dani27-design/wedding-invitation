'use client';
import { useState } from 'react';
import { WeddingDocument } from '@/types/firestore';

interface GuestTabProps {
  data: WeddingDocument | null;
  slug: string;
  onSave: (fields: Partial<WeddingDocument>) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

export function GuestTab({ data, slug, onSave, isSaving, onDirty, step, totalSteps }: GuestTabProps) {
  const [defaultGuest, setDefaultGuest] = useState(data?.defaultGuest ?? '');

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
    <form onSubmit={handleSaveTemplate} className="space-y-4">
      {/* Default guest name card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Nama Tamu Default</h3>
        </div>
        <div className="p-4">
          <label htmlFor="default-guest" className="text-[11px] text-ink/80 font-medium block mb-1.5">
            Nama yang ditampilkan jika tautan tidak menyertakan nama tamu
          </label>
          <input
            id="default-guest"
            value={defaultGuest}
            onChange={(e) => { setDefaultGuest(e.target.value); onDirty?.(); }}
            placeholder="Contoh: Tamu Undangan"
            maxLength={50}
            className="w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Greeting Template card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Template Pesan Undangan</h3>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-ink/80">Pesan ini akan digunakan saat mengirim undangan via WhatsApp. Gunakan variabel di bawah:</p>
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
            className="w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors resize-none font-mono text-xs leading-relaxed"
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
              <p className="text-xs text-ink/80 whitespace-pre-line leading-relaxed">{previewText}</p>
            </div>
          </details>
        </div>
      </div>

      {/* Progress bar */}
      {step != null && totalSteps != null && totalSteps > 0 && (() => {
        const pct = Math.round(((step + 1) / totalSteps) * 100);
        const barColor = pct <= 25 ? 'bg-red-400' : pct <= 50 ? 'bg-orange-400' : pct <= 75 ? 'bg-yellow-400' : 'bg-green-500';
        return (
          <div className="space-y-1">
            <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-ink/80 text-right">{step + 1} dari {totalSteps}</p>
          </div>
        );
      })()}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20"
      >
        {isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
      </button>
    </form>
  );
}
