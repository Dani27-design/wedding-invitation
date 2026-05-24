'use client';
import { useState } from 'react';
import { WeddingDocument, BankAccount } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface GiftFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

export function GiftForm({ data, onSave, isSaving, onDirty, step, totalSteps }: GiftFormProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>(
    data?.giftAccounts ?? [{ bank: '', account: '', owner: '' }]
  );

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const addAccount = () => { setAccounts([...accounts, { bank: '', account: '', owner: '' }]); onDirty?.(); };
  const removeAccount = (i: number) => { setAccounts(accounts.filter((_, idx) => idx !== i)); onDirty?.(); };
  const updateAccount = (i: number, field: keyof BankAccount, value: string) => {
    setAccounts(accounts.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
    onDirty?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ giftAccounts: accounts.filter(a => a.bank.trim() && a.account.trim()) });
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03] flex items-center justify-between">
          <h3 className="font-base text-[13px] text-ink">Data Rekening</h3>
          <span className="text-[10px] text-ink/80 font-mono">{accounts.length} rekening</span>
        </div>
        <div className="p-4 space-y-3">
          {accounts.map((acc, i) => (
            <div key={i} className="p-3 border border-gold/10 rounded-xl bg-ivory/30 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Bank / E-Wallet</label>
                  <input value={acc.bank} onChange={(e) => updateAccount(i, 'bank', e.target.value)} placeholder="Contoh: BCA" maxLength={30} aria-label={`Nama Bank Rekening ${i + 1}`} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-ink/80 font-medium block mb-1.5">No. Rekening</label>
                  <input value={acc.account} onChange={(e) => updateAccount(i, 'account', e.target.value)} placeholder="1234567890" maxLength={30} aria-label={`Nomor Rekening ${i + 1}`} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Atas Nama</label>
                  <input value={acc.owner} onChange={(e) => updateAccount(i, 'owner', e.target.value)} placeholder="Nama pemilik rekening" maxLength={50} aria-label={`Atas Nama Rekening ${i + 1}`} className={inputClass} />
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(i)}
                  className="mb-0.5 w-8 h-8 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  aria-label={`Hapus rekening ${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addAccount}
            className="w-full py-2.5 border-2 border-dashed border-gold/25 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[11px] font-bold">Tambah Rekening</span>
          </button>
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
        message="Apakah Anda yakin ingin menghapus rekening ini?"
        onConfirm={() => { if (deleteTarget !== null) removeAccount(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
