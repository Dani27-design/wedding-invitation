import { useState } from 'react';
import { WeddingDocument, StorySlide } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';

interface StoryFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>) => void;
  isSaving?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function StoryForm({ data, onSave, isSaving }: StoryFormProps) {
  const [error, setError] = useState('');
  const [slides, setSlides] = useState<(StorySlide & { file?: File })[]>(
    data?.story?.map(s => ({ ...s })) ?? [{ year: '', text: '', bgImage: '' }]
  );

  const addSlide = () => setSlides([...slides, { year: '', text: '', bgImage: '' }]);
  const removeSlide = (i: number) => setSlides(slides.filter((_, idx) => idx !== i));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    const filtered = slides.filter(s => s.year.trim());
    filtered.forEach((s, i) => { if (s.file) files[`storyBg-${i}`] = s.file; });
    onSave(
      { story: filtered.map(({ file: _, ...s }) => s) },
      Object.keys(files).length > 0 ? files : undefined,
    );
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Cerita Perjalanan</label>
        <button type="button" onClick={addSlide} className="text-gold" aria-label="Tambah slide"><Plus className="w-4 h-4" /></button>
      </div>

      {slides.map((slide, i) => (
        <div key={i} className="p-4 border border-gold/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/60 font-bold">Slide {i + 1}</span>
            {slides.length > 1 && (
              <button type="button" onClick={() => removeSlide(i)} className="text-red-400" aria-label="Hapus slide"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
          <input value={slide.year} onChange={(e) => updateSlide(i, 'year', e.target.value)} placeholder="Tahun (misal: 2016 — 2017)" maxLength={30} aria-label={`Tahun Slide ${i + 1}`} className={inputClass} />
          <textarea value={slide.text} onChange={(e) => updateSlide(i, 'text', e.target.value)} placeholder="Cerita..." rows={4} maxLength={500} aria-label={`Cerita Slide ${i + 1}`} className={`${inputClass} resize-none`} />
          <div>
            <label htmlFor={`story-photo-${i}`} className="text-xs text-ink/60 mb-1 block">Foto Latar</label>
            {slide.bgImage && <img src={slide.bgImage} alt={`Slide ${i + 1}`} className="w-20 h-20 object-cover rounded-xl mb-2" />}
            <input id={`story-photo-${i}`} type="file" accept="image/*" onChange={(e) => handleImageChange(i, e.target.files?.[0])} className="text-xs text-ink/60" />
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
