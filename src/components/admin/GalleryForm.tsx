import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';

interface GalleryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>) => void;
  isSaving?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 20;

export function GalleryForm({ data, onSave, isSaving }: GalleryFormProps) {
  const [error, setError] = useState('');
  const [images, setImages] = useState<{ url: string; file?: File }[]>(
    data?.gallery?.map(url => ({ url })) ?? []
  );

  const handleAdd = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const oversized = arr.find(f => f.size > MAX_IMAGE_SIZE);
    if (oversized) { setError('Ukuran foto maksimal 5MB per file'); return; }
    if (images.length + arr.length > MAX_IMAGES) { setError(`Maksimal ${MAX_IMAGES} foto`); return; }
    setError('');
    const newImages = arr.map(file => ({ url: URL.createObjectURL(file), file }));
    setImages([...images, ...newImages]);
  };

  const handleRemove = (i: number) => setImages(images.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    images.forEach((img, i) => { if (img.file) files[`gallery-${i}`] = img.file; });
    onSave(
      { gallery: images.map(img => img.url) },
      Object.keys(files).length > 0 ? files : undefined,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Foto Galeri</label>
        <label className="text-gold cursor-pointer" aria-label="Tambah foto">
          <Plus className="w-4 h-4" />
          <input type="file" accept="image/*" multiple onChange={(e) => handleAdd(e.target.files)} className="hidden" />
        </label>
      </div>

      {images.length === 0 && (
        <p className="text-xs text-ink/60 text-center py-8">Belum ada foto. Tap + untuk menambahkan.</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={img.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Hapus foto"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
