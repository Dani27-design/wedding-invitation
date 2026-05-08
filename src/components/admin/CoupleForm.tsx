import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';
import { Upload } from 'lucide-react';

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

  const renderUploadField = (side: 'groom' | 'bride', preview: string, file: File | null) => (
    <div className="space-y-2">
      <label className="text-xs text-ink/60 block">Foto</label>
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <img src={preview} alt={side} className="w-full h-full object-cover rounded-xl border border-gold/10" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:bg-gold/5 transition-colors group">
            <Upload className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Pilih Foto</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handlePhotoChange(side, e.target.files?.[0])} 
              className="hidden" 
            />
          </label>
          {file && (
            <p className="mt-1.5 text-[10px] text-ink/40 truncate font-mono text-center">{file.name}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Pengantin Pria</legend>
        <input value={groomNickname} onChange={(e) => setGroomNickname(e.target.value)} placeholder="Nama Panggilan" required maxLength={30} aria-label="Nama Panggilan Pria" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={groomName} onChange={(e) => setGroomName(e.target.value)} placeholder="Nama Lengkap + Gelar" required maxLength={100} aria-label="Nama Lengkap Pria" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={groomParents} onChange={(e) => setGroomParents(e.target.value)} placeholder="Putra/Putri dari..." required maxLength={150} aria-label="Orang Tua Pria" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        {renderUploadField('groom', groomPhotoPreview, groomPhotoFile)}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Pengantin Wanita</legend>
        <input value={brideNickname} onChange={(e) => setBrideNickname(e.target.value)} placeholder="Nama Panggilan" required maxLength={30} aria-label="Nama Panggilan Wanita" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={brideName} onChange={(e) => setBrideName(e.target.value)} placeholder="Nama Lengkap + Gelar" required maxLength={100} aria-label="Nama Lengkap Wanita" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        <input value={brideParents} onChange={(e) => setBrideParents(e.target.value)} placeholder="Putra/Putri dari..." required maxLength={150} aria-label="Orang Tua Wanita" className="w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50" />
        {renderUploadField('bride', bridePhotoPreview, bridePhotoFile)}
      </fieldset>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
