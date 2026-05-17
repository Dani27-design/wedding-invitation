'use client';
import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';
import { Plus, Trash2, Upload, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Galeri Foto</label>
        <span className="text-[10px] text-ink/40 font-mono">{images.length}/{MAX_IMAGES}</span>
      </div>

      {images.length > 1 && (
        <p className="text-[9px] text-ink/30 text-center -mb-3">Ketuk panah di foto untuk mengubah urutan</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <div key={i} className="space-y-1.5">
            <div className="relative aspect-square rounded-2xl overflow-hidden group border border-gold/10">
              <img src={img.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(i);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                aria-label="Hapus foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {/* Reorder buttons */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => moveImage(i, i - 1)} className="w-7 h-7 bg-ink/60 text-white rounded-full flex items-center justify-center hover:bg-ink/80 transition-all shadow" aria-label="Pindah ke atas">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                )}
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(i, i + 1)} className="w-7 h-7 bg-ink/60 text-white rounded-full flex items-center justify-center hover:bg-ink/80 transition-all shadow" aria-label="Pindah ke bawah">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {img.file && (
                <div className="absolute bottom-0 left-0 right-0 bg-gold/80 backdrop-blur-sm py-1 px-2">
                  <p className="text-[8px] text-ivory font-black uppercase tracking-tighter truncate">Baru</p>
                </div>
              )}
            </div>
            {img.file && (
              <p className="text-[9px] text-ink/40 truncate font-mono px-1">{img.file.name}</p>
            )}
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <label className="aspect-square border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gold/5 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-gold" />
            </div>
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Tambah</span>
            <input type="file" accept="image/*" multiple onChange={(e) => handleAdd(e.target.files)} className="hidden" />
          </label>
        )}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gold/10 rounded-3xl">
          <Upload className="w-8 h-8 text-gold/20 mx-auto mb-3" />
          <p className="text-xs text-ink/40 tracking-wider">Belum ada foto galeri</p>
        </div>
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
