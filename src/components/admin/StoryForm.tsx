import { useState } from 'react';
import { WeddingDocument, StorySlide } from '../../types/firestore';
import { Plus, Trash2, Upload, History } from 'lucide-react';

interface StoryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function StoryForm({ data, onSave, isSaving }: StoryFormProps) {
  const [error, setError] = useState('');
  const [slides, setSlides] = useState<(StorySlide & { file?: File })[]>(
    data?.story?.map(s => ({ ...s })) ?? [{ year: '', text: '', bgImage: '' }]
  );
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);

  const addSlide = () => setSlides([...slides, { year: '', text: '', bgImage: '' }]);
  const removeSlide = (i: number) => {
    const slide = slides[i];
    if (slide.bgImage && slide.bgImage.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, slide.bgImage]);
    }
    setSlides(slides.filter((_, idx) => idx !== i));
  };
  const updateSlide = (i: number, field: keyof StorySlide, value: string) => {
    setSlides(slides.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleImageChange = (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setError('Ukuran foto maksimal 5MB'); return; }
    setError('');
    const url = URL.createObjectURL(file);
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgImage: url, file } : s));
  };

  const handleDeleteImage = (i: number) => {
    const currentUrl = slides[i].bgImage;
    if (currentUrl && currentUrl.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, currentUrl]);
    }
    setSlides(slides.map((s, idx) => idx === i ? { ...s, bgImage: '', file: undefined } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    const filtered = slides.filter(s => s.year.trim());
    filtered.forEach((s, i) => { if (s.file) files[`storyBg-${i}`] = s.file; });
    onSave(
      { story: filtered.map(({ file: _, ...s }) => s) },
      Object.keys(files).length > 0 ? files : undefined,
      urlsToDelete.length > 0 ? urlsToDelete : undefined,
    );
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gold" />
          <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Cerita Perjalanan</label>
        </div>
        <button type="button" onClick={addSlide} className="text-gold p-1 hover:scale-110 transition-transform" aria-label="Tambah slide"><Plus className="w-5 h-5" /></button>
      </div>

      {slides.map((slide, i) => (
        <div key={i} className="p-5 border border-gold/10 rounded-3xl space-y-4 bg-white/50 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] uppercase tracking-widest text-gold font-black">Tahap {i + 1}</span>
            {slides.length > 1 && (
              <button type="button" onClick={() => removeSlide(i)} className="text-red-400 p-1 hover:scale-110 transition-transform" aria-label="Hapus slide"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
          
          <div className="space-y-3 relative z-10">
            <input value={slide.year} onChange={(e) => updateSlide(i, 'year', e.target.value)} placeholder="Tahun (misal: 2016 — 2017)" maxLength={30} aria-label={`Tahun Slide ${i + 1}`} className={inputClass} />
            <textarea value={slide.text} onChange={(e) => updateSlide(i, 'text', e.target.value)} placeholder="Cerita..." rows={3} maxLength={500} aria-label={`Cerita Slide ${i + 1}`} className={`${inputClass} resize-none`} />
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink/60 font-bold block ml-1">Foto Latar</label>
              <div className="flex items-center gap-4">
                {slide.bgImage && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/20 flex-shrink-0 group/img">
                    <img src={slide.bgImage} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg z-20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
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
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
