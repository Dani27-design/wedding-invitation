'use client';
import { useState, useEffect, useRef } from 'react';
import { WeddingDocument, StorySlide } from '../../types/firestore';
import { Plus, Trash2, Upload, Film, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { compressImage, formatFileSize } from '../../utils/compressImage';
import { CompressionModal } from './CompressionModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StoryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type SlideState = StorySlide & { file?: File; videoFile?: File; videoPreview?: string };

export function StoryForm({ data, onSave, isSaving, onDirty }: StoryFormProps) {
  const [error, setError] = useState('');
  const [slides, setSlides] = useState<SlideState[]>(
    data?.story?.map(s => ({ ...s })) ?? [{ year: '', text: '', bgImage: '' }]
  );
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState('');
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [expandedSlide, setExpandedSlide] = useState<number>(0);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  // Cleanup blob URLs on unmount to free memory
  useEffect(() => {
    return () => {
      slidesRef.current.forEach((s) => {
        if (s.videoPreview) URL.revokeObjectURL(s.videoPreview);
        if (s.bgImage && s.bgImage.startsWith('blob:')) URL.revokeObjectURL(s.bgImage);
      });
    };
  }, []);

  const addSlide = () => {
    setSlides([...slides, { year: '', text: '', bgImage: '' }]);
    setExpandedSlide(slides.length);
    onDirty?.();
  };

  const removeSlide = (i: number) => {
    const slide = slides[i];
    if (slide.videoPreview) URL.revokeObjectURL(slide.videoPreview);
    if (slide.bgImage && slide.bgImage.startsWith('blob:')) URL.revokeObjectURL(slide.bgImage);
    if (slide.bgImage && slide.bgImage.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgImage!]);
    }
    if (slide.bgVideo && slide.bgVideo.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgVideo!]);
    }
    const next = slides.filter((_, idx) => idx !== i);
    setSlides(next);
    // Adjust expanded slide index
    if (expandedSlide === i) setExpandedSlide(-1);
    else if (expandedSlide > i) setExpandedSlide(expandedSlide - 1);
    onDirty?.();
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSlides(updated);
    // Follow the moved slide's expansion state
    if (expandedSlide === from) setExpandedSlide(to);
    else if (expandedSlide === to) setExpandedSlide(from);
    onDirty?.();
  };

  const updateSlide = (i: number, field: keyof StorySlide, value: string) => {
    setSlides(slides.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
    onDirty?.();
  };

  const handleImageChange = (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setError('Ukuran foto maksimal 25MB'); return; }
    setError('');
    const oldBg = slides[i]?.bgImage;
    if (oldBg && oldBg.startsWith('blob:')) URL.revokeObjectURL(oldBg);
    const url = URL.createObjectURL(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgImage: url, file } : s));
    onDirty?.();
  };

  const handleVideoChange = (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_VIDEO_SIZE) { setError(`Ukuran video maksimal 50MB. File ini ${formatFileSize(file.size)}.`); return; }
    setError('');
    const oldPreview = slides[i]?.videoPreview;
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    const url = URL.createObjectURL(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, videoPreview: url, videoFile: file } : s));
    onDirty?.();
  };

  const removeVideo = (i: number) => {
    const slide = slides[i];
    if (slide.videoPreview) URL.revokeObjectURL(slide.videoPreview);
    if (slide.bgVideo && slide.bgVideo.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgVideo!]);
    }
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgVideo: undefined, videoFile: undefined, videoPreview: undefined } : s));
    onDirty?.();
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

  const hasMedia = (slide: SlideState) => !!(slide.bgImage || slide.file);
  const hasVideo = (slide: SlideState) => !!(slide.bgVideo || slide.videoFile);

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-[0.3em] text-gold font-black">Kisah Cinta</h2>
        <span className="text-[10px] text-ink/30 font-mono">{slides.length} slide</span>
      </div>

      {slides.map((slide, i) => {
        const isExpanded = expandedSlide === i;
        const thumbSrc = slide.bgImage || '';
        const slideHasVideo = hasVideo(slide);

        return (
          <div key={i} className={`border rounded-2xl relative overflow-hidden transition-colors ${isExpanded ? 'border-gold/25 bg-white/70' : 'border-gold/10 bg-white/40'}`}>
            {/* Header — always visible */}
            <div className="flex items-center gap-2 p-3">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveSlide(i, i - 1)}
                  disabled={i === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-ink/25 hover:text-gold hover:bg-gold/5 transition-colors disabled:opacity-20 disabled:hover:text-ink/25 disabled:hover:bg-transparent"
                  aria-label={`Pindahkan slide ${i + 1} ke atas`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(i, i + 1)}
                  disabled={i === slides.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-ink/25 hover:text-gold hover:bg-gold/5 transition-colors disabled:opacity-20 disabled:hover:text-ink/25 disabled:hover:bg-transparent"
                  aria-label={`Pindahkan slide ${i + 1} ke bawah`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail — video preferred (matches what guests see), fallback to photo */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gold/10 flex-shrink-0 bg-ivory">
                {slideHasVideo ? (
                  <video
                    src={slide.videoPreview || slide.bgVideo}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                  />
                ) : thumbSrc ? (
                  <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-ink/10" />
                  </div>
                )}
                {slideHasVideo && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-ink/60 rounded-tl-md flex items-center justify-center">
                    <Film className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Info — clickable to expand */}
              <button
                type="button"
                onClick={() => setExpandedSlide(isExpanded ? -1 : i)}
                className="flex-1 min-w-0 text-left py-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-black flex-shrink-0">{i + 1}</span>
                  {slide.year && <span className="text-xs text-ink/60 truncate">{slide.year}</span>}
                  {/* Media badges */}
                  {hasMedia(slide) && <ImageIcon className="w-3 h-3 text-gold/40 flex-shrink-0" />}
                  {hasVideo(slide) && <Film className="w-3 h-3 text-gold/40 flex-shrink-0" />}
                </div>
                {slide.text && !isExpanded && (
                  <p className="text-[11px] text-ink/30 truncate mt-0.5">{slide.text}</p>
                )}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Hapus slide ${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedSlide(isExpanded ? -1 : i)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/25 hover:text-ink/50 transition-colors"
                  aria-label={isExpanded ? 'Tutup' : 'Buka'}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-gold/5 pt-3">
                <input
                  value={slide.year}
                  onChange={(e) => updateSlide(i, 'year', e.target.value)}
                  placeholder="Tahun (misal: 2016 — 2017)"
                  maxLength={30}
                  aria-label={`Tahun Slide ${i + 1}`}
                  className={inputClass}
                />
                <div>
                  <textarea
                    value={slide.text}
                    onChange={(e) => updateSlide(i, 'text', e.target.value)}
                    placeholder="Cerita..."
                    rows={4}
                    maxLength={500}
                    aria-label={`Cerita Slide ${i + 1}`}
                    className={`${inputClass} resize-none`}
                  />
                  {slide.text.length > 350 && (
                    <p className={`text-[9px] text-right mt-0.5 ${slide.text.length >= 500 ? 'text-red-500' : 'text-gold'}`}>{slide.text.length}/500</p>
                  )}
                </div>

                {/* Media uploads — compact 2-column */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Photo */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-ink/50 font-bold block">Foto Latar</label>
                    {slide.bgImage && (
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gold/15">
                        <img src={slide.bgImage} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gold/25 rounded-xl cursor-pointer hover:bg-gold/5 transition-all group/upload">
                      <Upload className="w-3 h-3 text-gold group-hover/upload:scale-110 transition-transform" />
                      <span className="text-[9px] font-black text-gold uppercase tracking-widest">{slide.bgImage ? 'Ganti' : 'Pilih Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(i, e.target.files?.[0])}
                        className="hidden"
                      />
                    </label>
                    {slide.file && <p className="text-[8px] text-ink/30 truncate font-mono text-center">{slide.file.name}</p>}
                  </div>

                  {/* Video */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-ink/50 font-bold block">Video <span className="normal-case text-ink/30">(opsional)</span></label>
                    {(slide.videoPreview || slide.bgVideo) && (
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gold/15">
                        <video src={slide.videoPreview || slide.bgVideo} className="w-full h-full object-cover" muted preload="none" />
                        <button
                          type="button"
                          onClick={() => removeVideo(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                          aria-label="Hapus video"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gold/25 rounded-xl cursor-pointer hover:bg-gold/5 transition-all group/upload">
                      <Film className="w-3 h-3 text-gold group-hover/upload:scale-110 transition-transform" />
                      <span className="text-[9px] font-black text-gold uppercase tracking-widest">{(slide.videoPreview || slide.bgVideo) ? 'Ganti' : 'Pilih Video'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoChange(i, e.target.files?.[0])}
                        className="hidden"
                      />
                    </label>
                    {slide.videoFile && <p className="text-[8px] text-ink/30 truncate font-mono text-center">{slide.videoFile.name}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addSlide}
        className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gold/5 transition-all group"
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
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus slide ini?"
        onConfirm={() => { if (deleteTarget !== null) removeSlide(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
