'use client';
import { useState } from 'react';
import { WeddingDocument, CreditPerson } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CREDIT_ICONS, DEVELOPER_ALLOWED_NAME } from '../../constants/creditIcons';
import { deriveCopyright } from '../../utils/weddingDerived';

const MAX_CREDITS = 2;

interface CreditFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

export function CreditForm({ data, onSave, isSaving, onDirty, step, totalSteps }: CreditFormProps) {
  const [credits, setCredits] = useState<CreditPerson[]>(
    data?.credits ?? [{ name: '', role: 'heart', description: '' }]
  );
  const [footerText, setFooterText] = useState(
    data?.footerText || deriveCopyright(data?.eventDate ?? '')
  );

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const addCredit = () => { if (credits.length < MAX_CREDITS) { setCredits([...credits, { name: '', role: 'heart', description: '' }]); onDirty?.(); } };
  const removeCredit = (i: number) => { setCredits(credits.filter((_, idx) => idx !== i)); onDirty?.(); };
  const updateCredit = (i: number, field: keyof CreditPerson, value: string) => {
    setCredits(credits.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
    onDirty?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ credits: credits.filter(c => c.name.trim()), footerText: footerText.trim() });
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03] flex items-center justify-between">
          <h3 className="font-base text-[13px] text-ink">Data Penulis</h3>
          <span className="text-[10px] text-ink/80 font-mono">{credits.length}/{MAX_CREDITS}</span>
        </div>
        <div className="p-4 space-y-3">
          {credits.map((credit, i) => {
            const isDeveloperAllowed = credit.name.trim() === DEVELOPER_ALLOWED_NAME;
            const availableIcons = CREDIT_ICONS.filter(opt => !opt.restricted || isDeveloperAllowed);

            return (
              <div key={i} className="p-3 border border-gold/10 rounded-xl bg-ivory/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-ink/80 font-black">{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`Hapus kredit ${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Nama</label>
                  <input value={credit.name} onChange={(e) => updateCredit(i, 'name', e.target.value)} placeholder="Nama penulis" maxLength={50} aria-label={`Nama Kredit ${i + 1}`} className={inputClass} />
                </div>

                <div>
                  <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Pilih Ikon</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {availableIcons.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateCredit(i, 'role', value)}
                        title={label}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all ${
                          credit.role === value
                            ? 'bg-gold/15 text-gold ring-1 ring-gold/30'
                            : 'text-ink/80 hover:bg-ink/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[7px] leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Deskripsi</label>
                  <textarea value={credit.description} onChange={(e) => updateCredit(i, 'description', e.target.value)} placeholder="Deskripsi singkat" rows={4} maxLength={200} aria-label={`Deskripsi Kredit ${i + 1}`} className={`${inputClass} resize-none`} />
                  {credit.description.length > 140 && (
                    <p className={`text-[9px] text-right mt-0.5 ${credit.description.length >= 200 ? 'text-red-500' : 'text-gold'}`}>{credit.description.length}/200</p>
                  )}
                </div>
              </div>
            );
          })}

          {credits.length < MAX_CREDITS && (
            <button
              type="button"
              onClick={addCredit}
              className="w-full py-2.5 border-2 border-dashed border-gold/25 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[11px] font-bold">Tambah Kredit</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer text card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Teks Penutup</h3>
        </div>
        <div className="p-4">
          <label htmlFor="footer-text" className="text-[11px] text-ink/80 font-medium block mb-1.5">
            Teks yang ditampilkan di bagian bawah undangan
          </label>
          <textarea
            id="footer-text"
            value={footerText}
            onChange={(e) => { setFooterText(e.target.value); onDirty?.(); }}
            placeholder="Contoh: © 2026. Kami membangunnya bersama, dari perjalanan kami."
            rows={2}
            maxLength={200}
            className={`${inputClass} resize-none`}
          />
          {footerText.length > 150 && (
            <p className={`text-[9px] text-right mt-0.5 ${footerText.length >= 200 ? 'text-red-500' : 'text-gold'}`}>{footerText.length}/200</p>
          )}
        </div>
      </div>

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

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button>
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus kredit ini?"
        onConfirm={() => { if (deleteTarget !== null) removeCredit(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
