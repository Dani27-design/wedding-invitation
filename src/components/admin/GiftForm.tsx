import { useState } from 'react';
import { WeddingDocument, BankAccount } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';

interface GiftFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

export function GiftForm({ data, onSave, isSaving }: GiftFormProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>(
    data?.giftAccounts ?? [{ bank: '', account: '', owner: '' }]
  );

  const addAccount = () => setAccounts([...accounts, { bank: '', account: '', owner: '' }]);
  const removeAccount = (i: number) => setAccounts(accounts.filter((_, idx) => idx !== i));
  const updateAccount = (i: number, field: keyof BankAccount, value: string) => {
    setAccounts(accounts.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ giftAccounts: accounts.filter(a => a.bank.trim() && a.account.trim()) });
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Rekening / E-Wallet</label>
        <button type="button" onClick={addAccount} className="text-gold" aria-label="Tambah rekening"><Plus className="w-4 h-4" /></button>
      </div>

      {accounts.map((acc, i) => (
        <div key={i} className="p-4 border border-gold/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/60 font-bold">Rekening {i + 1}</span>
            {accounts.length > 1 && (
              <button type="button" onClick={() => removeAccount(i)} className="text-red-400" aria-label="Hapus rekening"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
          <input value={acc.bank} onChange={(e) => updateAccount(i, 'bank', e.target.value)} placeholder="Nama Bank / E-Wallet" maxLength={30} aria-label={`Nama Bank Rekening ${i + 1}`} className={inputClass} />
          <input value={acc.account} onChange={(e) => updateAccount(i, 'account', e.target.value)} placeholder="Nomor Rekening" maxLength={30} aria-label={`Nomor Rekening ${i + 1}`} className={inputClass} />
          <input value={acc.owner} onChange={(e) => updateAccount(i, 'owner', e.target.value)} placeholder="Atas Nama" maxLength={50} aria-label={`Atas Nama Rekening ${i + 1}`} className={inputClass} />
        </div>
      ))}

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
