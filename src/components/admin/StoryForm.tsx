'use client';
import { useState } from 'react';
import { WeddingDocument, StorySlide } from '../../types/firestore';
import { Plus, Trash2, Upload, Film } from 'lucide-react';
import { compressImage, formatFileSize } from '../../utils/compressImage';
import { CompressionModal } from './CompressionModal';

interface StoryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export function StoryForm({ data, onSave, isSaving }: StoryFormProps) {
  const [error, setError] = useState('');
  const [slides, setSlides] = useState<(StorySlide & { file?: File; videoFile?: File; videoPreview?: string })[]>(
    data?.story?.map(s => ({ ...s })) ?? [{ year: '', text: '', bgImage: '' }]
  );
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState('');
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0, fileName: '' });

  const addSlide = () => setSlides([...slides, { year: '', text: '', bgImage: '' }]);
  const removeSlide = (i: number) => {
    const slide = slides[i];
    if (slide.bgImage && slide.bgImage.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgImage!]);
    }
    if (slide.bgVideo && slide.bgVideo.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgVideo!]);
    }
    setSlides(slides.filter((_, idx) => idx !== i));
  };
  const updateSlide = (i: number, field: keyof StorySlide, value: string) => {
    setSlides(slides.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleImageChange = (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setError('Ukuran foto maksimal 25MB'); return; }
    setError('');
    const url = URL.createObjectURL(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgImage: url, file } : s));
  };

  const handleVideoChange = (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_VIDEO_SIZE) { setError(`Ukuran video maksimal 50MB. File ini ${formatFileSize(file.size)}.`); return; }
    setError('');
    const url = URL.createObjectURL(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, videoPreview: url, videoFile: file } : s));
  };

  const removeVideo = (i: number) => {
    const slide = slides[i];
    if (slide.bgVideo && slide.bgVideo.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgVideo!]);
    }
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgVideo: undefined, videoFile: undefined, videoPreview: undefined } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    const filtered = slides.filter(s => s.year.trim());
    const imageSlides = filtered.filter(s => s.file).map((s, _, arr) => ({ slide: s, total: arr.length }));
    if (imageSlides.length > 0) {
      setIsCompressing(true);
      setCompressionInfo('');
      try {
        const infos: string[] = [];
        let idx = 0;
        for (let i = 0; i < filtered.length; i++) {
          const s = filtered[i];
          if (s.file) {
            idx++;
            setCompressProgress({ current: idx, total: imageSlides.length, fileName: s.file.name });
            const result = await compressImage(s.file);
            files[`storyBg-${i}`] = result.file;
            if (result.wasCompressed) infos.push(`Slide ${i + 1}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`);
          }
        }
        if (infos.length > 0) setCompressionInfo(infos.join(' | '));
      } finally {
        setIsCompressing(false);
      }
    }
    // Add video files (no compression — videos are uploaded as-is)
    for (let i = 0; i < filtered.length; i++) {
      const s = filtered[i];
      if (s.videoFile) {
        files[`storyVideo-${i}`] = s.videoFile;
      }
    }
    onSave(
      { story: filtered.map(({ file: _, videoFile: _v, videoPreview: _p, ...s }) => s) },
      Object.keys(files).length > 0 ? files : undefined,
      urlsToDelete.length > 0 ? urlsToDelete : undefined,
    );
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-6">Kisah Cinta</h2>
      {slides.map((slide, i) => (
        <div key={i} className="p-5 border border-gold/10 rounded-3xl space-y-4 bg-white/50 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] uppercase tracking-widest text-gold font-black">Tahap {i + 1}</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus slide ini?')) {
                  removeSlide(i);
                }
              }}
              className="text-red-400 p-1 hover:scale-110 transition-transform"
              aria-label="Hapus slide"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 relative z-10">
            <input value={slide.year} onChange={(e) => updateSlide(i, 'year', e.target.value)} placeholder="Tahun (misal: 2016 — 2017)" maxLength={30} aria-label={`Tahun Slide ${i + 1}`} className={inputClass} />
            <textarea value={slide.text} onChange={(e) => updateSlide(i, 'text', e.target.value)} placeholder="Cerita..." rows={5} maxLength={500} aria-label={`Cerita Slide ${i + 1}`} className={`${inputClass} resize-none`} />

            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink/60 font-bold block ml-1">Foto Latar</label>
              <div className="flex items-center gap-4">
                {slide.bgImage && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/20 flex-shrink-0">
                    <img src={slide.bgImage} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:bg-gold/5 transition-all group/upload">
                    <Upload className="w-3.5 h-3.5 text-gold group-hover/upload:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">Pilih Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(i, e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                  {slide.file && (
                    <p className="mt-1 text-[9px] text-ink/40 truncate font-mono text-center">{slide.file.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Video upload */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink/60 font-bold block ml-1">Video Latar (Opsional)</label>
              <div className="flex items-center gap-4">
                {(slide.videoPreview || slide.bgVideo) && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/20 flex-shrink-0">
                    <video src={slide.videoPreview || slide.bgVideo} className="w-full h-full object-cover" muted />
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      aria-label="Hapus video"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:bg-gold/5 transition-all group/upload">
                    <Film className="w-3.5 h-3.5 text-gold group-hover/upload:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">Pilih Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoChange(i, e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                  {slide.videoFile && (
                    <p className="mt-1 text-[9px] text-ink/40 truncate font-mono text-center">{slide.videoFile.name}</p>
                  )}
                  <p className="mt-1 text-[9px] text-ink/30 text-center">Jika ada video, video akan ditampilkan sebagai latar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSlide}
        className="w-full py-4 border-2 border-dashed border-gold/30 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-gold/5 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-gold" />
        </div>
        <span className="text-[10px] font-black text-gold uppercase tracking-widest">Tambah Tahap Cerita</span>
      </button>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {compressionInfo && <p className="text-[10px] text-green-600 text-center">{compressionInfo}</p>}

      <button type="submit" disabled={isSaving || isCompressing} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
      <CompressionModal isOpen={isCompressing} current={compressProgress.current} total={compressProgress.total} currentFileName={compressProgress.fileName} />
    </form>
  );
}
