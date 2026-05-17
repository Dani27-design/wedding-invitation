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
}

export function GiftForm({ data, onSave, isSaving, onDirty }: GiftFormProps) {
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

  const inputClass = 'w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Data Rekening</h2>
        <span className="text-[10px] text-ink/30 font-mono">{accounts.length} rekening</span>
      </div>

      {accounts.map((acc, i) => (
        <div key={i} className="p-3 border border-gold/10 rounded-2xl bg-white/40 space-y-2">
          <div className="flex gap-2">
            <input value={acc.bank} onChange={(e) => updateAccount(i, 'bank', e.target.value)} placeholder="Bank / E-Wallet" maxLength={30} aria-label={`Nama Bank Rekening ${i + 1}`} className={`${inputClass} flex-1`} />
            <input value={acc.account} onChange={(e) => updateAccount(i, 'account', e.target.value)} placeholder="No. Rekening" maxLength={30} aria-label={`Nomor Rekening ${i + 1}`} className={`${inputClass} flex-1`} />
          </div>
          <div className="flex gap-2 items-center">
            <input value={acc.owner} onChange={(e) => updateAccount(i, 'owner', e.target.value)} placeholder="Atas Nama" maxLength={50} aria-label={`Atas Nama Rekening ${i + 1}`} className={`${inputClass} flex-1`} />
            <button
              type="button"
              onClick={() => setDeleteTarget(i)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
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
        className="w-full py-2.5 border-2 border-dashed border-gold/25 rounded-2xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold"
      >
        <Plus className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Tambah Rekening</span>
      </button>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus rekening ini?"
        onConfirm={() => { if (deleteTarget !== null) removeAccount(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
