'use client';
import { useState } from 'react';
import { WeddingDocument, CreditPerson } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CREDIT_ICONS, DEVELOPER_ALLOWED_NAME } from '../../constants/creditIcons';

const MAX_CREDITS = 2;

interface CreditFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
}

export function CreditForm({ data, onSave, isSaving, onDirty }: CreditFormProps) {
  const [credits, setCredits] = useState<CreditPerson[]>(
    data?.credits ?? [{ name: '', role: 'heart', description: '' }]
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
    onSave({ credits: credits.filter(c => c.name.trim()) });
  };

  const inputClass = 'w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Data Penulis</h2>
        <span className="text-[10px] text-ink/30 font-mono">{credits.length}/{MAX_CREDITS}</span>
      </div>

      {credits.map((credit, i) => {
        const isDeveloperAllowed = credit.name.trim() === DEVELOPER_ALLOWED_NAME;
        const availableIcons = CREDIT_ICONS.filter(opt => !opt.restricted || isDeveloperAllowed);

        return (
          <div key={i} className="p-3 border border-gold/10 rounded-2xl bg-white/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-ink/40 font-black">{i + 1}</span>
              <button
                type="button"
                onClick={() => setDeleteTarget(i)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label={`Hapus kredit ${i + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input value={credit.name} onChange={(e) => updateCredit(i, 'name', e.target.value)} placeholder="Nama" maxLength={50} aria-label={`Nama Kredit ${i + 1}`} className={inputClass} />

            {/* Icon picker */}
            <div>
              <p className="text-[9px] text-ink/40 uppercase tracking-wider mb-1.5">Pilih Ikon</p>
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
                        : 'text-ink/30 hover:text-ink/60 hover:bg-ink/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[7px] leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea value={credit.description} onChange={(e) => updateCredit(i, 'description', e.target.value)} placeholder="Deskripsi" rows={4} maxLength={200} aria-label={`Deskripsi Kredit ${i + 1}`} className={`${inputClass} resize-none`} />
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
          className="w-full py-2.5 border-2 border-dashed border-gold/25 rounded-2xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Tambah Kredit</span>
        </button>
      )}

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus kredit ini?"
        onConfirm={() => { if (deleteTarget !== null) removeCredit(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
