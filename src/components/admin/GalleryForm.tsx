'use client';
import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';
import { Plus, Trash2, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import { compressImage, formatFileSize } from '../../utils/compressImage';
import { CompressionModal } from './CompressionModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface GalleryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_IMAGES = 30;

export function GalleryForm({ data, onSave, isSaving, onDirty }: GalleryFormProps) {
  const [error, setError] = useState('');
  const [images, setImages] = useState<{ url: string; file?: File }[]>(
    data?.gallery?.map(url => ({ url })) ?? []
  );
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState('');
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleAdd = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const oversized = arr.find(f => f.size > MAX_IMAGE_SIZE);
    if (oversized) { setError('Ukuran foto maksimal 25MB per file'); return; }
    if (images.length + arr.length > MAX_IMAGES) { setError(`Maksimal ${MAX_IMAGES} foto`); return; }
    setError('');
    const newImages = arr.map(file => ({ url: URL.createObjectURL(file), file }));
    setImages([...images, ...newImages]);
    onDirty?.();
  };

  const handleRemove = (i: number) => {
    const img = images[i];
    if (img.url.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, img.url]);
    }
    setImages(images.filter((_, idx) => idx !== i));
    onDirty?.();
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setImages(updated);
    onDirty?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    const imageEntries = images.map((img, i) => img.file ? { idx: i, file: img.file } : null).filter(Boolean) as { idx: number; file: File }[];
    if (imageEntries.length > 0) {
      setIsCompressing(true);
      setCompressionInfo('');
      try {
        const infos: string[] = [];
        for (let i = 0; i < imageEntries.length; i++) {
          const { idx, file } = imageEntries[i];
          setCompressProgress({ current: i + 1, total: imageEntries.length, fileName: file.name });
          const result = await compressImage(file);
          files[`gallery-${idx}`] = result.file;
          if (result.wasCompressed) infos.push(`Foto ${idx + 1}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`);
        }
        if (infos.length > 0) setCompressionInfo(infos.join(' | '));
      } finally {
        setIsCompressing(false);
      }
    }
    onSave(
      { gallery: images.map(img => img.url) },
      Object.keys(files).length > 0 ? files : undefined,
      urlsToDelete.length > 0 ? urlsToDelete : undefined,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Galeri Foto</h2>
        <span className="text-[10px] text-ink/30 font-mono">{images.length}/{MAX_IMAGES}</span>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gold/10 group">
              <img src={img.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />

              {/* Actions — always visible */}
              <div className="absolute top-1 right-1">
                <button type="button" onClick={() => setDeleteTarget(i)} className="w-5 h-5 bg-red-500/80 text-white rounded-full flex items-center justify-center" aria-label="Hapus foto">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
              {images.length > 1 && (
                <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                  {i > 0 && (
                    <button type="button" onClick={() => moveImage(i, i - 1)} className="w-5 h-5 bg-ink/50 text-white rounded-full flex items-center justify-center" aria-label="Pindah ke atas">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => moveImage(i, i + 1)} className="w-5 h-5 bg-ink/50 text-white rounded-full flex items-center justify-center" aria-label="Pindah ke bawah">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* New badge */}
              {img.file && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-gold/80 text-ivory text-[7px] font-black uppercase rounded-md">Baru</span>
              )}
            </div>
          ))}

          {/* Add button as grid item */}
          {images.length < MAX_IMAGES && (
            <label className="aspect-square border-2 border-dashed border-gold/20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gold/5 transition-colors">
              <Plus className="w-5 h-5 text-gold/40" />
              <input type="file" accept="image/*" multiple onChange={(e) => handleAdd(e.target.files)} className="hidden" />
            </label>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gold/15 rounded-2xl cursor-pointer hover:bg-gold/5 transition-colors">
          <Upload className="w-6 h-6 text-gold/20" />
          <span className="text-[10px] text-ink/30 tracking-wider">Ketuk untuk menambah foto</span>
          <input type="file" accept="image/*" multiple onChange={(e) => handleAdd(e.target.files)} className="hidden" />
        </label>
      )}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {compressionInfo && <p className="text-[10px] text-green-600 text-center">{compressionInfo}</p>}
      <button type="submit" disabled={isSaving || isCompressing} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
      <CompressionModal isOpen={isCompressing} current={compressProgress.current} total={compressProgress.total} currentFileName={compressProgress.fileName} />
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus foto ini?"
        onConfirm={() => { if (deleteTarget !== null) handleRemove(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
