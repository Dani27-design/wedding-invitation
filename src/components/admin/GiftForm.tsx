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

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-6">Data Rekening</h2>
      {accounts.map((acc, i) => (
        <div key={i} className="p-4 border border-gold/10 rounded-2xl space-y-3 bg-white/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-ink/60 font-black">Rekening {i + 1}</span>
            <button 
              type="button" 
              onClick={() => setDeleteTarget(i)} 
              className="text-red-400 p-1 hover:scale-110 transition-transform" 
              aria-label="Hapus rekening"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input value={acc.bank} onChange={(e) => updateAccount(i, 'bank', e.target.value)} placeholder="Nama Bank / E-Wallet" maxLength={30} aria-label={`Nama Bank Rekening ${i + 1}`} className={inputClass} />
          <input value={acc.account} onChange={(e) => updateAccount(i, 'account', e.target.value)} placeholder="Nomor Rekening" maxLength={30} aria-label={`Nomor Rekening ${i + 1}`} className={inputClass} />
          <input value={acc.owner} onChange={(e) => updateAccount(i, 'owner', e.target.value)} placeholder="Atas Nama" maxLength={50} aria-label={`Atas Nama Rekening ${i + 1}`} className={inputClass} />
        </div>
      ))}

      <button
        type="button"
        onClick={addAccount}
        className="w-full py-4 border-2 border-dashed border-gold/30 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-gold/5 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-gold" />
        </div>
        <span className="text-[10px] font-black text-gold uppercase tracking-widest">Tambah Rekening</span>
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
