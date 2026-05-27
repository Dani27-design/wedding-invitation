'use client';
import { useState, useEffect, useRef } from 'react';
import { WeddingDocument, StorySlide } from '../../types/firestore';
import { Plus, Trash2, Upload, Film, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { compressImageBatch, formatFileSize } from '../../utils/compressImage';
import { CompressionModal } from './CompressionModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StoryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type SlideState = StorySlide & { file?: File; videoFile?: File; videoPreview?: string };

export function StoryForm({ data, onSave, isSaving, onDirty, step, totalSteps }: StoryFormProps) {
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
  // Track all blob URLs for guaranteed cleanup on unmount
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const createBlobUrl = (file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  };

  const revokeBlobUrl = (url: string) => {
    URL.revokeObjectURL(url);
    blobUrlsRef.current.delete(url);
  };

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  const addSlide = () => {
    setSlides([...slides, { year: '', text: '', bgImage: '' }]);
    setExpandedSlide(slides.length);
    onDirty?.();
  };

  const removeSlide = (i: number) => {
    const slide = slides[i];
    if (slide.videoPreview) revokeBlobUrl(slide.videoPreview);
    if (slide.bgImage && slide.bgImage.startsWith('blob:')) revokeBlobUrl(slide.bgImage);
    if (slide.bgImage && slide.bgImage.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgImage!]);
    }
    if (slide.bgVideo && slide.bgVideo.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgVideo!]);
    }
    const next = slides.filter((_, idx) => idx !== i);
    setSlides(next);
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
    if (oldBg && oldBg.startsWith('blob:')) revokeBlobUrl(oldBg);
    const url = createBlobUrl(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgImage: url, file } : s));
    onDirty?.();
  };

  const handleVideoChange = (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_VIDEO_SIZE) { setError(`Ukuran video maksimal 50MB. File ini ${formatFileSize(file.size)}.`); return; }
    setError('');
    const oldPreview = slides[i]?.videoPreview;
    if (oldPreview) revokeBlobUrl(oldPreview);
    const url = createBlobUrl(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, videoPreview: url, videoFile: file } : s));
    onDirty?.();
  };

  const removeVideo = (i: number) => {
    const slide = slides[i];
    if (slide.videoPreview) revokeBlobUrl(slide.videoPreview);
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
    const batchEntries = filtered
      .map((s, i) => s.file ? { key: `storyBg-${i}`, file: s.file } : null)
      .filter(Boolean) as { key: string; file: File }[];
    if (batchEntries.length > 0) {
      setIsCompressing(true);
      setCompressionInfo('');
      try {
        const result = await compressImageBatch(batchEntries, (current, total, fileName) => {
          setCompressProgress({ current, total, fileName });
        });
        Object.assign(files, result.files);
        if (result.infos.length > 0) setCompressionInfo(result.infos.join(' | '));
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

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Story slides card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03] flex items-center justify-between">
          <h3 className="font-base text-[13px] text-ink">Kisah Cinta</h3>
          <span className="text-[10px] text-ink/80 font-mono">{slides.length} slide</span>
        </div>
        <div className="p-4 space-y-3">
          {slides.map((slide, i) => {
            const isExpanded = expandedSlide === i;
            const thumbSrc = slide.bgImage || '';
            const slideHasVideo = hasVideo(slide);

            return (
              <div key={i} className={`border rounded-xl relative overflow-hidden transition-colors ${isExpanded ? 'border-gold/25 bg-ivory/30' : 'border-gold/10 bg-ivory/20'}`}>
                <div className="flex items-center gap-2 p-3">
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveSlide(i, i - 1)}
                      disabled={i === 0}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-ink/80 hover:text-gold hover:bg-gold/5 transition-colors disabled:opacity-20"
                      aria-label={`Pindahkan slide ${i + 1} ke atas`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(i, i + 1)}
                      disabled={i === slides.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-ink/80 hover:text-gold hover:bg-gold/5 transition-colors disabled:opacity-20"
                      aria-label={`Pindahkan slide ${i + 1} ke bawah`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gold/10 flex-shrink-0 bg-ivory">
                    {slideHasVideo ? (
                      <video src={slide.videoPreview || slide.bgVideo} className="w-full h-full object-cover" muted playsInline preload="metadata" crossOrigin="anonymous" />
                    ) : thumbSrc ? (
                      <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-ink/80" />
                      </div>
                    )}
                    {slideHasVideo && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-ink/60 rounded-tl-md flex items-center justify-center">
                        <Film className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={() => setExpandedSlide(isExpanded ? -1 : i)} className="flex-1 min-w-0 text-left py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-gold font-black flex-shrink-0">{i + 1}</span>
                      {slide.year && <span className="text-xs text-ink/80 truncate">{slide.year}</span>}
                      {hasMedia(slide) && <ImageIcon className="w-3 h-3 text-gold/70 flex-shrink-0" />}
                      {hasVideo(slide) && <Film className="w-3 h-3 text-gold/70 flex-shrink-0" />}
                    </div>
                    {slide.text && !isExpanded && (
                      <p className="text-[11px] text-ink/80 truncate mt-0.5">{slide.text}</p>
                    )}
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => setDeleteTarget(i)} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label={`Hapus slide ${i + 1}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setExpandedSlide(isExpanded ? -1 : i)} className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/80 hover:text-ink transition-colors" aria-label={isExpanded ? 'Tutup' : 'Buka'}>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gold/5 pt-3">
                    <div>
                      <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Tahun</label>
                      <input value={slide.year} onChange={(e) => updateSlide(i, 'year', e.target.value)} placeholder="Contoh: 2016 — 2017" maxLength={30} aria-label={`Tahun Slide ${i + 1}`} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Cerita</label>
                      <textarea value={slide.text} onChange={(e) => updateSlide(i, 'text', e.target.value)} placeholder="Cerita..." rows={4} maxLength={500} aria-label={`Cerita Slide ${i + 1}`} className={`${inputClass} resize-none`} />
                      {slide.text.length > 350 && (
                        <p className={`text-[9px] text-right mt-0.5 ${slide.text.length >= 500 ? 'text-red-500' : 'text-gold'}`}>{slide.text.length}/500</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[11px] text-ink/80 font-medium block">Foto Latar</label>
                        {slide.bgImage && (
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gold/15">
                            <img src={slide.bgImage} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gold/25 rounded-xl cursor-pointer hover:bg-gold/5 transition-all">
                          <Upload className="w-3 h-3 text-gold" />
                          <span className="text-[9px] font-black text-gold uppercase tracking-widest">{slide.bgImage ? 'Ganti' : 'Pilih Foto'}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageChange(i, e.target.files?.[0])} className="hidden" />
                        </label>
                        {slide.file && <p className="text-[9px] text-ink/80 truncate font-mono text-center">{slide.file.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] text-ink/80 font-medium block">Video <span className="text-ink/80 text-[10px]">(opsional)</span></label>
                        {(slide.videoPreview || slide.bgVideo) && (
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gold/15">
                            <video src={slide.videoPreview || slide.bgVideo} className="w-full h-full object-cover" muted playsInline preload="metadata" crossOrigin="anonymous" />
                            <button type="button" onClick={() => removeVideo(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow" aria-label="Hapus video">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gold/25 rounded-xl cursor-pointer hover:bg-gold/5 transition-all">
                          <Film className="w-3 h-3 text-gold" />
                          <span className="text-[9px] font-black text-gold uppercase tracking-widest">{(slide.videoPreview || slide.bgVideo) ? 'Ganti' : 'Pilih Video'}</span>
                          <input type="file" accept="video/*" onChange={(e) => handleVideoChange(i, e.target.files?.[0])} className="hidden" />
                        </label>
                        {slide.videoFile && <p className="text-[9px] text-ink/80 truncate font-mono text-center">{slide.videoFile.name}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button type="button" onClick={addSlide} className="w-full py-3 border-2 border-dashed border-gold/25 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold">
            <Plus className="w-4 h-4" />
            <span className="text-[11px] font-bold">Tambah Tahap Cerita</span>
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {compressionInfo && <p className="text-[10px] text-green-600 text-center">{compressionInfo}</p>}

      {step != null && totalSteps != null && totalSteps > 0 && (() => {
        const pct = Math.round(((step + 1) / totalSteps) * 100);
        const barColor = pct <= 25 ? 'bg-red-400' : pct <= 50 ? 'bg-orange-400' : pct <= 75 ? 'bg-yellow-400' : 'bg-green-500';
        return (
          <div className="space-y-1">
            <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-ink/80 text-right">{step + 1} dari {totalSteps}</p>
          </div>
        );
      })()}

      <button type="submit" disabled={isSaving || isCompressing} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button>
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
