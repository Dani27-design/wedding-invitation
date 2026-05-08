import { useState } from 'react';
import { WeddingDocument, CreditPerson } from '../../types/firestore';
import { Plus, Trash2, User } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Desainer' },
  { value: 'other', label: 'Lainnya' },
];

interface CreditFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

export function CreditForm({ data, onSave, isSaving }: CreditFormProps) {
  const [credits, setCredits] = useState<CreditPerson[]>(
    data?.credits ?? [{ name: '', role: 'developer', description: '' }]
  );

  const addCredit = () => setCredits([...credits, { name: '', role: 'other', description: '' }]);
  const removeCredit = (i: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kredit ini?')) {
      setCredits(credits.filter((_, idx) => idx !== i));
    }
  };
  const updateCredit = (i: number, field: keyof CreditPerson, value: string) => {
    setCredits(credits.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      credits: credits.filter(c => c.name.trim()),
    });
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-6">Data Penulis</h2>

      <fieldset className="space-y-4">
        {credits.map((credit, i) => (
          <div key={i} className="p-4 border border-gold/10 rounded-2xl space-y-3 bg-white/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-gold font-black">Kredit {i + 1}</span>
              <button 
                type="button" 
                onClick={() => removeCredit(i)} 
                className="text-red-400 p-1 hover:scale-110 transition-transform" 
                aria-label="Hapus kredit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input value={credit.name} onChange={(e) => updateCredit(i, 'name', e.target.value)} placeholder="Nama" maxLength={50} aria-label={`Nama Kredit ${i + 1}`} className={inputClass} />
            <select value={credit.role} onChange={(e) => updateCredit(i, 'role', e.target.value)} aria-label={`Peran Kredit ${i + 1}`} className={inputClass}>
              {ROLE_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <textarea value={credit.description} onChange={(e) => updateCredit(i, 'description', e.target.value)} placeholder="Deskripsi" rows={4} maxLength={200} aria-label={`Deskripsi Kredit ${i + 1}`} className={`${inputClass} resize-none`} />
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={addCredit}
        className="w-full py-4 border-2 border-dashed border-gold/30 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-gold/5 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-gold" />
        </div>
        <span className="text-[10px] font-black text-gold uppercase tracking-widest">Tambah Kredit</span>
      </button>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
