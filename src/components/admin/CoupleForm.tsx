import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';

interface CoupleFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>) => void;
  isSaving?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function CoupleForm({ data, onSave, isSaving }: CoupleFormProps) {
  const [error, setError] = useState('');
  const [groomNickname, setGroomNickname] = useState(data?.groomNickname ?? '');
  const [groomName, setGroomName] = useState(data?.groomName ?? '');
  const [groomParents, setGroomParents] = useState(data?.groomParents ?? '');
  const [brideNickname, setBrideNickname] = useState(data?.brideNickname ?? '');
  const [brideName, setBrideName] = useState(data?.brideName ?? '');
  const [brideParents, setBrideParents] = useState(data?.brideParents ?? '');
  const [groomPhotoPreview, setGroomPhotoPreview] = useState(data?.groomPhoto ?? '');
  const [bridePhotoPreview, setBridePhotoPreview] = useState(data?.bridePhoto ?? '');
  const [groomPhotoFile, setGroomPhotoFile] = useState<File | null>(null);
  const [bridePhotoFile, setBridePhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (side: 'groom' | 'bride', file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setError('Ukuran foto maksimal 5MB'); return; }
    setError('');
    const url = URL.createObjectURL(file);
    if (side === 'groom') { setGroomPhotoFile(file); setGroomPhotoPreview(url); }
    else { setBridePhotoFile(file); setBridePhotoPreview(url); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    if (groomPhotoFile) files.groomPhoto = groomPhotoFile;
    if (bridePhotoFile) files.bridePhoto = bridePhotoFile;
    onSave({
      groomNickname: groomNickname.trim(),
      groomName: groomName.trim(),
      groomParents: groomParents.trim(),
      brideNickname: brideNickname.trim(),
      brideName: brideName.trim(),
      brideParents: brideParents.trim(),
    }, Object.keys(files).length > 0 ? files : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Pengantin Pria</legend>
        <input value={groomNickname} onChange={(e) => setGroomNickname(e.target.value)} placeholder="Nama Panggilan" required maxLength={30} aria-label="Nama Panggilan Pria" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={groomName} onChange={(e) => setGroomName(e.target.value)} placeholder="Nama Lengkap + Gelar" required maxLength={100} aria-label="Nama Lengkap Pria" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={groomParents} onChange={(e) => setGroomParents(e.target.value)} placeholder="Putra/Putri dari..." required maxLength={150} aria-label="Orang Tua Pria" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <div>
          <label htmlFor="groom-photo" className="text-xs text-ink/60 mb-1 block">Foto</label>
          {groomPhotoPreview && <img src={groomPhotoPreview} alt="Groom" className="w-20 h-20 object-cover rounded-xl mb-2" />}
          <input id="groom-photo" type="file" accept="image/*" onChange={(e) => handlePhotoChange('groom', e.target.files?.[0])} className="text-xs text-ink/60" />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Pengantin Wanita</legend>
        <input value={brideNickname} onChange={(e) => setBrideNickname(e.target.value)} placeholder="Nama Panggilan" required maxLength={30} aria-label="Nama Panggilan Wanita" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={brideName} onChange={(e) => setBrideName(e.target.value)} placeholder="Nama Lengkap + Gelar" required maxLength={100} aria-label="Nama Lengkap Wanita" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={brideParents} onChange={(e) => setBrideParents(e.target.value)} placeholder="Putra/Putri dari..." required maxLength={150} aria-label="Orang Tua Wanita" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <div>
          <label htmlFor="bride-photo" className="text-xs text-ink/60 mb-1 block">Foto</label>
          {bridePhotoPreview && <img src={bridePhotoPreview} alt="Bride" className="w-20 h-20 object-cover rounded-xl mb-2" />}
          <input id="bride-photo" type="file" accept="image/*" onChange={(e) => handlePhotoChange('bride', e.target.files?.[0])} className="text-xs text-ink/60" />
        </div>
      </fieldset>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
